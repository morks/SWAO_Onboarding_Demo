// Sovereign In-Container Price Simulation — kein externer Netzwerkzugriff
//
// Für Produktion ersetzen durch EU-sovereign Finanz-Datenprovider:
//   - Deutsche Börse Xetra Market Data API (Frankfurt, EU)
//   - Refinitiv Eikon EMEA (EU-Instanz)
//   - Bloomberg B-PIPE EU (Frankfurter RZ)

export interface PriceData {
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
  lastRefreshed: string;
  source: string;
}

const BASE_PRICES: Record<string, number> = {
  MSFT: 417.00,
  AMZN: 185.00,
  NVDA: 875.00,
  SAP:  178.00,
  ALV:  263.00,
};

/**
 * Gibt simulierte Kursdaten zurück — vollständig in-container, kein externer Egress.
 * Simulation: sinusförmige Tagesbewegung ±2% um den Basiswert.
 */
export async function getStockPrice(symbol: string = 'MSFT'): Promise<PriceData> {
  const basePrice = BASE_PRICES[symbol] ?? 100.00;

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const dayFraction = (now % dayMs) / dayMs;
  const variation = Math.sin(dayFraction * Math.PI * 2) * basePrice * 0.02;
  const price = basePrice + variation;
  const changePercent = (variation / basePrice) * 100;

  return {
    symbol,
    price: price.toFixed(2),
    change: (variation >= 0 ? '+' : '') + variation.toFixed(2),
    changePercent: (changePercent >= 0 ? '+' : '') + changePercent.toFixed(2) + '%',
    lastRefreshed: new Date().toISOString().split('T')[0],
    source: 'sovereign-simulation',
  };
}
