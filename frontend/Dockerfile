# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_BASE_URL
ARG VITE_BASIC_AUTH_USER
ARG VITE_BASIC_AUTH_PASSWORD

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_BASIC_AUTH_USER=$VITE_BASIC_AUTH_USER
ENV VITE_BASIC_AUTH_PASSWORD=$VITE_BASIC_AUTH_PASSWORD

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/index.html || exit 1

CMD ["nginx", "-g", "daemon off;"]
