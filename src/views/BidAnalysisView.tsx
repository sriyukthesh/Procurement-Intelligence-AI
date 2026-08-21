import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BidAnalysisResult, Tender } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { BidTimingChart } from '../components/charts/BidTimingChart';
import { BidPriceComparisonChart } from '../components/charts/BidPriceComparisonChart';
import { RiskBreakdownChart } from '../components/charts/RiskBreakdownChart';
import {
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  GitFork,
  Award,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  ArrowRight,
  TrendingDown,
  Clock,
  RotateCw,
} from 'lucide-react';

interface BidAnalysisProps {
  tenderId: string;
  onNavigate: (view: string, tenderId?: string, companyId?: string) => void;
}

export const BidAnalysisView: React.FC<BidAnalysisProps> = ({ tenderId, onNavigate }) => {
  const [tender, setTender] = useState<Tender | null>(null);
  const [analysis, setAnalysis] = useState<BidAnalysisResult | null>(null);
  const [rawApplications, setRawApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBidder, setSelectedBidder] = useState<any | null>(null);

  useEffect(() => {
    runAnalysis();
  }, [tenderId]);

  async function runAnalysis() {
    try {
      setLoading(true);
      const [tData, aData] = await Promise.all([
        api.getTender(tenderId),
        api.analyzeTender(tenderId),
      ]);
      setTender(tData.tender);
      setRawApplications(tData.applications || []);
      setAnalysis(aData.analysis);
      if (aData.analysis?.rankedBidders?.length > 0) {
        setSelectedBidder(aData.analysis.rankedBidders[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !analysis || !tender) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <RotateCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <div className="text-sm font-semibold text-slate-700">
          Running CartelX Behavioral Anomaly & Collusion Analysis Engine...
        </div>
        <div className="text-xs text-slate-400">
          Checking price dispersion, timing synchronizations, and cross-tender historical co-participation
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
              {tender.tenderId}
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              AI RISK ENGINE v1.0
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">
            Behavioral Anomaly & Collusion Surveillance: {tender.title}
          </h1>
          <p className="text-xs text-slate-500">
            Analyzed {analysis.bidsCount} submitted bids against estimated benchmark of ₹{tender.estimatedValueCr} Cr.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('relationship_graph', tender.id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Syndicate Graph</span>
          </button>

          <button
            onClick={() => onNavigate('recommendations', tender.id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Official Recommendation</span>
          </button>
        </div>
      </div>

      {/* Detected Collusion Syndicate Alerts */}
      {analysis.collusionIndicators.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Detected Pairwise Collusion & Bid-Rigging Indicators</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.collusionIndicators.map((col, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-rose-950 text-xs">
                    <span>{col.pairNames[0]}</span>
                    <span className="text-slate-400">&</span>
                    <span>{col.pairNames[1]}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-200/80 text-rose-900">
                    {col.evidenceConfidence}% CONFIDENCE
                  </span>
                </div>

                <p className="text-xs text-rose-900/90 leading-relaxed font-sans">
                  {col.indicatorDescription}
                </p>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-rose-200/70 text-[11px] font-mono">
                  <div>
                    <span className="text-rose-700/80 text-[10px] block font-sans">Price Delta:</span>
                    <span className="font-bold text-rose-950">{col.priceDeltaPercentage}%</span>
                  </div>
                  <div>
                    <span className="text-rose-700/80 text-[10px] block font-sans">Time Delta:</span>
                    <span className="font-bold text-rose-950">{col.timeDeltaSeconds} sec</span>
                  </div>
                  <div>
                    <span className="text-rose-700/80 text-[10px] block font-sans">Joint Bids:</span>
                    <span className="font-bold text-rose-950">{col.coParticipationCount} previous</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Visualizations: Pricing Dispersion & Timing Sync */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BidPriceComparisonChart
          bids={analysis.rankedBidders.map((b) => ({
            companyName: b.companyName,
            bidAmountCr: b.bidAmountCr,
            deviationFromEstimatedPercent: b.deviationFromEstimatedPercent,
            riskScore: b.riskScore,
          }))}
          estimatedValueCr={tender.estimatedValueCr}
        />

        <BidTimingChart
          applications={rawApplications}
          deadline={tender.submissionDeadline}
        />
      </div>

      {/* Full Ranked Bidders Evaluation Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Comprehensive Bidder Ranking & Risk Evaluation Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by Qualification Safety &amp; Lowest CartelX Procurement Risk Score.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Bidding Company</th>
                <th className="py-3 px-3">Bid Amount</th>
                <th className="py-3 px-3">Dev. vs Est.</th>
                <th className="py-3 px-3">Qualification</th>
                <th className="py-3 px-3">Risk Assessment</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analysis.rankedBidders.map((b) => (
                <tr
                  key={b.companyId}
                  onClick={() => setSelectedBidder(b)}
                  className={`hover:bg-slate-50/60 cursor-pointer transition-all ${
                    selectedBidder?.companyId === b.companyId ? 'bg-indigo-50/40' : ''
                  }`}
                >
                  <td className="py-3 px-3 font-mono font-bold text-slate-700">
                    #{b.recommendationRank}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">{b.companyName}</span>
                      {b.isRecommended && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                          RECOMMENDED
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">{b.cin}</div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    ₹{b.bidAmountCr.toFixed(2)} Cr
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span
                      className={
                        b.deviationFromEstimatedPercent < -10
                          ? 'text-rose-600 font-bold'
                          : b.deviationFromEstimatedPercent < 0
                          ? 'text-emerald-700 font-medium'
                          : 'text-amber-700'
                      }
                    >
                      {b.deviationFromEstimatedPercent}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {b.qualificationStatus === 'PASS' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> QUALIFIED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        <XCircle className="w-3 h-3" /> DISQUALIFIED
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <RiskBadge score={b.riskScore} level={b.riskLevel} />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('company_360', undefined, b.companyId);
                      }}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                    >
                      360° Profile &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Bidder Risk Breakdown Inspection */}
      {selectedBidder && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RiskBreakdownChart
            breakdown={selectedBidder.breakdown}
            companyName={selectedBidder.companyName}
          />

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">
              Risk Factors &amp; Data Verification Overview
            </h3>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
                Primary Risk Indicators:
              </span>
              <ul className="space-y-1.5">
                {selectedBidder.breakdown.keyFactors.map((f: string, i: number) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Positive Mitigating Factors:
              </span>
              <ul className="space-y-1.5">
                {selectedBidder.breakdown.positiveFactors.map((p: string, i: number) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Data Coverage: {selectedBidder.breakdown.dataCoverage.coveragePercentage}%</span>
              <span>Confidence: {selectedBidder.breakdown.confidenceScore}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
