FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat
RUN apk update

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

# it will identify whatever package manager is configured for the current project,
# transparently install it if needed, and finally run it without requiring explicit user interactions.
RUN corepack enable
RUN pnpm install turbo --global
COPY . ./

FROM base AS builder

WORKDIR /app
RUN turbo prune --scope=micro-image --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer

WORKDIR /app
# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ /app/json/
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

# Build the project
COPY --from=builder /app/out/full/ /app/full/
COPY turbo.json /app/turbo.json
# Uncomment and use build args to enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM

# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

RUN turbo build --filter=micro-image

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN #addgroup --system --gid 1001 expressjs
RUN #adduser --system --uid 1001 expressjs
#USER expressjs
COPY --from=installer /app .

#CMD turbo dev --filter micro-image
#CMD node apps/image/dist/server.js
CMD cd apps/image && pnpm dev
