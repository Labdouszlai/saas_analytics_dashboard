# Pulse — Self-Hostable Analytics Dashboard

A commercial-grade SaaS analytics dashboard built with **Next.js (App Router)**, **PostgreSQL**, **Drizzle ORM**, and **Better Auth**. Sign in to monitor revenue, customers, transactions, and traffic with filtering, charts, and CSV export.

It is **fully self-hostable** — no Vercel-specific features are required. It runs on any VPS, Docker container, or Node.js host, and connects to any PostgreSQL database via a standard connection string.

## Features

- Email + password authentication (Better Auth) with session cookies
- Per-user data isolation — every account gets its own seeded demo dataset on signup
- Dashboard with KPI cards, revenue & customer-growth charts, recent transactions, and traffic sources
- Analytics page with revenue, traffic, and growth charts + one-click CSV export
- Searchable, paginated customer directory with per-customer detail views
- Settings: profile, password change, and light/dark/system theme
- 7 / 30 / 90-day date range filtering across the app

## Requirements

- Node.js 18+ and [pnpm](https://pnpm.io)
- A PostgreSQL database (local, Docker, or any provider)

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

| Variable             | Required | Description                                                                 |
| -------------------- | -------- | --------------------------------------------------------------------------- |
| `DATABASE_URL`       | Yes      | PostgreSQL connection string, e.g. `postgresql://user:pass@host:5432/db`    |
| `BETTER_AUTH_SECRET` | Yes      | Random string (32+ chars). Generate with `openssl rand -base64 32`          |
| `BETTER_AUTH_URL`    | Yes\*    | The public base URL of your app, e.g. `https://analytics.example.com`. For local dev, defaults to `http://localhost:3000` |

\* Required in production. In development, `http://localhost:3000` is trusted automatically.

## Getting Started

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment
cp .env.example .env
# edit .env with your DATABASE_URL and BETTER_AUTH_SECRET

# 3. Create the database tables
pnpm db:push

# 4. Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, and a realistic demo dataset is generated for you automatically.

## Database Scripts

| Script             | Description                                            |
| ------------------ | ------------------------------------------------------ |
| `pnpm db:push`     | Create/update tables from the Drizzle schema           |
| `pnpm db:generate` | Generate SQL migration files                           |
| `pnpm db:studio`   | Open Drizzle Studio to inspect data                    |
| `pnpm db:seed`     | Manually seed demo data (reads `DATABASE_URL` from `.env`) |

## Production Build

```bash
pnpm build
pnpm start
```

### Docker

The app is a standard Next.js server. A minimal Dockerfile:

```dockerfile
FROM node:20-alpine
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile && pnpm build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["pnpm", "start"]
```

Pass `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` as runtime environment variables.

## Architecture

```
app/
  page.tsx                 Landing page (redirects authed users to /dashboard)
  sign-in, sign-up         Auth pages (shared client form)
  (app)/                   Protected shell: sidebar + topbar
    dashboard              KPIs, charts, transactions, traffic
    analytics              Charts + CSV export
    customers, [id]        Directory + detail
    settings               Profile, password, theme
  api/auth/[...all]        Better Auth handler
  api/analytics/export     CSV export endpoint
lib/
  auth.ts                  Better Auth server config (env-based base URL)
  auth-client.ts           Better Auth React client
  db/                      Drizzle client, schema, queries, seed
middleware.ts              Redirects unauthenticated users to /sign-in
```

All database access goes through Drizzle and is scoped per `userId` — there is no shared global state and no row-level-security dependency.

## License

You own your deployment and your data. Adapt freely.
