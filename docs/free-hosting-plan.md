# Free Hosting Plan (Recommended)

## Stack choice

- API + Web: Render free web services
- Database: Neon PostgreSQL free tier
- Domain/DNS: Keep in Hostinger, point records to Render

This is the best free path for your current architecture (NestJS + Next.js + Prisma).

## 1) Create Neon database

1. Create a Neon project.
2. Copy the pooled connection string.
3. Use it as `DATABASE_URL` in Render for API.

## 2) Deploy on Render from this repo

1. Connect your GitHub repo in Render.
2. Use blueprint deploy with `render.yaml`.
3. Render will create:
   - `codecircuit-api`
   - `codecircuit-web`

## 3) Configure API environment variables (Render)

- `DATABASE_URL` = Neon pooled URL
- `JWT_ACCESS_SECRET` = long random secret
- `JWT_REFRESH_SECRET` = long random secret
- `JWT_ACCESS_EXPIRES_IN` = `15m`
- `JWT_REFRESH_EXPIRES_IN` = `7d`
- `STRIPE_SECRET_KEY` = your Stripe key (or a placeholder for now)
- `STRIPE_WEBHOOK_SECRET` = your webhook secret (or placeholder)
- `CORS_ORIGIN` = `https://codecircuit.org`

After first deploy, run migrations once from Render shell:
- `pnpm --filter api exec prisma migrate deploy`
- `pnpm --filter api prisma:seed`

## 4) Configure Web environment variables (Render)

- `NEXT_PUBLIC_API_URL` = your Render API public URL (later `https://api.codecircuit.org`)
- `API_INTERNAL_URL` = same API URL (or internal service URL if available)

## 5) Wire Hostinger domain

In Hostinger DNS:
- `A` or `CNAME` for `codecircuit.org` -> Render web target
- `CNAME` for `api.codecircuit.org` -> Render API target

Then set:
- API `CORS_ORIGIN=https://codecircuit.org`
- Web `NEXT_PUBLIC_API_URL=https://api.codecircuit.org`
- Web `API_INTERNAL_URL=https://api.codecircuit.org`

## 6) Verify

- `https://api.codecircuit.org/health`
- `https://api.codecircuit.org/health/ready`
- `https://codecircuit.org`
