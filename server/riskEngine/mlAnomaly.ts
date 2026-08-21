import { TenderApplication, Tender } from '../types.js';
import { db } from '../db.js';

export interface BidderFeatures {
  companyId: string;
  bidAmountCr: number;
  deviationFromEstimatedPercent: number;
  deviationFromMeanPercent: number;
  minPairwiseDeltaPercent: number;
  secondsBeforeDeadline: number;
  submissionClusterScore: number; // 0 - 1
  turnoverRatio: number;
  anomalyScore: number; // 0 - 100
  anomalySeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  explanations: string[];
}

export function extractBidderFeatures(
  applications: TenderApplication[],
  tender: Tender
): Map<string, BidderFeatures> {
  const result = new Map<string, BidderFeatures>();
  if (applications.length === 0) return result;

  const estimated = tender.estimatedValueCr;
  const bids = applications.map((a) => a.bidAmountCr);
  const meanBid = bids.reduce((acc, b) => acc + b, 0) / bids.length;
  const deadlineMs = new Date(tender.submissionDeadline).getTime();

  // Parse timestamps
  const timestamps = applications.map((a) => new Date(a.submissionTimestamp).getTime());

  applications.forEach((app, idx) => {
    const company = db.companies.get(app.companyId);
    const bid = app.bidAmountCr;
    const devEstimated = ((bid - estimated) / estimated) * 100;
    const devMean = ((bid - meanBid) / meanBid) * 100;

    // Pairwise minimum price delta with any other bidder
    let minPriceDelta = 100;
    applications.forEach((otherApp, oIdx) => {
      if (idx !== oIdx) {
        const delta = (Math.abs(bid - otherApp.bidAmountCr) / Math.min(bid, otherApp.bidAmountCr)) * 100;
        if (delta < minPriceDelta) {
          minPriceDelta = delta;
        }
      }
    });

    // Timing proximity score
    const appTime = timestamps[idx];
    const secondsBeforeDeadline = Math.max(0, Math.floor((deadlineMs - appTime) / 1000));
    
    // Check if within 5 minutes of another bidder
    let minTimeDiffSec = Number.MAX_SAFE_INTEGER;
    applications.forEach((otherApp, oIdx) => {
      if (idx !== oIdx) {
        const diff = Math.abs(appTime - timestamps[oIdx]) / 1000;
        if (diff < minTimeDiffSec) {
          minTimeDiffSec = diff;
        }
      }
    });

    let timingClusterScore = 0;
    if (minTimeDiffSec < 120) {
      timingClusterScore = 0.95; // Within 2 minutes
    } else if (minTimeDiffSec < 300) {
      timingClusterScore = 0.75; // Within 5 minutes
    } else if (minTimeDiffSec < 900) {
      timingClusterScore = 0.40;
    }

    // Turnover capacity
    const turnover = company ? company.annualTurnoverCr : 100;
    const turnoverRatio = bid / turnover;

    // Multi-factor anomaly calculation (statistical scoring)
    const explanations: string[] = [];
    let anomalyScore = 15; // base baseline

    // 1. Extreme price similarity (< 0.5% difference)
    if (minPriceDelta < 0.5) {
      anomalyScore += 35;
      explanations.push(`Suspiciously narrow price delta (${minPriceDelta.toFixed(2)}%) with another concurrent bidder.`);
    } else if (minPriceDelta < 1.5) {
      anomalyScore += 20;
      explanations.push(`Tight price clustering (${minPriceDelta.toFixed(2)}%) compared to typical procurement variance.`);
    }

    // 2. High timing synchronization
    if (timingClusterScore > 0.8) {
      anomalyScore += 25;
      explanations.push(`Synchronized bid submission within ${Math.floor(minTimeDiffSec)} seconds of a competing bidder.`);
    }

    // 3. Last-minute bid rush
    if (secondsBeforeDeadline < 300) {
      anomalyScore += 15;
      explanations.push(`Bid submitted in final ${Math.floor(secondsBeforeDeadline / 60)} minutes before deadline closing.`);
    }

    // 4. Predatory or extreme discount pricing
    if (devEstimated < -10.0) {
      anomalyScore += 20;
      explanations.push(`Aggressive discount (${devEstimated.toFixed(1)}% below estimated tender value) raises non-completion risk.`);
    }

    // 5. High contract-to-turnover ratio
    if (turnoverRatio > 0.8) {
      anomalyScore += 15;
      explanations.push(`Bid value represents ${Math.round(turnoverRatio * 100)}% of reported annual company turnover.`);
    }

    // Clamp score
    anomalyScore = Math.min(100, Math.max(0, anomalyScore));

    let anomalySeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (anomalyScore >= 75) anomalySeverity = 'CRITICAL';
    else if (anomalyScore >= 55) anomalySeverity = 'HIGH';
    else if (anomalyScore >= 35) anomalySeverity = 'MEDIUM';

    result.set(app.companyId, {
      companyId: app.companyId,
      bidAmountCr: bid,
      deviationFromEstimatedPercent: Number(devEstimated.toFixed(2)),
      deviationFromMeanPercent: Number(devMean.toFixed(2)),
      minPairwiseDeltaPercent: Number(minPriceDelta.toFixed(2)),
      secondsBeforeDeadline,
      submissionClusterScore: timingClusterScore,
      turnoverRatio: Number(turnoverRatio.toFixed(2)),
      anomalyScore: Math.round(anomalyScore),
      anomalySeverity,
      explanations: explanations.length > 0 ? explanations : ['Bid pricing and timing within standard statistical distribution bounds.'],
    });
  });

  return result;
}
