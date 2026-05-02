# syntax=docker/dockerfile:1
# Multi-stage: build Vite client, run Express API + static SPA from one process.

FROM node:20-bookworm-slim AS client-build

WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client/ ./
# Same-origin API calls when the SPA is served by Express (omit or leave empty)
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM node:20-bookworm-slim AS production

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5001

COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

COPY server/src ./src
COPY --from=client-build /app/client/dist ./public

RUN chown -R node:node /app
USER node

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||5001)+'/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "src/index.js"]
