// Strukturiertes Logging via pino — TF-04
// /health Endpoint für Liveness/Readiness Probes — TF-05
import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { logger } from './lib/logger';
import authRouter from './routes/auth';
import profileRouter from './routes/profile';
import sweepstakesRouter from './routes/sweepstakes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4000;
const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['http://localhost:3000']
    : true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

logger.info('Gewinnspiel Demo App startet…');

// TF-05 FIX: /health Endpoint — Liveness + DB-Readiness Check
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: process.env.npm_package_version || '1.0.0',
    });
  } catch (err) {
    logger.error({ err }, 'Health check: Datenbankverbindung fehlgeschlagen');
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
});

// API-Routen
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/sweepstakes', sweepstakesRouter);

// API-Info
app.get('/api', (_req, res) => {
  res.json({
    name: 'Gewinnspiel Demo API',
    version: '1.0.0',
    endpoints: [
      'GET  /health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET  /api/profile',
      'PUT  /api/profile',
      'DELETE /api/profile',
      'GET  /api/sweepstakes/prize',
      'POST /api/sweepstakes/enter',
      'GET  /api/sweepstakes/entries',
    ],
  });
});

// 404-Handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpunkt nicht gefunden.' });
});

// Globaler Fehler-Handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, 'Unbehandelter Fehler');
  res.status(500).json({ error: 'Interner Serverfehler.' });
});

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Backend läuft');
});

export default app;
