// TF-04 FIX: Strukturiertes Logging mit pino (ersetzt console.log)
// pino schreibt JSON-Logs — kompatibel mit cloud-nativen Log-Aggregatoren
// (Azure Monitor, AWS CloudWatch, Google Cloud Logging, ELK)
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // In Produktion: plain JSON für Log-Aggregatoren
  // Lokal (NODE_ENV=development): pino-pretty für lesbare Ausgabe
  ...(process.env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:standard' },
    },
  }),
});
