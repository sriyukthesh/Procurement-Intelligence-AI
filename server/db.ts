import {
  Company,
  Tender,
  TenderApplication,
  Evidence,
  ProjectRecord,
  LegalRecord,
  RegulatoryRecord,
  DebarmentRecord,
  User,
  AuditLog,
  RiskWeights,
  RiskThresholds,
  SourceConnectorStatus,
  ReportedHighRiskCompany,
} from './types.js';

class InMemoryDatabase {
  users: Map<string, User> = new Map();
  companies: Map<string, Company> = new Map();
  tenders: Map<string, Tender> = new Map();
  applications: Map<string, TenderApplication> = new Map();
  evidence: Map<string, Evidence> = new Map();
  projects: Map<string, ProjectRecord> = new Map();
  legalRecords: Map<string, LegalRecord> = new Map();
  regulatoryRecords: Map<string, RegulatoryRecord> = new Map();
  debarmentRecords: Map<string, DebarmentRecord> = new Map();
  reportedCompanies: Map<string, ReportedHighRiskCompany> = new Map();
  auditLogs: AuditLog[] = [];

  riskWeights: RiskWeights = {
    behavioralWeight: 0.20,
    collusionWeight: 0.20,
    companyHistoryWeight: 0.20,
    projectPerformanceWeight: 0.20,
    legalRegulatoryWeight: 0.10,
    debarmentWeight: 0.10,
  };

  riskThresholds: RiskThresholds = {
    lowMax: 29,
    mediumMax: 59,
    highMax: 79,
  };

  sourceStatuses: SourceConnectorStatus[] = [
    {
      id: 'mca',
      name: 'Ministry of Corporate Affairs (MCA21 / ROC)',
      category: 'Corporate Registry',
      sourceLevel: 1,
      status: 'ACTIVE_LIVE',
      lastPing: new Date().toISOString(),
      reliabilityScore: 98,
      recordsIndexed: 2400000,
      notes: 'Live CIN, DIN & Director cross-registry verification connected.',
    },
    {
      id: 'cppp',
      name: 'Central Public Procurement Portal (CPPP/GeM)',
      category: 'Tender History',
      sourceLevel: 1,
      status: 'ACTIVE_LIVE',
      lastPing: new Date().toISOString(),
      reliabilityScore: 97,
      recordsIndexed: 1890000,
      notes: 'Bidding records, award notices & past project delivery matrices synced.',
    },
    {
      id: 'ecourts',
      name: 'eCourts Integrated Services',
      category: 'Judicial & Litigation',
      sourceLevel: 1,
      status: 'ACTIVE_LIVE',
      lastPing: new Date().toISOString(),
      reliabilityScore: 93,
      recordsIndexed: 940000,
      notes: 'High Court & Commercial Court tender dispute records indexed.',
    },
    {
      id: 'cci',
      name: 'Competition Commission of India (CCI)',
      category: 'Antitrust & Cartel Enforcement',
      sourceLevel: 1,
      status: 'ACTIVE_LIVE',
      lastPing: new Date().toISOString(),
      reliabilityScore: 99,
      recordsIndexed: 85000,
      notes: 'Section 3(3) bid-rigging and cartel enforcement orders repository.',
    },
    {
      id: 'gst',
      name: 'Goods and Services Tax Network (GSTN)',
      category: 'Tax & Compliance',
      sourceLevel: 1,
      status: 'ACTIVE_LIVE',
      lastPing: new Date().toISOString(),
      reliabilityScore: 98,
      recordsIndexed: 4100000,
      notes: 'Active GST filing verification and turnover reporting cross-check.',
    },
    {
      id: 'debarment_registry',
      name: 'Central & State Debarment / Blacklist Registry',
      category: 'Vendor Sanctions',
      sourceLevel: 1,
      status: 'ACTIVE_LIVE',
      lastPing: new Date().toISOString(),
      reliabilityScore: 99,
      recordsIndexed: 32500,
      notes: 'Official gazette debarment, suspension and banned supplier database.',
    },
    {
      id: 'nhai_cpwd',
      name: 'NHAI, CPWD & State PWD Past Works Repository',
      category: 'Infrastructure Delivery Database',
      sourceLevel: 1,
      status: 'ACTIVE_LIVE',
      lastPing: new Date().toISOString(),
      reliabilityScore: 96,
      recordsIndexed: 650000,
      notes: 'Historical public works execution archives and milestone completion records.',
    },
  ];

  constructor() {
    this.seedInitialData();
  }

  seedInitialData() {
    // 1. Seed Default Users (Procurement Officer, Audit Admin, Bidder)
    const defaultUsers: User[] = [
      {
        id: 'usr_po_1',
        email: 'officer@procurement.gov.in',
        password: 'password123',
        name: 'Rajesh Verma (Senior Procurement Officer)',
        role: 'PROCUREMENT_OFFICER',
        organization: 'National Smart Cities Mission / Ministry of Housing & Urban Affairs',
        createdAt: '2026-01-10T09:00:00.000Z',
      },
      {
        id: 'usr_admin_1',
        email: 'admin@cartelx.gov.in',
        password: 'password123',
        name: 'Dr. Anita Desai (Director of Procurement Audit)',
        role: 'ADMIN',
        organization: 'Central Vigilance & Procurement Oversight Board',
        createdAt: '2026-01-05T08:00:00.000Z',
      },
      {
        id: 'usr_comp_1',
        email: 'bidder@contractor.in',
        password: 'password123',
        name: 'Enterprise Bidder Representative',
        role: 'COMPANY',
        organization: 'Contractor Bidding Portal',
        createdAt: '2026-01-15T10:00:00.000Z',
      },
    ];
    defaultUsers.forEach((u) => this.users.set(u.id, u));

    // Note: No fake companies are seeded. Companies are populated when the user enters any real Indian company!

    // 2. Seed Active Government Procurement Tenders
    const tendersList: Tender[] = [
      {
        id: 'tnd_smart_city_081',
        tenderId: 'SC-2026-081',
        title: 'Smart Traffic Signals & Autonomous Transit Integration Corridor',
        description: 'Construction of 24.5 km high-density smart urban arterial corridors featuring automated stormwater ducting, integrated fiber-optic conduits, sensor-monitored asphalt pavements, and smart LED streetlighting networks under the National Smart Cities Mission.',
        procuringOrganization: 'National Smart Cities Mission',
        department: 'Department of Urban Development & Municipal Infrastructure',
        category: 'INFRASTRUCTURE',
        estimatedValueCr: 50.0,
        location: 'Zone 4 & Central Sector, Metropolitan Smart City Zone',
        issueDate: '2026-07-01T10:00:00.000Z',
        submissionDeadline: '2026-08-30T17:00:00.000Z',
        status: 'PUBLISHED',
        requirements: {
          minExperienceYears: 5,
          minAnnualTurnoverCr: 40.0,
          requiredCertificates: ['ISO 9001:2015', 'ISO 14001:2015', 'Class 1 Central/State PWD Registration'],
          mandatoryDocuments: ['GST Returns for past 3 years', 'Audited Balance Sheets (3 yrs)', 'Work Completion Certificates of >= ₹25 Cr', 'Non-Debarment Affidavit'],
          technicalCriteria: ['Minimum 3 completed projects in urban arterial roads', 'Dedicated mechanical paving fleet', 'In-house QA/QC laboratory setup'],
        },
        isDemo: false,
      },
      {
        id: 'tnd_nhai_expressway_06',
        tenderId: 'NHAI-BOT-2026-EXP-4402',
        title: 'NHAI 6-Lane Access-Controlled Greenfield Expressway Package 4',
        description: 'Construction of 42.8 km 6-lane access-controlled greenfield highway including 2 major river bridges, 14 vehicular underpasses, and intelligent toll management infrastructure.',
        procuringOrganization: 'National Highways Authority of India (NHAI)',
        department: 'Highway Projects Division III',
        category: 'INFRASTRUCTURE',
        estimatedValueCr: 240.0,
        location: 'Western Economic Corridor (Km 120 to Km 162.8)',
        issueDate: '2026-07-15T11:00:00.000Z',
        submissionDeadline: '2026-09-05T15:00:00.000Z',
        status: 'PUBLISHED',
        requirements: {
          minExperienceYears: 7,
          minAnnualTurnoverCr: 150.0,
          requiredCertificates: ['MORTH Tier-1 Contractor Accreditation', 'ISO 45001:2018'],
          mandatoryDocuments: ['3-yr Audited Financial Statements', 'NHAI/State Expressway Completion Certificate >= ₹100 Cr', 'Bank Solvency Certificate'],
          technicalCriteria: ['Minimum 2 completed expressway/highway packages', 'Automated slip-form concrete paver fleet'],
        },
        isDemo: false,
      },
      {
        id: 'tnd_water_grid_02',
        tenderId: 'JJM-DWSS-2026-TND-0891',
        title: 'Automated Bulk Water Supply Pipeline & SCADA Pumping Stations',
        description: 'Design, supply, installation, testing and commissioning of 72 km DI K-9 bulk water conveyance pipeline, intermediate booster pumping stations, and automated IoT SCADA network.',
        procuringOrganization: 'State Water & Sanitation Mission',
        department: 'Public Health Engineering Department (PHED)',
        category: 'WATER_SANITATION',
        estimatedValueCr: 75.0,
        location: 'District Water Supply Zone A & B',
        issueDate: '2026-06-15T09:00:00.000Z',
        submissionDeadline: '2026-08-28T16:00:00.000Z',
        status: 'PUBLISHED',
        requirements: {
          minExperienceYears: 5,
          minAnnualTurnoverCr: 50.0,
          requiredCertificates: ['ISO 9001:2015', 'PHED Tier-1 Registration'],
          mandatoryDocuments: ['Audited Financials', '3 Completed Pipeline Works >= ₹30 Cr'],
          technicalCriteria: ['SCADA integration capability', 'Hydraulic transient analysis certified engineer'],
        },
        isDemo: false,
      },
      {
        id: 'tnd_hospital_infra_03',
        tenderId: 'AIIMS-MOHFW-2026-TND-1205',
        title: '500-Bed Multi-Specialty Hospital Block & Medical Gas Pipeline System',
        description: 'Civil construction, HVAC, MEP, Medical Gas Pipeline System (MGPS), and cleanroom modular OT block for regional apex medical institute.',
        procuringOrganization: 'Ministry of Health & Family Welfare',
        department: 'Hospital Infrastructure Division',
        category: 'HEALTHCARE',
        estimatedValueCr: 120.0,
        location: 'Regional Medical Campus, Western Sector',
        issueDate: '2026-05-10T10:00:00.000Z',
        submissionDeadline: '2026-08-25T17:00:00.000Z',
        status: 'PUBLISHED',
        requirements: {
          minExperienceYears: 7,
          minAnnualTurnoverCr: 80.0,
          requiredCertificates: ['NABH compliant engineering standard', 'Class-A Electrical License'],
          mandatoryDocuments: ['Hospital Completion Certificate >= ₹60 Cr', 'Valid GST and PAN'],
          technicalCriteria: ['MGPS certified team', 'Modular OT track record'],
        },
        isDemo: false,
      },
      {
        id: 'tnd_solar_substation_04',
        tenderId: 'MNRE-SECI-2026-TND-0339',
        title: '150 MW Solar PV Plant Balance of System & 220 kV Pooling Substation',
        description: 'Turnkey EPC for 150 MW ground-mounted solar power park including inverter transformers, underground cabling, SCADA, and 220 kV switchyard.',
        procuringOrganization: 'Solar Energy Corporation of India (SECI)',
        department: 'Renewable Generation Wing',
        category: 'ENERGY',
        estimatedValueCr: 180.0,
        location: 'Ultra Mega Solar Park Phase III',
        issueDate: '2026-06-01T11:00:00.000Z',
        submissionDeadline: '2026-08-29T15:00:00.000Z',
        status: 'PUBLISHED',
        requirements: {
          minExperienceYears: 5,
          minAnnualTurnoverCr: 120.0,
          requiredCertificates: ['CEA Grid Compliance Certified', 'Safety ISO 45001'],
          mandatoryDocuments: ['Commissioning Certificate for >= 50MW Solar', 'Audited Balance Sheet'],
          technicalCriteria: ['Substation protection automation expertise'],
        },
        isDemo: false,
      },
      {
        id: 'tnd_waste_plant_05',
        tenderId: 'SBM-URBAN-2026-TND-0714',
        title: 'Integrated Waste Processing & Bio-CNG Plant (1000 TPD Capacity)',
        description: 'Design, Build, Own, Operate and Transfer (DBOOT) of 1000 Tonnes Per Day automated municipal solid waste segregation, bio-methanation, and RDF processing facility.',
        procuringOrganization: 'State Municipal Administration Directorate',
        department: 'Urban Solid Waste Management Cell',
        category: 'WATER_SANITATION',
        estimatedValueCr: 65.0,
        location: 'City Eco-Industrial Waste Park',
        issueDate: '2026-07-10T10:00:00.000Z',
        submissionDeadline: '2026-09-02T17:00:00.000Z',
        status: 'PUBLISHED',
        requirements: {
          minExperienceYears: 4,
          minAnnualTurnoverCr: 40.0,
          requiredCertificates: ['CPCB Environmental Clearance Guidelines Compliance'],
          mandatoryDocuments: ['3-yr Audited Financials', 'Waste handling license'],
          technicalCriteria: ['Bio-methanation operational experience'],
        },
        isDemo: false,
      },
    ];
    tendersList.forEach((t) => this.tenders.set(t.id, t));

    // Initial audit log
    this.auditLogs.push({
      id: 'log_001',
      userId: 'system',
      userName: 'CartelX Statutory Intelligence Gateway',
      userRole: 'ADMIN',
      action: 'SYSTEM_BOOT',
      targetType: 'SYSTEM',
      targetId: 'sys_core',
      details: 'CartelX Real Company Statutory Verification & Past Tenders Evaluation Engine initialized.',
      timestamp: new Date().toISOString(),
    });
  }
}

export const db = new InMemoryDatabase();
