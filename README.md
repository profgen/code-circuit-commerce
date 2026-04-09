# Code Circuit Commerce

AI-first e-commerce bootstrap built with Next.js, NestJS, PostgreSQL, Redis, and Stripe.

## Quick start

1. Copy env files:
   - `cp .env.example .env`
   - `cp apps/api/.env.example apps/api/.env`
   - `cp apps/web/.env.example apps/web/.env.local`
2. Start local services:
   - `docker compose up -d`
3. Install and run:
   - `pnpm install`
   - `pnpm --filter api prisma:generate`
   - `pnpm --filter api prisma:migrate:dev --name init`
   - `pnpm --filter api prisma:seed`
   - `pnpm dev`

## Preview deploy (today)

- Start full preview stack with containers:
  - `pnpm preview:up`
- Run migrations and seed:
  - `pnpm --filter api prisma:migrate:dev --name preview_bootstrap`
  - `pnpm --filter api prisma:seed`
- Validate readiness:
  - `http://localhost:4000/health`
  - `http://localhost:4000/health/ready`
- Stop preview stack:
  - `pnpm preview:down`

Full runbook: `docs/deployment-preview.md`

## Free hosting path

If you do not want a VPS yet, use:
- Render (API + Web)
- Neon (PostgreSQL)

Setup guide: `docs/free-hosting-plan.md`

## Apps

- `apps/web`: customer storefront
- `apps/api`: backend API

## Core API routes

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /products`
- `GET /products/:slug`
- `GET /cart` (auth)
- `POST /cart/items` (auth)
- `DELETE /cart/items/:productId` (auth)
- `POST /checkout/init` (auth)
- `GET /orders` (auth)
- `POST /payments/webhook`
- `GET /health`
