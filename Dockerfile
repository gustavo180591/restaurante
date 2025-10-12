# Base stage for development and building
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Install dependencies first for better caching
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --legacy-peer-deps --no-audit --progress=false

# Build the application
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 nextjs && \
    chown -R nextjs:nodejs /app

# Create necessary directories
RUN mkdir -p .next/static && \
    mkdir -p public 2>/dev/null || :

# Copy necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/package.json .

# Copy next.config.js if it exists
RUN if [ -f /app/next.config.js ]; then \
      cp /app/next.config.js .; \
    fi

# Copy public directory if it exists
RUN if [ -d /app/public ]; then \
      cp -r /app/public/. ./public/; \
    fi

# Copy build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/ .
RUN if [ -d /app/.next/static ]; then \
      cp -r /app/.next/static/ ./.next/static/; \
    fi

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]