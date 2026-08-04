import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  userId?: number;
  userEmail?: string;
}

/**
 * JWT-Authentifizierungs-Middleware.
 *
 * SWAO CRYPTO-JWT: Verifiziert HS256-Token (symmetrisch).
 * Bearer-Token aus Authorization-Header.
 */
export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Nicht authentifiziert. Bitte anmelden.' });
    return;
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET_KEY;

  if (!secret) {
    res.status(500).json({ error: 'Server-Konfigurationsfehler' });
    return;
  }

  try {
    // SWAO CRYPTO-JWT: HS256 (symmetrischer Algorithmus)
    const payload = jwt.verify(token, secret) as { userId: number; email: string };
    req.userId = payload.userId;
    req.userEmail = payload.email;
    next();
  } catch {
    res.status(401).json({ error: 'Ungültiger oder abgelaufener Token.' });
  }
}
