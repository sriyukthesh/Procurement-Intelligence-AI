import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { authRouter } from './server/routes/auth.js';
import { companiesRouter } from './server/routes/companies.js';
import { tendersRouter } from './server/routes/tenders.js';
import { analysisRouter } from './server/routes/analysis.js';
import { evidenceRouter } from './server/routes/evidence.js';
import { aiRouter } from './server/routes/ai.js';
import { reportsRouter } from './server/routes/reports.js';
import { connectorsRouter } from './server/routes/connectors.js';
import { settingsRouter } from './server/routes/settings.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Routes First
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'CartelX Procurement Intelligence Engine',
      version: '1.0.0-hackathon-gold',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/companies', companiesRouter);
  app.use('/api/tenders', tendersRouter);
  app.use('/api', analysisRouter);
  app.use('/api/evidence', evidenceRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/reports', reportsRouter);
  app.use('/api/connectors', connectorsRouter);
  app.use('/api/settings', settingsRouter);

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CartelX] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[CartelX] Server failed to start:', err);
  process.exit(1);
});
