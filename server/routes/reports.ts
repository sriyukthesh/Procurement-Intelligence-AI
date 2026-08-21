import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { evaluateTenderBids } from '../services/recommendationEngine.js';
import { calculateCompanyRisk } from '../riskEngine/scorer.js';

export const reportsRouter = Router();

// GET /api/reports/tender/:id
reportsRouter.get('/tender/:id', (req: Request, res: Response) => {
  const tenderId = req.params.id;
  const tender = db.tenders.get(tenderId);
  if (!tender) {
    return res.status(404).json({ error: 'Tender not found' });
  }

  const analysis = evaluateTenderBids(tenderId);
  const applications = Array.from(db.applications.values()).filter((a) => a.tenderId === tenderId);
  const relevantEvidence = Array.from(db.evidence.values()).filter(
    (e) => applications.some((a) => a.companyId === e.companyId)
  );

  const report = {
    reportId: `REP-TND-${tender.id.toUpperCase()}-${Date.now().toString().slice(-6)}`,
    generatedAt: new Date().toISOString(),
    classification: 'OFFICIAL SENSITIVE / PROCUREMENT DECISION SUPPORT',
    procuringEntity: tender.procuringOrganization,
    department: tender.department,
    tender: {
      id: tender.id,
      tenderReference: tender.tenderId,
      title: tender.title,
      estimatedValueCr: tender.estimatedValueCr,
      category: tender.category,
      location: tender.location,
      submissionDeadline: tender.submissionDeadline,
    },
    executiveSummary: {
      totalBidsReceived: applications.length,
      meanBidCr: analysis.meanBidCr,
      priceSpreadPercent: analysis.priceSpreadPercentage,
      recommendedBidder: analysis.recommendedBidder?.companyName || 'None',
      recommendedBidAmountCr: analysis.recommendedBidder?.bidAmountCr || 0,
      recommendedRiskScore: analysis.recommendedBidder?.riskScore || 0,
      collusionAlertsCount: analysis.collusionIndicators.length,
      anomaliesCount: analysis.anomaliesDetected.length,
    },
    rankedBidders: analysis.rankedBidders,
    collusionFindings: analysis.collusionIndicators,
    behavioralAnomalies: analysis.anomaliesDetected,
    evidenceRecords: relevantEvidence.map((e) => ({
      title: e.title,
      company: db.companies.get(e.companyId)?.legalName || e.companyId,
      source: `${e.sourceName} (Level ${e.sourceLevel})`,
      verificationStatus: e.verificationStatus,
      confidence: `${e.confidenceScore}%`,
      date: e.publicationDate,
      summary: e.evidenceText,
    })),
    disclaimer: 'CartelX provides evidence-backed decision support. Final procurement decisions remain with the authorized procurement officer.',
  };

  res.json({ report });
});

// GET /api/reports/company/:id
reportsRouter.get('/company/:id', (req: Request, res: Response) => {
  const companyId = req.params.id;
  const company = db.companies.get(companyId);
  if (!company) {
    return res.status(404).json({ error: 'Company not found' });
  }

  const risk = calculateCompanyRisk(companyId);
  const evidence = Array.from(db.evidence.values()).filter((e) => e.companyId === companyId);
  const projects = Array.from(db.projects.values()).filter((p) => p.companyId === companyId);
  const legalCases = Array.from(db.legalRecords.values()).filter((l) => l.companyId === companyId);
  const debarments = Array.from(db.debarmentRecords.values()).filter((d) => d.companyId === companyId);

  const report = {
    reportId: `REP-COMP-${company.id.toUpperCase()}-${Date.now().toString().slice(-6)}`,
    generatedAt: new Date().toISOString(),
    classification: 'CONFIDENTIAL PROCUREMENT INTELLIGENCE DOSSIER',
    company: {
      legalName: company.legalName,
      cin: company.cin,
      gstin: company.gstin,
      pan: company.pan,
      type: company.companyType,
      state: company.state,
      turnoverCr: company.annualTurnoverCr,
      yearsInBusiness: company.yearsInBusiness,
      directors: company.directors,
    },
    riskAssessment: risk,
    projectsSummary: {
      total: projects.length,
      completed: projects.filter((p) => p.status === 'COMPLETED').length,
      delayed: projects.filter((p) => p.status === 'DELAYED').length,
      terminated: projects.filter((p) => p.status === 'CANCELLED_TERMINATED').length,
    },
    legalSummary: {
      cases: legalCases,
      debarments,
    },
    evidence,
    disclaimer: 'CartelX provides evidence-backed decision support. Final procurement decisions remain with the authorized procurement officer.',
  };

  res.json({ report });
});
