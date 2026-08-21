import { Router, Request, Response } from 'express';
import { db } from '../db.js';

export const settingsRouter = Router();

// GET /api/settings
settingsRouter.get('/', (req: Request, res: Response) => {
  res.json({
    riskWeights: db.riskWeights,
    riskThresholds: db.riskThresholds,
    auditLogs: db.auditLogs.slice(0, 50),
  });
});

// PUT /api/settings/weights
settingsRouter.put('/weights', (req: Request, res: Response) => {
  const {
    behavioralWeight,
    collusionWeight,
    companyHistoryWeight,
    projectPerformanceWeight,
    legalRegulatoryWeight,
    debarmentWeight,
  } = req.body;

  db.riskWeights = {
    behavioralWeight: Number(behavioralWeight) || db.riskWeights.behavioralWeight,
    collusionWeight: Number(collusionWeight) || db.riskWeights.collusionWeight,
    companyHistoryWeight: Number(companyHistoryWeight) || db.riskWeights.companyHistoryWeight,
    projectPerformanceWeight: Number(projectPerformanceWeight) || db.riskWeights.projectPerformanceWeight,
    legalRegulatoryWeight: Number(legalRegulatoryWeight) || db.riskWeights.legalRegulatoryWeight,
    debarmentWeight: Number(debarmentWeight) || db.riskWeights.debarmentWeight,
  };

  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: 'usr_admin_1',
    userName: 'System Administrator',
    userRole: 'ADMIN',
    action: 'RISK_WEIGHTS_UPDATED',
    targetType: 'SYSTEM_SETTINGS',
    targetId: 'risk_weights',
    details: `Updated risk scoring weights: Behavioral(${db.riskWeights.behavioralWeight}), Collusion(${db.riskWeights.collusionWeight}), History(${db.riskWeights.companyHistoryWeight}), Project(${db.riskWeights.projectPerformanceWeight}), Legal(${db.riskWeights.legalRegulatoryWeight}), Debarment(${db.riskWeights.debarmentWeight})`,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    riskWeights: db.riskWeights,
  });
});

// GET /api/audit-logs
settingsRouter.get('/audit-logs', (req: Request, res: Response) => {
  res.json({
    total: db.auditLogs.length,
    logs: db.auditLogs,
  });
});

// POST /api/settings/reset-demo
settingsRouter.post('/reset-demo', (req: Request, res: Response) => {
  db.companies.clear();
  db.tenders.clear();
  db.applications.clear();
  db.evidence.clear();
  db.projects.clear();
  db.legalRecords.clear();
  db.regulatoryRecords.clear();
  db.debarmentRecords.clear();
  db.auditLogs = [];
  db.seedInitialData();

  res.json({
    success: true,
    message: 'Demo dataset reset and re-seeded successfully.',
  });
});
