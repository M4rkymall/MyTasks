FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# ---- test stage: jenkins runs "docker build --target test ./backend" ----
FROM base AS test
RUN npm test

# ---- production stage: no dev dependencies, non-root user ----
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
# /data holds the SQLite file; it is mounted as a named volume
RUN mkdir -p /data && chown node:node /data
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "src/server.js"]
