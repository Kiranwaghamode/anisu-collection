# Anisu Collection

Online store for sarees and kurtis. The full spec is in [BUILD_PLAN.md](BUILD_PLAN.md).

## Setup

```bash
npm install                 # also runs `prisma generate`
cp .env.example .env        # then fill in DATABASE_URL / DIRECT_URL (Neon)
npm run db:migrate          # apply migrations
npm run db:seed             # sample categories + products
npm run dev                 # http://localhost:3000
```

Store settings (name, contact details, fees) live in `src/config/store.ts`.
