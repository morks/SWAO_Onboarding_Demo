import { Router, Response } from 'express';
import type { Router as RouterType } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../lib/logger';

const router: RouterType = Router();
const prisma = new PrismaClient();

/**
 * GET /api/profile
 * Gibt das Profil des authentifizierten Benutzers zurück.
 */
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId! },
      include: { user: { select: { email: true, avatarHash: true, createdAt: true } } },
    });

    if (!profile) {
      res.json({ profile: null });
      return;
    }

    res.json({
      profile: {
        ...profile,
        avatarUrl: `https://www.gravatar.com/avatar/${profile.user.avatarHash}?s=80&d=identicon`,
      },
    });
  } catch (err) {
    logger.error({ err, userId: req.userId }, 'Profil laden fehlgeschlagen');
    res.status(500).json({ error: 'Profil konnte nicht geladen werden.' });
  }
});

/**
 * PUT /api/profile
 * Erstellt oder aktualisiert das Profil des authentifizierten Benutzers.
 */
router.put('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { firstName, lastName, dateOfBirth, phone, street, postalCode, city, country, consent } = req.body;

  if (!firstName || !lastName || !dateOfBirth) {
    res.status(400).json({ error: 'Vorname, Nachname und Geburtsdatum sind erforderlich.' });
    return;
  }

  try {
    const profile = await prisma.profile.upsert({
      where: { userId: req.userId! },
      create: {
        userId: req.userId!,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        phone: phone || null,
        street: street || null,
        postalCode: postalCode || null,
        city: city || null,
        country: country || 'DE',
        consent: consent || false,
      },
      update: {
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        phone: phone || null,
        street: street || null,
        postalCode: postalCode || null,
        city: city || null,
        country: country || 'DE',
        consent: consent !== undefined ? consent : undefined,
      },
    });

    logger.info({ userId: req.userId }, 'Profil aktualisiert');
    res.json({ profile });
  } catch (err) {
    logger.error({ err, userId: req.userId }, 'Profil speichern fehlgeschlagen');
    res.status(500).json({ error: 'Profil konnte nicht gespeichert werden.' });
  }
});

/**
 * DELETE /api/profile
 * Löscht das Konto und alle zugehörigen Daten des authentifizierten Benutzers.
 *
 * DATA FIX: Implementiert DSGVO Art.17 "Recht auf Löschung" (Right to Erasure).
 * Kaskadiert auf Profile und SweepstakesEntries (via Prisma onDelete: Cascade).
 */
router.delete('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Prisma-Schema hat onDelete: Cascade — löscht Profile + Entries automatisch
    await prisma.user.delete({
      where: { id: req.userId! },
    });

    logger.info({ userId: req.userId }, 'Benutzer und alle Daten gelöscht (DSGVO Art.17)');
    res.json({ message: 'Ihr Konto und alle zugehörigen Daten wurden gelöscht.' });
  } catch (err) {
    logger.error({ err, userId: req.userId }, 'Konto löschen fehlgeschlagen');
    res.status(500).json({ error: 'Konto konnte nicht gelöscht werden.' });
  }
});

export default router;
