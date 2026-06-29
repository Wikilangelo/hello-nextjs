# Tech Stack

## Runtime & Framework

| Package | Exact version |
|---|---|
| Node.js | `22.x` (required via `engines`) |
| Next.js | `16.2.9` |
| React / React DOM | `19.2.4` |
| TypeScript | `^5` |

## Styling

| Package | Exact version |
|---|---|
| tailwindcss | `^4` |
| @tailwindcss/postcss | `^4` |
| shadcn (CLI) | `^4.11.0` |
| @radix-ui/react-slot | `^1.3.0` |
| class-variance-authority | `^0.7.1` |
| clsx | `^2.1.1` |
| tailwind-merge | `^3.6.0` |
| lucide-react | `^1.21.0` |

Tailwind v4 is CSS-first: no `tailwind.config.js`. Configuration lives in `globals.css` via `@theme inline {}`.
Design tokens use `oklch()` color space throughout — do not convert to hex.

## Database

| Package | Exact version |
|---|---|
| drizzle-orm | `^0.45.2` |
| drizzle-kit | `^0.31.10` |
| @neondatabase/serverless | `^1.1.0` |

Connection uses `neon-http` (not WebSocket). Client is instantiated in `src/db/index.ts`.
Schema lives in `src/db/schema.ts`. Migrations output to `drizzle/`.
Config file is `drizzle.config.ts` at project root (not inside `src/`).

## Forms & Validation

| Package | Exact version |
|---|---|
| zod | `^4.4.3` |
| react-hook-form | `^7.80.0` |
| @hookform/resolvers | `^5.4.0` |

## Email

| Package | Exact version |
|---|---|
| resend | `^6.14.0` |

Email templates live in `src/emails/` as plain React components (no react-email primitives — `@react-email/components` is deprecated). The Resend singleton is in `src/lib/resend.ts`. Email actions live in `src/actions/` with `"use server"` and return `ActionResult`.

## Toolchain Decision

### Biome `^2.5.1` — formatter + organize imports only

Biome is the single source of truth for:
- Code formatting (tabs, line width 100, double quotes, semicolons always)
- Import organization (via `assist.actions.source.organizeImports`)

Do **not** add `eslint-prettier` or any ESLint formatting rules. Biome and ESLint overlap
on `no-unused-vars` / `no-unused-expressions` — this is accepted duplication, not a conflict.

### ESLint `^9` + `eslint-config-next 16.2.9` — linting only

ESLint covers the categories Biome does not:
- `react-hooks/rules-of-hooks` and `react-hooks/exhaustive-deps`
- `@next/next/*` (Image, Link, Font, script optimization rules)
- `jsx-a11y` (alt-text, aria-props, aria-proptypes, role validation)
- `@typescript-eslint/recommended`

The `lint` script runs both sequentially: `biome check . && eslint .`

## What NOT to Use

| What | Why |
|---|---|
| `eslint-prettier` | Biome owns formatting; adding eslint-prettier would conflict and is redundant |
| `tailwind.config.js` | Tailwind v4 uses CSS-first config — a JS config file is the v3 pattern |
| Direct `process.env` access | Always go through `src/env/server.ts` or `src/env/client.ts` |
| `Math.random()` for security-relevant values | Non-cryptographic; use `crypto.randomUUID()` |
| WebSocket Neon driver | This project uses `neon-http`; switching drivers requires changing `drizzle/` config |

## Note on Next.js 16

Next.js `16.2.9` is a post-training-cutoff version. APIs, conventions, and file structure may
differ from training data. Read `node_modules/next/dist/docs/` before writing code that uses:
- App Router data fetching patterns
- Server Actions API
- Metadata API
- Font optimization

The AGENTS.md at project root states this explicitly and is authoritative.
