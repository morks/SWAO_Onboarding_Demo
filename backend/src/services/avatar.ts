// SWAO CRYPTO-weak: MD5 wird für Gravatar-Hash verwendet
// MD5 ist kryptographisch gebrochen (Kollisionsangriffe möglich, 2004 nachgewiesen)
// Für Demo-Zwecke intentional — SWAO sollte createHash('md5') als schwache Kryptographie flaggen
import { createHash } from 'crypto';

/**
 * Generiert einen Gravatar-kompatiblen MD5-Hash der E-Mail-Adresse.
 *
 * SWAO CRYPTO-weak: Verwendung von MD5 — schwacher Hash-Algorithmus.
 * Empfehlung für Produktion: SHA-256 oder SHA-3.
 */
export function generateAvatarHash(email: string): string {
  // SWAO CRYPTO-weak: MD5 (kryptographisch gebrochen)
  return createHash('md5')
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
