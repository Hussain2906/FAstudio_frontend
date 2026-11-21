FROM node:22-bookworm-slim AS build
WORKDIR /workspace
RUN corepack enable && corepack prepare pnpm@12.14.0 --activate
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN test -n "$NEXT_PUBLIC_API_URL" || (echo "NEXT_PUBLIC_API_URL is required at build time" >&2; exit 1)
RUN pnpm --dir packages/cms-contracts install --frozen-lockfile \
  && pnpm --dir packages/cms-contracts build
RUN pnpm --dir packages/design-system install --frozen-lockfile \
  && pnpm --dir packages/design-system generate
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM node:22-bookworm-slim AS runtime
WORKDIR /workspace
RUN npm install --global --no-fund --no-audit pnpm@12.14.0
ARG NEXT_PUBLIC_API_URL
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
COPY --from=build --chown=node:node /workspace /workspace
USER node
EXPOSE 3000
CMD ["pnpm", "start"]
