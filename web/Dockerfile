# React front served by nginx. Multi-stage: node builds the static bundle, nginx
# serves it. Both images are multi-arch, so this builds natively on the ARM VM.
#
# node:22-slim, not 20: corepack pulls pnpm 11.x, which requires Node >=22.13
# (uses the node:sqlite builtin). Node 20 fails with ERR_UNKNOWN_BUILTIN_MODULE.

FROM node:22-slim AS build
WORKDIR /build

RUN corepack enable

# Copy manifests first so the dependency layer is cached and only re-runs when
# they change. --frozen-lockfile mirrors the CI job (ci.yml).
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM nginx:alpine
# try_files fallback (SPA routing) + /api proxy. See web/nginx.conf.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /build/dist /usr/share/nginx/html

# 443 needs the Origin Certificate mounted at /etc/nginx/certs (docker-compose.yml).
EXPOSE 80 443
