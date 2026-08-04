import { Router, Response } from 'express';
import type { Router as RouterType } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

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
    console.error('[PROFILE] Laden fehlgeschlagen:', err);
    res.status(500).json({ error: 'Profil konnte nicht geladen werden.' });
  }
});

/**
 * PUT /api/profile
 * Erstellt oder aktualisiert das Profil des authentifizierten Benutzers.
 *
 * SWAO DATA: Speichert umfangreiche PII (Name, Adresse, Geburtsdatum, Telefon).
 */
router.put('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const {
    firstName,
    lastName,
    dateOfBirth,
    phone,
    street,
    postalCode,
    city,
    country,
    consent,
  } = req.body;

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

    console.log(`[PROFILE] Profil aktualisiert für User ${req.userId}`);
    res.json({ profile });
  } catch (err) {
    console.error('[PROFILE] Speichern fehlgeschlagen:', err);
    res.status(500).json({ error: 'Profil konnte nicht gespeichert werden.' });
  }
});

// SWAO DATA (LLM): Kein DELETE /api/profile implementiert
// DSGVO Art.17 "Recht auf Löschung" nicht erfüllt — intentional für SWAO-Finding

export default router;
