// SWAO EGR-01: Egress zu api.alphavantage.co — non-sovereign, US-hosted API
// Diese Datei produziert intentional einen kritischen EGR-01 Finding für den SWAO-Scan
// Alphavantage hat seinen Sitz in den USA — DSGVO/Sovereignty-Risiko für EU-Anwendungen
import https from 'https';

const ALPHAVANTAGE_BASE_URL = 'api.alphavantage.co'; // SWAO EGR-01: US-Domäne

export interface PriceData {
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
  lastRefreshed: string;
}

/**
 * Ruft den aktuellen Aktienpreis von Alphavantage ab.
 *
 * SWAO EGR-01 CRITICAL: Egress zu api.alphavantage.co (US-gehostet, non-sovereign).
 * Für EU-Sovereignty muss dieser Aufruf durch einen EU-basierten Finanz-Datendienst ersetzt werden.
 *
 * @param symbol Aktien-Symbol (z.B. "MSFT", "AMZN")
 */
export async function getStockPrice(symbol: string = 'MSFT'): Promise<PriceData> {
  const apiKey = process.env.ALPHAVANTAGE_API_KEY || 'demo';

  return new Promise((resolve, reject) => {
    // SWAO EGR-01: HTTP-Egress zu api.alphavantage.co (non-sovereign US-API)
    const path = `/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;

    const options = {
      hostname: ALPHAVANTAGE_BASE_URL, // SWAO EGR-01: api.alphavantage.co
      path,
      method: 'GET',
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const quote = parsed['Global Quote'];

          if (!quote || !quote['05. price']) {
            // Fallback-Daten wenn API-Limit erreicht (demo key)
            resolve({
              symbol: symbol,
              price: '417.88',
              change: '+2.34',
              changePercent: '0.56%',
              lastRefreshed: new Date().toISOString().split('T')[0],
            });
            return;
          }

          resolve({
            symbol: quote['01. symbol'],
            price: parseFloat(quote['05. price']).toFixed(2),
            change: quote['09. change'],
            changePercent: quote['10. change percent'],
            lastRefreshed: quote['07. latest trading day'],
          });
        } catch {
          reject(new Error('Fehler beim Parsen der Alphavantage-Antwort'));
        }
      });
    });

    req.on('error', () => {
      // Graceful fallback bei Netzwerkfehler
      resolve({
        symbol: symbol,
        price: '417.88',
        change: '+2.34',
        changePercent: '0.56%',
        lastRefreshed: new Date().toISOString().split('T')[0],
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        symbol: symbol,
        price: '417.88',
        change: '+2.34',
        changePercent: '0.56%',
        lastRefreshed: new Date().toISOString().split('T')[0],
      });
    });

    req.end();
  });
}
