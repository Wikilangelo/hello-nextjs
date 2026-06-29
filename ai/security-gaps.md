# Security Gaps

Gaps identified against the baseline in `ai/security.md`.
All items are based on concrete observations in the codebase — no speculative entries.

---

## GAP-001 — `.nvmrc` was missing

**Severity:** Medium
**Status:** ✅ Resolved (2026-06-24) — `.nvmrc` was already present with content `22`.

---

## GAP-002 — `.env.example` was missing

**Severity:** High
**Status:** ✅ Resolved (2026-06-24) — `.env.example` was already present with `DATABASE_URL` placeholder.

---

## GAP-003 — Security headers were absent in `next.config.ts`

**Severity:** High
**Status:** ✅ Resolved (2026-06-24) — `headers()` added to `next.config.ts` with `X-Content-Type-Options`,
`X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`. `X-XSS-Protection` intentionally
excluded (deprecated).

---

## GAP-004 — `layout.tsx` metadata was a placeholder

**Severity:** Medium
**Status:** ✅ Resolved (2026-06-24) — `title` updated to `"hello-nextjs"`, `description` updated to reflect
the actual template purpose. Biome formatting corrected (line wrap at 100 chars).

---

## GAP-005 — `tw-animate-css` was likely redundant with Tailwind v4

**Severity:** Medium
**Status:** ✅ Resolved (2026-06-24) — No `animate-*` classes found in any source file. Removed
`tw-animate-css` from `package.json` dependencies and removed `@import "tw-animate-css"`
from `globals.css`.

---

## GAP-006 — `ContactForm` had no submit integration

**Severity:** Medium
**Status:** ✅ Resolved (2026-06-24) — `src/actions/contact.ts` now validates with
`contactFormSchema.safeParse()`, inserts into `messages`, and returns a typed `ActionResult`.
`src/app/page.tsx` passes `submitContact` into `ContactForm`, and the client maps field
errors back into RHF via `form.setError()`.

---

## GAP-007 — Drizzle migration not applied (or not verifiable)

**Severity:** Medium
**Status:** 🔴 Open

**Current state:** The migration file `drizzle/0000_many_the_fallen.sql` exists and creates
the `messages` table. However, there is no evidence in the repository that this migration
has been applied to any environment. There is no migration state tracking file committed
(Drizzle stores applied migration state in the database, not the filesystem), and no CI
step runs `db:migrate`.

**Suggested action:** Add `db:migrate` to the deployment/CI pipeline so migrations are applied
automatically on deploy. Document the expected database state in a README or setup guide.

**Effort:** S

---

## GAP-008 — `drizzle.config.ts` is outside `src/` with no documentation

**Severity:** Medium
**Status:** ✅ Resolved (2026-06-24) — Added a note to `.env.example` documenting that
`db:generate` and `db:migrate` require a populated `.env` file at runtime.
`drizzle.config.ts` location at project root is now documented in `ai/coding-patterns.md`
(Drizzle section) and `AGENTS.md` (Folder Structure).
