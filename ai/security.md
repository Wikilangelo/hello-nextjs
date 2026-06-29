# Security Baseline

Adapted to: Next.js 16 App Router + Drizzle ORM + Neon serverless + Zod.

---

## Secrets & Environment Variables

The env layer in `src/env/` is the only legitimate point of access for environment variables.

Rules:
- Never read `process.env.ANYTHING` directly outside `src/env/server.ts` or `src/env/client.ts`.
- Never use `NEXT_PUBLIC_` prefix for secrets, tokens, or credentials. `NEXT_PUBLIC_` variables
  are inlined into the client bundle and visible to anyone.
- `src/env/server.ts` must never be imported from a `"use client"` component or any module
  that can be included in the client bundle.
- When adding a new secret, add it to the Zod schema in `src/env/server.ts`. The boot-time
  `safeParse` will fail fast if the variable is missing or malformed.
- `.env` must not be committed to the repository.
- `.env.example` must list all required variables with placeholder values.

---

## Input Validation

Zod is the validation layer. Rules:

- Every Route Handler (`src/app/api/*/route.ts`) that accepts a request body must parse it
  with a Zod schema via `safeParse` before any database operation.
- Every Server Action must validate its input with `safeParse` before any database operation.
- Use schemas from `src/lib/schemas/` — do not inline schema definitions in route handlers.
- On validation failure, return a structured error response rather than letting the request
  reach the database.
- Client-side validation (RHF + zodResolver) is a UX aid only. Never rely on it for
  server-side safety.

Example pattern for a Route Handler POST:

```ts
const parsed = contactFormSchema.safeParse(await request.json());
if (!parsed.success) {
  return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
}
```

---

## Auth

No authentication system is present in the codebase at this time. Better Auth has been
identified as the planned solution (see project documentation).

Rules to follow when auth arrives:
- Protect every Route Handler and Server Action that accesses user-scoped data by checking
  session at the top of the function, before any DB query.
- Never trust a user ID from the request body or query string for scoping DB queries —
  always derive the user ID from the verified session.
- Session tokens must be stored in httpOnly cookies, not localStorage.
- Until auth is implemented, no route is "protected" — do not add fake guards or
  placeholder `if (!user) return` checks without a real session system behind them.

---

## `dangerouslySetInnerHTML`

Forbidden. Do not use `dangerouslySetInnerHTML` anywhere in the codebase.
If rendering user-provided content is required, use a sanitization library and document the
decision explicitly at the call site.

---

## Security Headers

Security headers must be configured in `next.config.ts` via the `headers()` async function.
They are currently present in `next.config.ts`.

Minimum set to add:

```ts
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];
```

A Content-Security-Policy header should be added once the full set of external origins
(fonts, analytics, etc.) is stable.
// X-XSS-Protection is deprecated and must not be added.
// XSS protection is provided by JSX escaping (React) and a well-configured CSP.

---

## Dependency Management

- `package-lock.json` must be committed and kept in sync.
- Use `npm ci` in CI/CD pipelines, not `npm install`.
- Run `npm audit` before each release and address Critical and High findings.
- Do not use `--ignore-scripts` as a substitute for understanding what a package does.
- The `engines` field in `package.json` pins Node.js to `22.x` — enforce this in CI.

---

## IDOR (Insecure Direct Object Reference)

No user-scoped data exists yet. When auth and user-scoped resources are introduced:

- Use UUIDs (not sequential integers) as public-facing resource identifiers in routes.
  The `messages` table currently uses a serial `id` — this must be changed before exposing
  individual message routes to authenticated users.
- Every DB query that fetches a resource by ID must include a `WHERE userId = sessionUserId`
  clause (or equivalent scope).
- Never expose the internal numeric primary key in API responses for user-facing resources.

---

## Cryptography

- Use `crypto.randomUUID()` (Node.js built-in, available in Next.js server context) for
  generating UUIDs, tokens, or any security-relevant random value.
- Never use `Math.random()` for security-relevant values — it is not cryptographically secure.
- Never implement custom hashing or encryption. Use established libraries when the need arises.
