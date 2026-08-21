import { Router, Request, Response } from 'express';
import { askAiInvestigator } from '../services/aiAssistant.js';

export const aiRouter = Router();

// POST /api/ai/investigate
aiRouter.post('/investigate', async (req: Request, res: Response) => {
  const { query, companyId, tenderId } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required.' });
  }

  try {
    const result = await askAiInvestigator(query, companyId, tenderId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
