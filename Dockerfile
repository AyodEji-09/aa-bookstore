###############################################################################
# Stage 1 — Build the Medusa backend
###############################################################################
FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy root workspace manifests first (layer cache for npm install)
COPY package.json package-lock.json turbo.json ./

# Create a minimal storefront stub so the "apps/**" workspace glob resolves
# without copying the real storefront code into the build.
RUN mkdir -p apps/storefront && echo '{"name":"@ayollc-bookstore/storefront","version":"0.0.0","private":true}' > apps/storefront/package.json

# Copy backend package.json for dependency resolution
COPY apps/backend/package.json apps/backend/

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy backend source code
COPY apps/backend/ apps/backend/

# Build the Medusa backend (compiles TypeScript + admin dashboard)
RUN cd apps/backend && npx medusa build

###############################################################################
# Stage 2 — Production runtime (no build tooling, no source code)
###############################################################################
FROM node:20-alpine AS runner

RUN apk add --no-cache tini

WORKDIR /app

ENV NODE_ENV=production

# Copy the compiled server output
COPY --from=builder /app/apps/backend/.medusa/server ./

# Install only production dependencies for the compiled server
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev

EXPOSE 9000

# Use tini as PID 1 for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

CMD ["npx", "medusa", "start"]
