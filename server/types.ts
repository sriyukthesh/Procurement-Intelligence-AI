export type Role = 'ADMIN' | 'PROCUREMENT_OFFICER' | 'COMPANY';

export type VerificationStatus = 'VERIFIED' | 'REPORTED' | 'UNVERIFIED' | 'NO_RECORD_FOUND';

export type SourceType = 
  | 'OFFICIAL' 
  | 'GOVERNMENT_DOCUMENT' 
  | 'COURT' 
  | 'REGULATORY' 
  | 'NEWS' 
  | 'WEB' 
  | 'DEMO_DATA';

export type SourceLevel = 1 | 2 | 3 | 4; // 1=Official, 2=Gov Docs, 3=Reputable News, 4=Web/Other

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type FindingType = 
  | 'BID_RIGGING_COLLUSION'
  | 'PRICE_SIMILARITY'
  | 'TIMING_ANOMALY'
  | 'BID_ROTATION'
  | 'PROJECT_DELAY'
  | 'CONTRACT_TERMINATION'
  | 'COURT_CASE'
  | 'REGULATORY_ACTION'
  | 'DEBARMENT_RECORD'
  | 'NEWS_ALLEGATION'
  | 'FINANCIAL_IRREGULARITY'
  | 'POSITIVE_COMPLETION'
  | 'CLEAN_RECORD';

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: Role;
  organization?: string;
  companyId?: string;
  createdAt: string;
}

export interface ReportedHighRiskCompany {
  id: string;
  companyId?: string;
  companyName: string;
  cin?: string;
  gstin?: string;
  tenderId?: string;
  tenderTitle?: string;
  riskScore: number;
  riskLevel: RiskLevel;
  primaryViolations: string[];
  recommendation: string;
  reportedAt: string;
  reportedBy: string;
  status: 'PENDING_REVIEW' | 'REVIEWED' | 'DISQUALIFIED' | 'CLEARED';
}

export interface Company {
  id: string;
  legalName: string;
  cin: string;
  gstin: string;
  pan: string;
  companyType: string;
  parentCompany?: string; // Ultimate holding company / Group Conglomerate
  ultimateBeneficialOwner?: string; // Controlling promoter / UBO
  registeredSector?: string; // MCA21 Registered Primary Sector (e.g. Civil Construction)
  nicCode?: string; // 5-digit National Industrial Classification Code
  registrationDate: string;
  registeredAddress: string;
  state: string;
  district: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  authorizedRepresentative: string;
  directors: Array<{ name: string; din?: string; designation: string }>;
  industry: string;
  description: string;
  annualTurnoverCr: number;
  yearsInBusiness: number;
  isDemo: boolean;
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'SUSPENDED';
  riskScore?: number;
  riskLevel?: RiskLevel;
  behavioralRisk?: number;
  collusionRisk?: number;
}

export interface TenderRequirement {
  minExperienceYears: number;
  minAnnualTurnoverCr: number;
  requiredCertificates: string[];
  mandatoryDocuments: string[];
  technicalCriteria: string[];
}

export interface Tender {
  id: string;
  tenderId: string;
  title: string;
  description: string;
  procuringOrganization: string;
  department: string;
  category: 'INFRASTRUCTURE' | 'HEALTHCARE' | 'IT_SOFTWARE' | 'WATER_SANITATION' | 'ENERGY' | 'LOGISTICS';
  estimatedValueCr: number;
  location: string;
  issueDate: string;
  submissionDeadline: string;
  status: 'PUBLISHED' | 'EVALUATING' | 'ANALYZED' | 'AWARDED' | 'CLOSED';
  requirements: TenderRequirement;
  awardedToCompanyId?: string;
  awardedAmountCr?: number;
  awardJustification?: string;
  isDemo: boolean;
}

export interface TenderApplication {
  id: string;
  tenderId: string;
  companyId: string;
  companyName?: string;
  cin?: string;
  gstin?: string;
  pan?: string;
  directors?: string;
  state?: string;
  registeredAddress?: string;
  industry?: string;
  bidAmountCr: number;
  submissionTimestamp: string;
  technicalResponseSummary: string;
  financialResponseSummary: string;
  turnoverReportedCr: number;
  experienceYearsReported: number;
  uploadedDocuments: Array<{
    id?: string;
    fileName: string;
    fileType: string;
    fileSizeKb: number;
    docCategory: string;
    verified: boolean;
    fileDataUrl?: string;
    uploadedAt?: string;
  }>;
  authorizedRepresentative: string;
  declarationAccepted: boolean;
  qualificationStatus: 'PENDING' | 'PASS' | 'FAIL';
  qualificationNotes?: string;
  statutoryVerificationStatus?: 'VERIFIED' | 'CAUTION' | 'DISQUALIFIED';
  statutoryVerificationResult?: any;
}

export interface Evidence {
  id: string;
  companyId: string;
  tenderId?: string;
  findingType: FindingType;
  title: string;
  description: string;
  sourceName: string;
  sourceUrl?: string;
  sourceType: SourceType;
  sourceLevel: SourceLevel;
  sourceReliability: number; // 0-100
  publicationDate: string;
  retrievedAt: string;
  evidenceText: string;
  verificationStatus: VerificationStatus;
  confidenceScore: number; // 0-100
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
}

export interface ProjectRecord {
  id: string;
  companyId: string;
  projectName: string;
  clientOrganization: string;
  awardedValueCr: number;
  awardDate: string;
  scheduledCompletionDate: string;
  actualCompletionDate?: string;
  status: 'COMPLETED' | 'ONGOING' | 'DELAYED' | 'CANCELLED_TERMINATED' | 'UNKNOWN';
  delayMonths?: number;
  delayReason?: string;
  performanceNotes: string;
}

export interface LegalRecord {
  id: string;
  companyId: string;
  caseNumber: string;
  courtName: string;
  filingDate: string;
  caseType: 'TENDER_DISPUTE' | 'CONTRACT_BREACH' | 'ARBITRATION' | 'TAX_DISPUTE' | 'OTHER';
  petitioner: string;
  respondent: string;
  status: 'PENDING' | 'DISPOSED' | 'APPEALED';
  summary: string;
  outcome?: string;
}

export interface RegulatoryRecord {
  id: string;
  companyId: string;
  authority: 'CCI' | 'SEBI' | 'MCA' | 'GST' | 'OTHER';
  caseRef: string;
  date: string;
  matter: string;
  finding: 'PENALTY_IMPOSED' | 'INQUIRY_INITIATED' | 'DISMISSED' | 'WARNING_ISSUED' | 'NO_ADVERSE_RECORD';
  penaltyAmountCr?: number;
  summary: string;
}

export interface DebarmentRecord {
  id: string;
  companyId: string;
  authority: string;
  debarmentPeriodStart: string;
  debarmentPeriodEnd: string;
  reason: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  gazetteOrderRef?: string;
}

export interface RiskBreakdown {
  behavioralRisk: number; // 0-100 (scaled by weight)
  collusionRisk: number;
  companyHistoryRisk: number;
  projectPerformanceRisk: number;
  legalRegulatoryRisk: number;
  debarmentRisk: number;
  totalScore: number; // 0-100
  riskLevel: RiskLevel;
  confidenceScore: number; // 0-100
  keyFactors: string[];
  positiveFactors: string[];
  dataCoverage: {
    sourcesSearched: string[];
    missingSources: string[];
    coveragePercentage: number;
  };
}

export interface RiskWeights {
  behavioralWeight: number; // default 0.25
  collusionWeight: number; // default 0.25
  companyHistoryWeight: number; // default 0.15
  projectPerformanceWeight: number; // default 0.15
  legalRegulatoryWeight: number; // default 0.10
  debarmentWeight: number; // default 0.10
}

export interface RiskThresholds {
  lowMax: number; // 29
  mediumMax: number; // 59
  highMax: number; // 79
}

export interface BidAnalysisResult {
  tenderId: string;
  analyzedAt: string;
  bidsCount: number;
  estimatedValueCr: number;
  meanBidCr: number;
  minBidCr: number;
  maxBidCr: number;
  priceSpreadPercentage: number;
  timingClusterDetected: boolean;
  timingClusterWindowMinutes: number;
  anomaliesDetected: Array<{
    companyId: string;
    companyName: string;
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    explanation: string;
  }>;
  collusionIndicators: Array<{
    pair: [string, string];
    pairNames: [string, string];
    coParticipationCount: number;
    priceDeltaPercentage: number;
    timeDeltaSeconds: number;
    potentialBidRotation: boolean;
    indicatorDescription: string;
    evidenceConfidence: number;
  }>;
  rankedBidders: Array<{
    companyId: string;
    companyName: string;
    cin: string;
    bidAmountCr: number;
    deviationFromEstimatedPercent: number;
    submissionTime: string;
    qualificationStatus: 'PASS' | 'FAIL' | 'PENDING';
    riskScore: number;
    riskLevel: RiskLevel;
    breakdown: RiskBreakdown;
    isRecommended: boolean;
    recommendationRank: number;
  }>;
  recommendedBidder?: {
    companyId: string;
    companyName: string;
    bidAmountCr: number;
    riskScore: number;
    rationale: string[];
    caveats: string[];
  };
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'COMPANY' | 'TENDER' | 'PROJECT' | 'CASE' | 'DEPARTMENT' | 'DIRECTOR' | 'EVIDENCE';
  riskLevel?: RiskLevel;
  details?: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: 'PARTICIPATED_IN' | 'WON' | 'LOST' | 'WORKED_ON' | 'DELAYED' | 'INVOLVED_IN' | 'REPEATED_WITH' | 'RELATED_TO' | 'SHARED_DIRECTOR';
  weight?: number;
  isSuspicious?: boolean;
  notes?: string;
}

export interface RelationshipGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface SourceConnectorStatus {
  id: string;
  name: string;
  category: string;
  sourceLevel: SourceLevel;
  status: 'ACTIVE_LIVE' | 'DEMO_MODE' | 'UNAVAILABLE';
  lastPing: string;
  reliabilityScore: number;
  recordsIndexed: number;
  notes: string;
}

export interface PastTenderRecord {
  id: string;
  projectTitle: string;
  issuingAuthority: string;
  contractValueCr: number;
  yearAwarded: number;
  completionYear?: number;
  status: 'COMPLETED_ON_TIME' | 'COMPLETED_WITH_DELAY' | 'IN_PROGRESS' | 'TERMINATED_DISPUTED';
  delayMonths?: number;
  performanceRating: number; // e.g. 4.8 / 5.0
  summary: string;
}

export interface StatutoryCheckResult {
  authority: string;
  checkName: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  details: string;
  sourceType: string;
  reliability: number;
}

export interface RealCompanyVerificationInput {
  companyName: string;
  cin?: string;
  gstin?: string;
  pan?: string;
  directors?: string;
  bidAmountCr?: number;
  tenderId?: string;
  annualTurnoverCr?: number;
  yearsInBusiness?: number;
  registeredAddress?: string;
  state?: string;
  parentCompany?: string;
  registeredSector?: string;
  nicCode?: string;
}

export interface RealCompanyVerificationResult {
  company: Company;
  tenderId?: string;
  tenderTitle?: string;
  estimatedValueCr?: number;
  bidAmountCr: number;
  bidDeviationPercent: number;

  // Parent Company & Sector Intelligence
  parentCompany?: string;
  ultimateBeneficialOwner?: string;
  registeredSector?: string;
  nicCode?: string;
  targetTenderSector?: string;

  // Collusion & Sector Mismatch Detection Flags
  parentCompanyOverlapDetected: boolean;
  parentCompanyOverlapDetails?: string;
  colludingSisterCompanies?: string[];

  sectorMismatchDetected: boolean;
  sectorMismatchSeverity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  sectorMismatchDetails?: string;
  domainDiscrepancyPercent: number;

  statutoryChecks: StatutoryCheckResult[];
  pastTenders: PastTenderRecord[];
  pastTendersSummary: {
    totalEvaluated: number;
    completedOnTime: number;
    delayed: number;
    disputedOrTerminated: number;
    averagePerformanceRating: number;
    cumulativeDeliveredValueCr: number;
  };
  riskScore: number;
  riskLevel: RiskLevel;
  riskBreakdown: {
    statutoryComplianceRisk: number;
    financialCapacityRisk: number;
    pastTendersDeliveryRisk: number;
    collusionAndDinRisk: number;
    parentCompanyCollusionRisk: number; // Penalty for same parent company across competing bidders
    sectorMismatchRisk: number;         // Penalty for cross-sector / domain mismatch bidding
    litigationDebarmentRisk: number;
    bidVarianceRisk: number;
  };
  allocationDecision: 'RECOMMENDED_FOR_ALLOTMENT' | 'PROCEED_WITH_CAUTION' | 'DO_NOT_ALLOT_DISQUALIFY';
  decisionHeadline: string;
  decisionRationale: string[];
  caveatsAndConditions: string[];
  evidenceItems: Array<{
    title: string;
    source: string;
    sourceType: string;
    status: string;
    description: string;
    severity: string;
  }>;
  graphData: RelationshipGraphData;
  auditorDossier: {
    dossierId: string;
    generatedAt: string;
    verifiedBy: string;
    cryptographicHash: string;
    statutorySummary: string;
    officerSignOffNotes: string;
  };
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}
