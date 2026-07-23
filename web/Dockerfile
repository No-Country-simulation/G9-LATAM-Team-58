# React front served by nginx. Multi-stage: node builds the static bundle, nginx
# serves it. Both images are multi-arch, so this builds natively on the ARM VM.
#
# NOTE: web/ is still just a README -- there is no package.json yet. In
# docker-compose.yml this service sits behind `profiles: [web]`, so it does NOT
# build until the real front lands. Drop that profile line once web/ is real.

FROM node:20-slim AS build
WORKDIR /build

RUN corepack enable

# Copy manifests first so the dependency layer is cached and only re-runs when
# they change. --frozen-lockfile mirrors the CI job (ci.yml).
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM nginx:alpine
# try_files fallback (SPA routing) + /api proxy. See web/nginx.conf.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /build/dist /usr/share/nginx/html

EXPOSE 80
