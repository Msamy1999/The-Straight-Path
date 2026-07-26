# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS builder
WORKDIR /app
ARG NEXT_PUBLIC_SITE_URL=https://the-straight-path.169.58.54.165.sslip.io
ENV NEXT_TELEMETRY_DISABLED=1
ENV PAYLOAD_SECRET=build-only-placeholder-not-used-at-runtime
ENV DATABASE_URI=file:/tmp/the-straight-path-build.db
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npx --no-install tsx payload/import-drafts.ts --status=reviewed \
  && test -s /tmp/the-straight-path-build.db
RUN npm run build

FROM dependencies AS content-sync
WORKDIR /app
ENV NODE_ENV=production
COPY . .
CMD ["npx", "--no-install", "tsx", "payload/import-drafts.ts", "--status=reviewed"]

FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=4173

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs \
  && mkdir -p /app/data \
  && chown nextjs:nodejs /app/data

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /tmp/the-straight-path-build.db /app/bootstrap/payload.db

USER nextjs
EXPOSE 4173

HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:4173/api/health').then((response)=>{if(!response.ok)process.exit(1)}).catch(()=>process.exit(1))"]

CMD ["sh", "-c", "if [ ! -s /app/data/payload.db ]; then cp /app/bootstrap/payload.db /app/data/payload.db; fi; exec node server.js"]
