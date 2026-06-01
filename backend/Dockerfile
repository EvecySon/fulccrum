# ─── Stage 1: Install dependencies ───────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --omit=dev && \
    npx prisma generate

# ─── Stage 2: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for build)
RUN npm ci && npx prisma generate

# Copy source code
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src

# Build the application
RUN npm run build

# ─── Stage 3: Production runtime ─────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Add non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy production dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy package.json for metadata
COPY package.json ./

# Create uploads directory
RUN mkdir -p uploads && chown nestjs:nodejs uploads

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start the application
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]
