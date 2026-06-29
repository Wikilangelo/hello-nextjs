# hello-nextjs

Base template for customer projects. Built on Next.js 16 with App Router, Drizzle ORM, Neon, and a typed env layer. Ships with a working contact form, i18n (IT/EN), auth, email delivery, error tracking, and structured logging — ready to rename and deploy.

> For architectural decisions, coding conventions, and AI agent instructions, see [AGENTS.md](AGENTS.md).

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (CSS-first, no config file) |
| UI components | shadcn/ui |
| Database | Neon (PostgreSQL serverless) |
| ORM | Drizzle ORM |
| Forms | React Hook Form + Zod |
| Auth | Better Auth (email+password, Drizzle adapter) |
| Email | Resend |
| Error tracking | Sentry |
| Logging | Pino |
| i18n | next-intl v4 (IT default, EN at `/en`) |
| Formatter | Biome |
| Linter | ESLint (react-hooks, @next/next, jsx-a11y, @typescript-eslint) |
| Node.js | 22.x |

---

## Prerequisites

Create accounts and collect credentials before running setup:

- **Neon** — create a project; copy the connection string from the dashboard. Create a `staging` branch in addition to `main`.
- **Resend** — create an API key; verify the sender domain you plan to use for `CONTACT_FROM_EMAIL`.
- **Sentry** — create a Next.js project; copy the DSN.
- **Better Auth** — no external account needed; generate a secret with `openssl rand -hex 32`.
- Node.js 22.x installed locally (`node -v` to verify).

---

## Setup — new project from this template

```bash
# 1. Clone or use "Use this template" on GitHub, then install dependencies
npm ci

# 2. Copy the env file and fill in every value (see Environment Variables below)
cp .env.example .env.local

# 3. Run the database migrations
npm run db:migrate

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

`.env.example` is the canonical reference — it is committed to the repo and documents every variable. Copy it to `.env.local` (never commit `.env.local`).

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Neon connection string with `?sslmode=require` |
| `RESEND_API_KEY` | Yes | Resend API key |
| `CONTACT_EMAIL` | Yes | Address that receives contact form submissions |
| `CONTACT_FROM_EMAIL` | Yes | Sender address — must match a verified Resend domain |
| `SENTRY_DSN` | Yes | Sentry DSN (server-side) |
| `NEXT_PUBLIC_SENTRY_DSN` | Yes | Sentry DSN (client-side, same value) |
| `BETTER_AUTH_SECRET` | Yes | Random secret ≥ 32 chars (`openssl rand -hex 32`) |
| `BETTER_AUTH_URL` | Yes | Full origin URL of the app (e.g. `https://your-domain.com`) |
| `LOG_LEVEL` | No | Pino log level — defaults to `info` |

The app fails to boot if any required variable is missing or malformed. This is intentional — see `src/env/server.ts`.

---

## Development

```bash
npm run dev          # start dev server at http://localhost:3000
npm run lint         # Biome + ESLint
npm run lint:fix     # auto-fix Biome issues
npm run typecheck    # TypeScript — no emit
npm run build        # production build (runs after lint + typecheck in CI)
```

---

## Database

```bash
npm run db:generate  # generate a new migration from schema changes
npm run db:migrate   # apply pending migrations to the database in DATABASE_URL
npm run db:studio    # open Drizzle Studio
```

Schema lives in `src/db/schema.ts`. Migrations are output to `drizzle/` at the project root.

**Before running `db:migrate` on a non-empty table:** check whether pending migrations add `NOT NULL` columns without a `DEFAULT`. If the table already has rows, the migration will fail. See `drizzle/` for the SQL files.

---

## Testing

```bash
npm test             # Vitest unit + integration tests (watch-free)
npm run test:watch   # Vitest in watch mode
npm run test:e2e     # Playwright end-to-end tests
```

E2E tests require a running dev or preview server. Playwright is configured in `playwright.config.ts` and starts the dev server automatically.

---

## Deploy

The deployment target is an OVH VPS running Docker Swarm via Dokploy. The GitHub Actions CI pipeline runs in this order and must not be reordered:

1. `npm run lint`
2. `npm run typecheck`
3. `npm run build`

For infrastructure details, environment variable injection, Cloudflare setup, and Neon branch strategy, see [AGENTS.md § 7 Infrastructure & Deployment](AGENTS.md).

---

## Customising the template

After cloning, the minimum set of changes for a new customer project:

1. Update `package.json` — change `name` and `version`.
2. Fill in `messages/en.json` and `messages/it.json` — replace `{{placeholder}}` values in the `HomePage` section.
3. Update `src/app/[locale]/layout.tsx` — set the correct `<title>` and metadata.
4. Populate all variables in `.env.local` (and the equivalent in your Dokploy service environment).
5. Point `CONTACT_EMAIL` and `CONTACT_FROM_EMAIL` to the client's addresses.
6. Run `npm run db:migrate` against the production Neon branch.
