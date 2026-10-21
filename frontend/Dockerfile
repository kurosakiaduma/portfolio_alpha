# Use Node.js 22 Alpine as base image
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Set up build arguments and environment variables for API URLs
ARG PUBLIC_SITE_URL=http://localhost:4321
ARG BACKEND_URL=http://portfolio-backend
ENV PUBLIC_SITE_URL=$PUBLIC_SITE_URL
ENV BACKEND_URL=$BACKEND_URL

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Enable corepack, install dependencies from pnpm lockfile and run build scripts
RUN corepack enable \
 && corepack prepare pnpm@10.15.0 --activate \
 && pnpm --version \
 && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production stage (Swap Nginx for Node)
FROM node:22-alpine

WORKDIR /app

# Copy the built dist directory containing the server entrypoint
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Astro standalone node adapter runs on port 4321 by default
ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321

# Start the Astro node server
CMD ["node", "./dist/server/entry.mjs"]