// SWAO TF-04: console.log/console.error statt strukturiertes Logging (pino/winston)
// SWAO TF-05: Kein /health Endpoint implementiert
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import profileRouter from './routes/profile';
import sweepstakesRouter from './routes/sweepstakes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['http://localhost:3000']
    : true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SWAO TF-04: console.log statt pino/winston
console.log('[SERVER] Gewinnspiel Demo App startet…');

// API-Routen
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/sweepstakes', sweepstakesRouter);

// API-Info (kein /health — SWAO TF-05)
app.get('/api', (_req, res) => {
  res.json({
    name: 'Gewinnspiel Demo API',
    version: '1.0.0',
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET  /api/profile',
      'PUT  /api/profile',
      'GET  /api/sweepstakes/prize',
      'POST /api/sweepstakes/enter',
      'GET  /api/sweepstakes/entries',
    ],
    // SWAO TF-05: Kein /health Endpoint — Hinweis für Operations
    note: 'Kein /health Endpoint vorhanden (SWAO TF-05)',
  });
});

// 404-Handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpunkt nicht gefunden.' });
});

// Globaler Fehler-Handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // SWAO TF-04: console.error statt strukturiertes Logging
  console.error('[ERROR]', err.message, err.stack);
  res.status(500).json({ error: 'Interner Serverfehler.' });
});

app.listen(PORT, () => {
  // SWAO TF-04: console.log
  console.log(`[SERVER] Backend läuft auf http://localhost:${PORT}`);
  console.log(`[SERVER] API-Info: http://localhost:${PORT}/api`);
});

export default app;
