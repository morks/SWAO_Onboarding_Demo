import { Router, Request, Response } from 'express';
import type { Router as RouterType } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { generateAvatarHash } from '../services/avatar';

const router: RouterType = Router();
const prisma = new PrismaClient();

/**
 * POST /api/auth/register
 * Registriert einen neuen Benutzer.
 *
 * SWAO CRYPTO-positive: bcrypt.hash mit cost factor 12
 * SWAO CRYPTO-weak: generateAvatarHash verwendet MD5 (siehe avatar.ts)
 * SWAO CRYPTO-JWT: jwt.sign mit HS256 (symmetrisch)
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'E-Mail und Passwort sind erforderlich.' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'Passwort muss mindestens 8 Zeichen lang sein.' });
    return;
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Diese E-Mail-Adresse ist bereits registriert.' });
      return;
    }

    // SWAO CRYPTO-positive: bcrypt mit hohem Cost Factor 12
    const hashedPassword = await bcrypt.hash(password, 12);

    // SWAO CRYPTO-weak: MD5 für Avatar-Hash (intentional — siehe avatar.ts)
    const avatarHash = generateAvatarHash(email);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        avatarHash,
      },
    });

    const secret = process.env.JWT_SECRET_KEY!;
    // SWAO CRYPTO-JWT: HS256 (symmetrisch, kein RS256/ES256)
    // expiresIn als Sekunden-Zahl (7 Tage) — vermeidet ms-StringValue Typ-Konflikt
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      secret,
      { algorithm: 'HS256', expiresIn: 7 * 24 * 60 * 60 }
    );

    // SWAO TF-04: console.log statt strukturiertes Logging (pino/winston)
    console.log(`[AUTH] Neuer Benutzer registriert: ${email}`);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        avatarUrl: `https://www.gravatar.com/avatar/${avatarHash}?s=80&d=identicon`,
      },
    });
  } catch (err) {
    console.error('[AUTH] Registrierung fehlgeschlagen:', err);
    res.status(500).json({ error: 'Interner Serverfehler bei der Registrierung.' });
  }
});

/**
 * POST /api/auth/login
 * Anmeldung mit E-Mail und Passwort → JWT
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'E-Mail und Passwort sind erforderlich.' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(401).json({ error: 'Ungültige E-Mail-Adresse oder Passwort.' });
      return;
    }

    // SWAO CRYPTO-positive: bcrypt.compare
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      res.status(401).json({ error: 'Ungültige E-Mail-Adresse oder Passwort.' });
      return;
    }

    const secret = process.env.JWT_SECRET_KEY!;
    // SWAO CRYPTO-JWT: HS256
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      secret,
      { algorithm: 'HS256', expiresIn: 7 * 24 * 60 * 60 }
    );

    console.log(`[AUTH] Benutzer angemeldet: ${email}`);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        avatarUrl: `https://www.gravatar.com/avatar/${user.avatarHash}?s=80&d=identicon`,
      },
    });
  } catch (err) {
    console.error('[AUTH] Login fehlgeschlagen:', err);
    res.status(500).json({ error: 'Interner Serverfehler beim Login.' });
  }
});

export default router;
