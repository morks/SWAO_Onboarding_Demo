import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { getStockPrice } from '../services/priceApi';

// SWAO SBOM: csurf ist deprecated (letztes Release 2019, keine Security-Updates mehr)
// Auskommentiert — würde als SBOM-Finding gemeldet werden
// import csurf from 'csurf';
// const csrfProtection = csurf({ cookie: true });

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/sweepstakes/prize
 * Ruft den aktuellen Gewinn-Preis von Alphavantage ab.
 *
 * SWAO EGR-01 CRITICAL: Egress zu api.alphavantage.co (non-sovereign US-API)
 */
router.get('/prize', requireAuth, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // SWAO EGR-01: Aufruf von api.alphavantage.co (US-hosted, non-sovereign)
    const priceData = await getStockPrice('MSFT');

    res.json({
      prize: {
        description: 'Microsoft Aktienpaket',
        symbol: priceData.symbol,
        currentValue: `${priceData.price} USD`,
        change: priceData.change,
        changePercent: priceData.changePercent,
        lastRefreshed: priceData.lastRefreshed,
        source: 'alphavantage.co', // SWAO EGR-01: Explizite Quelle
      },
    });
  } catch (err) {
    console.error('[SWEEPSTAKES] Preis-API fehlgeschlagen:', err);
    res.status(500).json({ error: 'Preisdaten konnten nicht abgerufen werden.' });
  }
});

/**
 * POST /api/sweepstakes/enter
 * Nimmt am Gewinnspiel teil.
 *
 * SWAO SBOM: csurf-Schutz fehlt (deprecated package, auskommentiert)
 */
router.post('/enter', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const campaignId = req.body.campaignId || 'SUMMER2024';

  try {
    // Prüfen ob bereits teilgenommen
    const existingEntry = await prisma.sweepstakesEntry.findFirst({
      where: {
        userId: req.userId!,
        campaignId,
      },
    });

    if (existingEntry) {
      res.status(409).json({
        error: 'Sie haben bereits an dieser Kampagne teilgenommen.',
        entry: existingEntry,
      });
      return;
    }

    // Profil-Vollständigkeit prüfen
    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId! },
    });

    if (!profile || !profile.consent) {
      res.status(400).json({
        error: 'Bitte vervollständigen Sie Ihr Profil und stimmen Sie den Teilnahmebedingungen zu.',
      });
      return;
    }

    const entry = await prisma.sweepstakesEntry.create({
      data: {
        userId: req.userId!,
        campaignId,
      },
    });

    console.log(`[SWEEPSTAKES] Neue Teilnahme: User ${req.userId}, Kampagne ${campaignId}`);

    res.status(201).json({
      message: 'Erfolgreich am Gewinnspiel teilgenommen!',
      entry,
    });
  } catch (err) {
    console.error('[SWEEPSTAKES] Teilnahme fehlgeschlagen:', err);
    res.status(500).json({ error: 'Teilnahme konnte nicht verarbeitet werden.' });
  }
});

/**
 * GET /api/sweepstakes/entries
 * Gibt alle Teilnahmen des authentifizierten Benutzers zurück.
 */
router.get('/entries', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const entries = await prisma.sweepstakesEntry.findMany({
      where: { userId: req.userId! },
      orderBy: { enteredAt: 'desc' },
    });

    res.json({ entries });
  } catch (err) {
    console.error('[SWEEPSTAKES] Einträge laden fehlgeschlagen:', err);
    res.status(500).json({ error: 'Teilnahmen konnten nicht geladen werden.' });
  }
});

export default router;
