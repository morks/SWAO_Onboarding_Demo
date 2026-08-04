# SWAO TF-02: Public Docker Hub Image — node:20-alpine (nicht aus sovereign/privater Registry)
FROM node:20-alpine

WORKDIR /app

# Prisma benötigt openssl
RUN apk add --no-cache openssl

# Dependencies installieren
COPY package*.json ./
RUN npm ci --only=production=false

# Prisma Schema kopieren und Client generieren
COPY prisma ./prisma
RUN npx prisma generate

# TypeScript kompilieren
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Nur production dependencies für finales Image
RUN npm prune --production

EXPOSE 4000

# SWAO: prisma db push beim Start (kein migrate deploy — Demo-optimiert)
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/index.js"]
