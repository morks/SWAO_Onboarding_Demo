# SWAO TF-02: Multi-stage Build — beide Images von Public Docker Hub
# Stage 1: Build (node:20-alpine — Docker Hub)
FROM node:20-alpine AS builder

WORKDIR /app

# Dependencies installieren
COPY package*.json ./
RUN npm ci

# Source kopieren und bauen
COPY . .
RUN npm run build

# Stage 2: Serve (nginx:alpine — Docker Hub)
# SWAO TF-02: nginx:alpine von Public Docker Hub (nicht sovereign Registry)
FROM nginx:alpine

# Custom nginx-Konfiguration (SPA fallback + /api/ proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build-Artefakte aus Stage 1 kopieren
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
