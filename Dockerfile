###############################################################################
# Stage 1 — Build the Medusa backend
#
# Uses Debian-based image (not Alpine) because @swc/core and other native
# modules ship pre-built binaries for glibc, not musl.
###############################################################################
FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy root workspace manifests first (layer cache for npm install)
COPY package.json package-lock.json turbo.json ./

# Create a minimal storefront stub so the "apps/**" workspace glob resolves
# without copying the real storefront code into the build.
RUN mkdir -p apps/storefront && \
    echo '{"name":"@ayollc-bookstore/storefront","version":"0.0.0","private":true}' > apps/storefront/package.json

# Copy backend package.json for dependency resolution
COPY apps/backend/package.json apps/backend/

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy backend source code
COPY apps/backend/ apps/backend/

# Build the Medusa backend (compiles TypeScript + admin dashboard)
RUN cd apps/backend && npx medusa build

###############################################################################
# Stage 2 — Production runtime (lean image, no build tooling)
###############################################################################
FROM node:20-alpine AS runner

RUN apk add --no-cache tini

WORKDIR /app

ENV NODE_ENV=production

# Copy the compiled server output (already plain JS, no native build needed)
COPY --from=builder /app/apps/backend/.medusa/server ./

# Install only production dependencies for the compiled server
RUN npm install --omit=dev

EXPOSE 9000

# Use tini as PID 1 for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

CMD ["npx", "medusa", "start"]
