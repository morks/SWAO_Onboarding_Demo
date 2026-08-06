// Avatar-Hash-Service — SHA-256 für Gravatar-kompatible URLs
import { createHash } from 'crypto';

/**
 * Generiert einen SHA-256-Hash der E-Mail-Adresse für Gravatar-kompatible Avatar-URLs.
 * SHA-256 ist kollisionsresistent und NIST-empfohlen (FIPS 180-4).
 */
export function generateAvatarHash(email: string): string {
  return createHash('sha256')
    .update(email.trim().toLowerCase())
    .digest('hex');
}

/**
 * Gibt die Gravatar-URL für eine E-Mail-Adresse zurück.
 */
export function getGravatarUrl(email: string, size: number = 80): string {
  const hash = generateAvatarHash(email);
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}
