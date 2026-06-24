# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

---

## 1. Project Overview

- **Name:** hello-nextjs
- **Purpose:** Base template for all customer projects
- **Hosting:** OVH VPS (Ubuntu 24.04) via Dokploy + Docker Swarm
- **Domains:** `hello.wikilangelo.com`, `staging.hello.wikilangelo.com` — Cloudflare Full Strict
- **Database:** Neon — 1 project per customer, production + staging branches
- **CI/CD:** GitHub Actions → Dokploy — pipeline: lint → typecheck → build
- **Node.js:** `22.x` (required — see `package.json` engines)
- **Monitoring:** Uptime Kuma; backups to Cloudflare R2

---

## 2. Absolute Rules

1. Never read `process.env` directly — always use `src/env/server.ts` or `src/env/client.ts`.
2. Never use `dangerouslySetInnerHTML`.
3. Never put secrets in `NEXT_PUBLIC_*` variables — they are inlined into the client bundle.
4. Never use `Math.random()` for security-relevant values — use `crypto.randomUUID()`.
5. Every Route Handler that accepts a body must validate it with `zod.safeParse` before any DB operation.
6. Every Server Action must validate its input with `zod.safeParse` before any DB operation.
7. Never import `src/env/server.ts` from a `"use client"` component or any client-side module.
8. Never add `eslint-prettier` — Biome owns formatting.
9. Never use `tailwind.config.js` — Tailwind v4 is CSS-first.
10. Before every commit: `npm run lint && npm run typecheck && npm run build`.

---

## 3. Stack

| Package | Version |
|---|---|
| Next.js | `16.2.9` |
| React / React DOM | `19.2.4` |
| TypeScript | `^5` |
| tailwindcss | `^4` |
| drizzle-orm | `^0.45.2` |
| @neondatabase/serverless | `^1.1.0` |
| zod | `^4.4.3` |
| react-hook-form | `^7.80.0` |
| @hookform/resolvers | `^5.4.0` |
| shadcn (CLI) | `^4.11.0` |
| @radix-ui/react-slot | `^1.3.0` |
| class-variance-authority | `^0.7.1` |
| lucide-react | `^1.21.0` |
| @biomejs/biome | `^2.5.1` |
| eslint / eslint-config-next | `^9` / `16.2.9` |
| Node.js | `22.x` |

**Next.js 16 note:** Post-training-cutoff version. Read `node_modules/next/dist/docs/` before using App Router patterns, Server Actions, Metadata API, or font optimization.

### Toolchain

- **Biome** — formatter + organize imports only. Config: `biome.json`.
- **ESLint** — linting only: react-hooks, @next/next, jsx-a11y, @typescript-eslint. Config: `eslint.config.mjs`.
- `lint` script runs both: `biome check . && eslint .`

### What NOT to Use

| What | Why |
|---|---|
| `eslint-prettier` | Biome owns formatting — conflict guaranteed |
| `tailwind.config.js` | Tailwind v4 uses CSS-first config in `globals.css` |
| Direct `process.env` | Always go through `src/env/` |
| `Math.random()` for secrets/tokens | Non-cryptographic |
| WebSocket Neon driver | Project uses `neon-http`; switching requires migration changes |
| Self-hosted PostgreSQL | Neon is the decision for customer projects |

---

## 4. Folder Structure

```
src/
├── app/              # Next.js App Router — pages, layouts, route handlers
│   └── api/          # Route Handlers (server-only, named exports per HTTP method)
├── components/
│   ├── forms/        # "use client" form components wired to RHF + Zod
│   └── ui/           # shadcn/ui primitives — source-owned, edit directly
├── db/               # Drizzle client (index.ts) and schema (schema.ts)
├── env/              # Typed env validation — server.ts and client.ts only
└── lib/
    ├── schemas/      # Zod schemas shared between client components and server
    └── utils.ts      # cn() utility
```

Rules:
- Zod schemas shared between client and server go in `src/lib/schemas/`, not inline.
- `src/db/` is server-only — never import from client components.
- `src/env/server.ts` is server-only — never import from client components.
- `drizzle.config.ts` and migration output (`drizzle/`) live at project root, not in `src/`.

---

## 5. Coding Patterns

Full detail in `ai/coding-patterns.md`. Minimal reference below.

### Env layer

```ts
// src/env/server.ts — add new server vars here
const serverEnvSchema = z.object({
  DATABASE_URL: z.url(),
});

const parsedServerEnv = serverEnvSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
});

if (!parsedServerEnv.success) {
  throw new Error(`Invalid server environment variables: ${parsedServerEnv.error.message}`);
}

export const env = parsedServerEnv.data;

// src/env/client.ts — add NEXT_PUBLIC_ vars here (no secrets)
const clientEnvSchema = z.object({});
export const clientEnv = clientEnvSchema.parse({});
```

### Drizzle

```ts
// src/db/schema.ts — camelCase in TS, snake_case string in SQL
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// src/db/index.ts
const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema });
```

### Route Handler

```ts
// src/app/api/<resource>/route.ts
export async function POST(request: Request) {
  const parsed = mySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }
  await db.insert(table).values(parsed.data);
  return NextResponse.json({ ok: true });
}
```

### Server Action

```ts
"use server";
export async function myAction(formData: unknown) {
  const parsed = mySchema.safeParse(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.flatten() };
  await db.insert(table).values(parsed.data);
  return { ok: true };
}
```

### Forms

```ts
// Schema + defaults in src/lib/schemas/<name>.ts — not inside the component
export const mySchema = z.object({ ... });
export type MyValues = z.infer<typeof mySchema>;
export const myDefaults: MyValues = { ... };

// Component receives onSubmit as optional prop; delivery logic is external
const form = useForm<MyValues>({ resolver: zodResolver(mySchema), defaultValues: myDefaults });
```

### `cn()`

```ts
import { cn } from "@/lib/utils";
className={cn("base-classes", condition && "conditional-class", className)}
```

---

## 6. Security

Full baseline in `ai/security.md`. Rules summary:

**Secrets & Env:** Never `process.env` directly. Never `NEXT_PUBLIC_` for secrets. `src/env/server.ts` is server-only. Add new variables to the Zod schema — boot fails if missing.

**Input Validation:** `safeParse` before every DB operation in Route Handlers and Server Actions. Client-side validation (RHF) is UX only, not a security control.

**Auth (pending):** No auth system exists yet. Do not add placeholder guards. When Better Auth arrives: session-derived user ID only, httpOnly cookies, scope every query.

**dangerouslySetInnerHTML:** Forbidden.

**Security Headers:** Configured in `next.config.ts` via `headers()`. Add CSP later when
external origins are stable.

**Dependencies:** `npm ci` in CI. `npm audit` before release. `package-lock.json` committed.

**IDOR:** Use `crypto.randomUUID()` for public-facing IDs once user-scoped routes exist. Never expose serial integers as resource identifiers.

**Cryptography:** `crypto.randomUUID()` only. Never `Math.random()` for tokens or IDs.

Security gaps open: see `ai/security-gaps.md`.

---

## 7. Infrastructure & Deployment

**VPS:** OVH VPS-3, Ubuntu 24.04, SSH keys only, root login disabled, UFW + Fail2Ban.

**Container platform:** Docker + Docker Swarm + Dokploy.

**Cloudflare:** Manages all DNS. SSL mode: Full (Strict) — origin must serve valid TLS.

**Neon:** 1 project per customer. Each project has `production` and `staging` branches. Do not use self-hosted PostgreSQL for customer projects.

**Docker:** Pin Node.js version to `22.x`. Use `npm ci`, never `npm install`.

**CI pipeline order (must not be reordered):**
1. `npm run lint`
2. `npm run typecheck`
3. `npm run build`

**Monitoring:** Uptime Kuma at `uptime.wikilangelo.com`.
**Backups:** Cloudflare R2 bucket `wikilangelo-backups` — restore testing pending.

---

## 8. Architectural Decisions

| Decision | Approved | Rejected | Reason |
|---|---|---|---|
| Database hosting | Neon (managed) | Self-hosted PostgreSQL on VPS | Operational complexity, managed backups, PITR |
| Database per tenant | 1 Neon project per customer | Shared project, multiple databases | Isolation, independent scaling |
| ORM | Drizzle ORM | Prisma | Simpler, lighter, SQL-first |
| Folder structure | `src/` first | Mixed root + `src/` | Consistency, Next.js convention |
| Env access | Typed layer in `src/env/` | Direct `process.env` | Type safety, boot-time validation |
| Forms | React Hook Form + Zod | — | Type-safe, reusable, industry standard |
| UI library | shadcn/ui | MUI, Ant Design | Component ownership, Tailwind-native, no vendor lock-in |
| Formatter | Biome | Prettier + eslint-prettier | Single tool, faster, no conflict |
| Node.js version | `22.x` LTS | — | Consistency across local, CI, Dokploy |

---

## 9. Current Status

**Milestone:** Template v1 (~85% complete)

**Completed:**
- src-first architecture
- Biome + ESLint
- Typed env validation (`src/env/`)
- Drizzle + Neon (schema + migration generated)
- React Hook Form + Zod (contact form example)
- shadcn/ui baseline (Button, Card, Form, Input, Textarea)
- Server Actions pattern with typed `ActionResult`, safe error handling, and RHF integration

**Next step:** Resend integration — template-safe email delivery pattern on top of the current
Server Actions architecture

**Known issues:**
- Google Fonts (Geist) fetched during build — no offline fallback
- No testing setup (Vitest + Testing Library planned, Priority 6)
- Contact action currently persists only `message` because the `messages` table does not store
  `name` or `email`

**Roadmap (priority order):** Resend → Sentry → Better Auth → Uploads → Vitest → Observability

---

## 10. Pre-commit Checklist

```bash
npm run lint
npm run typecheck
npm run build
```
