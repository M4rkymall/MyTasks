FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# ---- test stage: jenkins runs "docker build --target test ./frontend" ----
FROM base AS test
RUN npm run lint

# ---- build stage: compile static files ----
FROM base AS build
ARG BUILD_NUMBER=dev
ENV VITE_BUILD_NUMBER=$BUILD_NUMBER
RUN npm run build

# ---- production stage: tiny nginx serving static files ----
FROM nginx:1.27-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=15s --timeout=3s CMD wget -qO- http://localhost:80/ >/dev/null || exit 1
