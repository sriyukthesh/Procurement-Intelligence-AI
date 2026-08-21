import { Router, Request, Response } from 'express';
import { db } from '../db.js';

export const evidenceRouter = Router();

// GET /api/evidence
evidenceRouter.get('/', (req: Request, res: Response) => {
  const { companyId, tenderId, findingType, verificationStatus, sourceLevel, severity, search } = req.query;
  let list = Array.from(db.evidence.values());

  if (companyId) {
    list = list.filter((e) => e.companyId === companyId);
  }
  if (tenderId) {
    list = list.filter((e) => e.tenderId === tenderId);
  }
  if (findingType) {
    list = list.filter((e) => e.findingType === findingType);
  }
  if (verificationStatus) {
    list = list.filter((e) => e.verificationStatus === verificationStatus);
  }
  if (sourceLevel) {
    list = list.filter((e) => e.sourceLevel === Number(sourceLevel));
  }
  if (severity) {
    list = list.filter((e) => e.severity === severity);
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.sourceName.toLowerCase().includes(q) ||
        e.evidenceText.toLowerCase().includes(q)
    );
  }

  const enriched = list.map((e) => {
    const comp = db.companies.get(e.companyId);
    return {
      ...e,
      companyName: comp ? comp.legalName : e.companyId,
      cin: comp ? comp.cin : 'N/A',
    };
  });

  res.json({
    total: enriched.length,
    evidence: enriched,
  });
});

// GET /api/evidence/:id
evidenceRouter.get('/:id', (req: Request, res: Response) => {
  const item = db.evidence.get(req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Evidence not found' });
  }

  const comp = db.companies.get(item.companyId);
  res.json({
    evidence: {
      ...item,
      companyName: comp ? comp.legalName : item.companyId,
      cin: comp ? comp.cin : 'N/A',
    },
  });
});
