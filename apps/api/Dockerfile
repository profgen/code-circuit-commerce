FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/config/package.json packages/config/package.json
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter api prisma:generate
RUN pnpm --filter api build

FROM node:22-alpine AS runner
WORKDIR /app/apps/api
ENV NODE_ENV=production
COPY apps/api/package.json ./
COPY apps/api/prisma ./prisma
RUN npm install --omit=dev --no-audit --no-fund
COPY --from=build /app/apps/api/dist ./dist
EXPOSE 4000
CMD ["node", "dist/src/main.js"]
