# Use the official Bun image as the base image
FROM oven/bun:alpine AS base

ENV USEDOCKER=true

WORKDIR /app

# Install dependencies only when needed
FROM base AS deps

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json bun.lock* bun.lockb* yarn.lock* package-lock.json* pnpm-lock.yaml* ./

RUN bun install --frozen-lockfile

# The runtime needs the pinned Prisma CLI to apply committed migrations.
FROM base AS production-deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production
# Fetch the platform's schema engine at build time, never at app startup.
RUN bun node_modules/prisma/build/index.js version

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

COPY next.config.ts tsconfig.json ./

RUN bun x prisma generate
# Build the application using Bun
RUN bun run build

# Production image, copy all the files and run with Bun
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

# Create user and group with different GID and UID if needed
RUN addgroup --system --gid 1002 bunjs || echo "Group exists" && \
    adduser --system --uid 1002 nextjs || echo "User exists"

COPY --from=builder /app/public ./public
COPY --from=production-deps --chown=nextjs:bunjs /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --chmod=755 docker-entrypoint.sh ./docker-entrypoint.sh

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:bunjs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:bunjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:bunjs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN ls -l /app

# Use Bun to run server.js
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["bun", "run", "server.js"]
