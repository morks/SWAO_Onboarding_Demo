#!/usr/bin/env bash
# setup.sh — Zero-Config-Start für die Gewinnspiel Demo App
# Generiert Passwörter, schreibt .env, startet Docker Compose, führt DB-Migration aus

set -euo pipefail

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

info()    { echo -e "${BLUE}ℹ${NC}  $*"; }
success() { echo -e "${GREEN}✓${NC}  $*"; }
warn()    { echo -e "${YELLOW}⚠${NC}  $*"; }
error()   { echo -e "${RED}✗${NC}  $*" >&2; }

echo -e "${BOLD}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║     Gewinnspiel Demo App — Setup (SWAO Demo)         ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Voraussetzungen prüfen
for cmd in docker openssl; do
  if ! command -v "$cmd" &>/dev/null; then
    error "$cmd ist nicht installiert. Bitte installieren und erneut versuchen."
    exit 1
  fi
done

if ! docker info &>/dev/null; then
  error "Docker läuft nicht. Bitte Docker Desktop starten."
  exit 1
fi

# Schritt 1: Passwörter generieren
info "Generiere sichere Passwörter…"
POSTGRES_PASSWORD=$(openssl rand -hex 16)
JWT_SECRET_KEY=$(openssl rand -hex 32)
success "Passwörter generiert"

# Schritt 2: .env schreiben
info "Schreibe .env…"
cat > .env <<EOF
# Automatisch generiert durch setup.sh — nicht einchecken!
POSTGRES_USER=gewinnspiel
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=gewinnspiel_db
DATABASE_URL=postgresql://gewinnspiel:${POSTGRES_PASSWORD}@postgres:5432/gewinnspiel_db

# SWAO CRYPTO-JWT: Symmetrischer HS256-Key
JWT_SECRET_KEY=${JWT_SECRET_KEY}
JWT_EXPIRES_IN=7d

# SWAO EGR-01: Alphavantage (non-sovereign US API)
ALPHAVANTAGE_API_KEY=demo

BACKEND_PORT=4000
FRONTEND_PORT=3000
NODE_ENV=development
EOF
success ".env erstellt"

# Schritt 3: Docker Compose starten
info "Starte Docker Compose (--build)…"
docker compose up --build -d
success "Container gestartet"

# Schritt 4: Warten bis postgres healthy ist
info "Warte auf PostgreSQL…"
MAX_ATTEMPTS=30
ATTEMPT=0
until docker compose exec -T postgres pg_isready -U gewinnspiel -d gewinnspiel_db &>/dev/null; do
  ATTEMPT=$((ATTEMPT + 1))
  if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
    error "PostgreSQL ist nach ${MAX_ATTEMPTS} Versuchen nicht erreichbar."
    docker compose logs postgres
    exit 1
  fi
  sleep 2
  echo -n "."
done
echo ""
success "PostgreSQL bereit"

# Schritt 5: Prisma DB Push
info "Führe Prisma DB Push aus…"
sleep 3  # Backend kurz warten lassen
docker compose exec -T backend npx prisma db push --accept-data-loss
success "Datenbank-Schema synchronisiert"

# Erfolgs-Ausgabe
echo ""
echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════════════╗"
echo "║              Setup erfolgreich abgeschlossen!        ║"
echo "╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BOLD}Frontend:${NC}  http://localhost:3000"
echo -e "  ${BOLD}Backend:${NC}   http://localhost:4000"
echo -e "  ${BOLD}API Docs:${NC}  http://localhost:4000/api"
echo ""
echo -e "  ${YELLOW}Smoke-Test:${NC}"
echo "  curl http://localhost:4000/api/auth/register \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"email\":\"test@demo.de\",\"password\":\"Sicher123!\"}'"
echo ""
echo -e "  ${YELLOW}Stoppen:${NC}  docker compose down"
echo -e "  ${YELLOW}Logs:${NC}     docker compose logs -f"
echo ""
