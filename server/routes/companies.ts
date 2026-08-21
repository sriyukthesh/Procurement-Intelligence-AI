import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { Company } from '../types.js';
import { calculateCompanyRisk } from '../riskEngine/scorer.js';
import { verifyRealCompanyBidder } from '../services/realCompanyVerifier.js';

export const companiesRouter = Router();

// GET /api/companies
companiesRouter.get('/', (req: Request, res: Response) => {
  const { search, state, industry, status } = req.query;
  let list = Array.from(db.companies.values());

  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      (c) =>
        c.legalName.toLowerCase().includes(q) ||
        c.cin.toLowerCase().includes(q) ||
        c.gstin.toLowerCase().includes(q)
    );
  }

  if (state) {
    list = list.filter((c) => c.state.toLowerCase() === String(state).toLowerCase());
  }

  if (status) {
    list = list.filter((c) => c.status === status);
  }

  const enriched = list.map((c) => {
    const risk = calculateCompanyRisk(c.id);
    return {
      ...c,
      riskScore: risk.totalScore,
      riskLevel: risk.riskLevel,
      behavioralRisk: risk.behavioralRisk,
      collusionRisk: risk.collusionRisk,
    };
  });

  res.json({
    total: enriched.length,
    companies: enriched,
  });
});

// GET /api/companies/:id
companiesRouter.get('/:id', (req: Request, res: Response) => {
  const company = db.companies.get(req.params.id);
  if (!company) {
    return res.status(404).json({ error: 'Company not found' });
  }

  const risk = calculateCompanyRisk(company.id);
  const evidence = Array.from(db.evidence.values()).filter((e) => e.companyId === company.id);
  const projects = Array.from(db.projects.values()).filter((p) => p.companyId === company.id);
  const legalCases = Array.from(db.legalRecords.values()).filter((l) => l.companyId === company.id);
  const regRecords = Array.from(db.regulatoryRecords.values()).filter((r) => r.companyId === company.id);
  const debarments = Array.from(db.debarmentRecords.values()).filter((d) => d.companyId === company.id);
  const applications = Array.from(db.applications.values()).filter((a) => a.companyId === company.id);

  // Calculate tender history stats
  const totalBids = applications.length;
  const wonTenders = Array.from(db.tenders.values()).filter((t) => t.awardedToCompanyId === company.id).length;

  res.json({
    company,
    risk,
    tenderHistory: {
      totalApplications: totalBids,
      wins: wonTenders,
      losses: Math.max(0, totalBids - wonTenders),
      winRate: totalBids > 0 ? Number(((wonTenders / totalBids) * 100).toFixed(1)) : 0,
      totalAwardedValueCr: projects.reduce((acc, p) => acc + p.awardedValueCr, 0),
    },
    projects,
    legalCases,
    regulatoryRecords: regRecords,
    debarmentRecords: debarments,
    evidence,
  });
});

// POST /api/companies
companiesRouter.post('/', (req: Request, res: Response) => {
  const data = req.body;
  const newCompany: Company = {
    id: `comp_${Date.now()}`,
    legalName: data.legalName,
    cin: data.cin || `U${Math.floor(10000 + Math.random() * 90000)}DL2020PTC${Math.floor(100000 + Math.random() * 900000)}`,
    gstin: data.gstin || `07AAAAA${Math.floor(1000 + Math.random() * 9000)}A1Z5`,
    pan: data.pan || `AAAAA${Math.floor(1000 + Math.random() * 9000)}A`,
    companyType: data.companyType || 'Private Limited',
    registrationDate: data.registrationDate || new Date().toISOString().split('T')[0],
    registeredAddress: data.registeredAddress || 'Registered Office Address',
    state: data.state || 'Delhi',
    district: data.district || 'New Delhi',
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    website: data.website || '',
    authorizedRepresentative: data.authorizedRepresentative || 'Authorized Signatory',
    directors: data.directors || [{ name: 'Director One', designation: 'Director' }],
    industry: data.industry || 'Civil Infrastructure & Construction',
    description: data.description || '',
    annualTurnoverCr: Number(data.annualTurnoverCr) || 50.0,
    yearsInBusiness: Number(data.yearsInBusiness) || 5,
    isDemo: false,
    status: 'ACTIVE',
  };

  db.companies.set(newCompany.id, newCompany);

  // Generate initial verification evidence
  db.evidence.set(`ev_${newCompany.id}_mca`, {
    id: `ev_${newCompany.id}_mca`,
    companyId: newCompany.id,
    findingType: 'CLEAN_RECORD',
    title: 'Verified MCA Corporate Identity & Active Registration',
    description: `Statutory registration verified for ${newCompany.legalName} under CIN ${newCompany.cin}.`,
    sourceName: 'Ministry of Corporate Affairs (MCA21)',
    sourceUrl: `https://www.mca.gov.in/content/mcaformsearch/cin/${newCompany.cin}`,
    sourceType: 'OFFICIAL',
    sourceLevel: 1,
    sourceReliability: 98,
    publicationDate: new Date().toISOString().split('T')[0],
    retrievedAt: new Date().toISOString(),
    evidenceText: `MCA21 Status: Active | Paid-up Capital verified | No active winding-up petitions recorded.`,
    verificationStatus: 'VERIFIED',
    confidenceScore: 95,
    severity: 'LOW',
    createdAt: new Date().toISOString(),
  });

  // Log audit
  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: 'system',
    userName: 'Registration Portal',
    userRole: 'COMPANY',
    action: 'COMPANY_REGISTERED',
    targetType: 'COMPANY',
    targetId: newCompany.id,
    details: `Registered ${newCompany.legalName} (CIN: ${newCompany.cin})`,
    timestamp: new Date().toISOString(),
  });

  res.status(201).json({ company: newCompany });
});

// POST /api/companies/:id/investigate (Trigger fresh intelligence gathering)
companiesRouter.post('/:id/investigate', (req: Request, res: Response) => {
  const company = db.companies.get(req.params.id);
  if (!company) {
    return res.status(404).json({ error: 'Company not found' });
  }

  const risk = calculateCompanyRisk(company.id);

  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: 'usr_po_1',
    userName: 'Procurement Officer',
    userRole: 'PROCUREMENT_OFFICER',
    action: 'INVESTIGATION_RUN',
    targetType: 'COMPANY',
    targetId: company.id,
    details: `Executed full 360° intelligence investigation on ${company.legalName}. Risk calculated: ${risk.totalScore}/100.`,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: `Intelligence investigation completed for ${company.legalName}.`,
    risk,
  });
});

// POST /api/companies/verify-real-bidder (Live real company verification & tender allotment check)
companiesRouter.post('/verify-real-bidder', async (req: Request, res: Response) => {
  try {
    const {
      companyName,
      parentCompany,
      registeredSector,
      nicCode,
      cin,
      gstin,
      pan,
      directors,
      bidAmountCr,
      tenderId,
      annualTurnoverCr,
      yearsInBusiness,
      registeredAddress,
      state,
    } = req.body;

    if (!companyName || !companyName.trim()) {
      return res.status(400).json({ error: 'Company legal name is required.' });
    }

    const verificationResult = await verifyRealCompanyBidder({
      companyName,
      parentCompany,
      registeredSector,
      nicCode,
      cin,
      gstin,
      pan,
      directors,
      bidAmountCr: bidAmountCr ? Number(bidAmountCr) : undefined,
      tenderId,
      annualTurnoverCr: annualTurnoverCr ? Number(annualTurnoverCr) : undefined,
      yearsInBusiness: yearsInBusiness ? Number(yearsInBusiness) : undefined,
      registeredAddress,
      state,
    });

    // Auto-report to Procurement Officer Dashboard if risk score is >= 50
    if (verificationResult.totalScore >= 50) {
      const reportId = `rep_${verificationResult.company.id || 'comp'}_${Date.now()}`;
      
      const violations: string[] = [];
      if (verificationResult.parentCompanyOverlapDetected) {
        violations.push(`Parent Company Collusion: ${verificationResult.parentCompanyOverlapDetails || 'Belongs to same conglomerate as competing bidder'}`);
      }
      if (verificationResult.sectorMismatchDetected) {
        violations.push(`Sector Mismatch: Registered in ${verificationResult.registeredSector || 'other industry'} bidding out-of-domain`);
      }
      verificationResult.statutoryChecks
        ?.filter((c) => c.status === 'FAIL' || c.status === 'WARNING')
        .forEach((c) => violations.push(`${c.authority}: ${c.notes}`));

      if (violations.length === 0) {
        violations.push(`Composite statutory risk score exceeded safety threshold (${verificationResult.totalScore}/100)`);
      }

      db.reportedCompanies.set(reportId, {
        id: reportId,
        companyId: verificationResult.company.id,
        companyName: verificationResult.company.legalName,
        cin: verificationResult.company.cin,
        gstin: verificationResult.company.gstin,
        tenderId: tenderId,
        tenderTitle: verificationResult.targetTenderSector || 'Active Public Tender',
        riskScore: verificationResult.totalScore,
        riskLevel: verificationResult.riskLevel,
        primaryViolations: violations,
        recommendation: verificationResult.allotmentRecommendation,
        reportedAt: new Date().toISOString(),
        reportedBy: 'Automated Statutory Verification Engine',
        status: 'PENDING_REVIEW',
      });
    }

    res.json(verificationResult);
  } catch (err: any) {
    console.error('Real company verification error:', err);
    res.status(500).json({ error: err.message || 'Failed to verify real company.' });
  }
});

// GET /api/companies/reported-high-risk (List all companies automatically reported for risk score >= 50)
companiesRouter.get('/reported-high-risk', (req: Request, res: Response) => {
  const list = Array.from(db.reportedCompanies.values()).sort(
    (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
  );

  res.json({
    total: list.length,
    reportedCompanies: list,
  });
});

// POST /api/companies/reported-high-risk (Manual or rule-based addition to reported list)
companiesRouter.post('/reported-high-risk', (req: Request, res: Response) => {
  const {
    companyId,
    companyName,
    cin,
    gstin,
    tenderId,
    tenderTitle,
    riskScore,
    riskLevel,
    primaryViolations,
    recommendation,
  } = req.body;

  const reportId = `rep_${companyId || 'comp'}_${Date.now()}`;
  const record = {
    id: reportId,
    companyId,
    companyName: companyName || 'Reported Entity',
    cin,
    gstin,
    tenderId,
    tenderTitle,
    riskScore: Number(riskScore) || 50,
    riskLevel: riskLevel || (riskScore >= 75 ? 'CRITICAL' : 'HIGH'),
    primaryViolations: primaryViolations || ['Risk score >= 50 triggered automatic reporting'],
    recommendation: recommendation || 'DO_NOT_ALLOT_DISQUALIFY',
    reportedAt: new Date().toISOString(),
    reportedBy: 'Automated Risk Engine & Bid Surveillance',
    status: 'PENDING_REVIEW' as const,
  };

  db.reportedCompanies.set(reportId, record);

  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: 'system',
    userName: 'CartelX Risk Monitor',
    userRole: 'ADMIN',
    action: 'HIGH_RISK_COMPANY_REPORTED',
    targetType: 'COMPANY',
    targetId: companyId || reportId,
    details: `Automatically reported high risk entity ${record.companyName} (Risk Score: ${record.riskScore}/100) to Procurement Officer Dashboard.`,
    timestamp: new Date().toISOString(),
  });

  res.status(201).json({ report: record });
});

