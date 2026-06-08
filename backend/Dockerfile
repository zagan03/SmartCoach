FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Build the TypeScript backend
RUN npm run build

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package files and install production deps only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled JavaScript
COPY --from=builder /app/dist ./dist

# Copy SQL files (needed if running migrations at startup)
COPY sql ./sql

EXPOSE 3001

CMD ["node", "dist/server.js"]
