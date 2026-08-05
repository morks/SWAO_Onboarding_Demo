import { Router, Response } from 'express';
import type { Router as RouterType } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { getStockPrice } from '../services/priceApi';
import { logger } from '../lib/logger';

const router: RouterType = Router();
const prisma = new PrismaClient();

/**
 * GET /api/sweepstakes/prize
 * Gibt den aktuellen Gewinn-Preis zurück.
 *
 * EGR-01 FIX: Preis kommt jetzt aus sovereign In-Container-Simulation,
 * kein externer Egress zu api.alphavantage.co mehr.
 */
router.get('/prize', requireAuth, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const priceData = await getStockPrice('MSFT');

    res.json({
      prize: {
        description: 'Microsoft Aktienpaket',
        symbol: priceData.symbol,
        currentValue: `${priceData.price} USD`,
        change: priceData.change,
        changePercent: priceData.changePercent,
        lastRefreshed: priceData.lastRefreshed,
        source: priceData.source,
      },
    });
  } catch (err) {
    logger.error({ err }, 'Preis-Service fehlgeschlagen');
    res.status(500).json({ error: 'Preisdaten konnten nicht abgerufen werden.' });
  }
});

/**
 * POST /api/sweepstakes/enter
 * Nimmt am Gewinnspiel teil.
 */
router.post('/enter', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const campaignId = req.body.campaignId || 'SUMMER2024';

  try {
    const existingEntry = await prisma.sweepstakesEntry.findFirst({
      where: { userId: req.userId!, campaignId },
    });

    if (existingEntry) {
      res.status(409).json({
        error: 'Sie haben bereits an dieser Kampagne teilgenommen.',
        entry: existingEntry,
      });
      return;
    }

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
      data: { userId: req.userId!, campaignId },
    });

    logger.info({ userId: req.userId, campaignId }, 'Neue Gewinnspiel-Teilnahme');

    res.status(201).json({
      message: 'Erfolgreich am Gewinnspiel teilgenommen!',
      entry,
    });
  } catch (err) {
    logger.error({ err, userId: req.userId }, 'Teilnahme fehlgeschlagen');
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
    logger.error({ err, userId: req.userId }, 'Einträge laden fehlgeschlagen');
    res.status(500).json({ error: 'Teilnahmen konnten nicht geladen werden.' });
  }
});

export default router;
