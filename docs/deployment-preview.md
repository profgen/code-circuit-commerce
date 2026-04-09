# Deployment Preview Runbook

## 1) Local preview stack

1. Ensure Docker runtime is started.
2. From repository root:
   - `pnpm preview:up`
3. Run DB migrations once API is up:
   - `pnpm --filter api prisma:migrate:dev --name preview_bootstrap`
4. Seed data:
   - `pnpm --filter api prisma:seed`
5. Open:
   - Web: `http://localhost:3000`
   - API health: `http://localhost:4000/health`
   - API readiness: `http://localhost:4000/health/ready`

Stop stack:
- `pnpm preview:down`

## 2) Hosted preview/prod contract

Required environment variables:
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `CORS_ORIGIN`
- `NEXT_PUBLIC_API_URL`
- `API_INTERNAL_URL` (for server-side calls from web runtime)

## 3) Image build/push

Use workflow:
- `.github/workflows/deploy-preview.yml`

It publishes:
- `ghcr.io/<owner>/<repo>/api:<sha>`
- `ghcr.io/<owner>/<repo>/web:<sha>`

## 4) Recommended hosting

- Web: Vercel or CloudFront + container runtime
- API: AWS ECS Fargate (or Render/Fly as interim)
- DB: managed PostgreSQL
- Cache: managed Redis
