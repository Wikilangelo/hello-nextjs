# Coding Patterns

Patterns documented here are derived exclusively from code present in this repository.
Do not follow patterns from Next.js documentation or training data without verifying them
against `node_modules/next/dist/docs/` first.

---

## Env Layer

Two files in `src/env/`:

**`src/env/server.ts`** — server-only variables, validated at boot:

```ts
import { z } from "zod";

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
```

**`src/env/client.ts`** — `NEXT_PUBLIC_*` variables only, currently empty schema:

```ts
import { z } from "zod";

const clientEnvSchema = z.object({});

export const clientEnv = clientEnvSchema.parse({});
```

Rules:
- Never import `src/env/server.ts` from a client component or client-side module.
- Never read `process.env` directly outside these two files.
- Add new variables to the appropriate schema; the parse call will fail at boot if they are missing.

---

## Drizzle

**Schema** (`src/db/schema.ts`):

```ts
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

Column naming: camelCase in TypeScript, snake_case in SQL (pass the SQL name explicitly).

**Client** (`src/db/index.ts`):

```ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/env/server";
import * as schema from "./schema";

const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema });
```

Import `db` from `@/db` in server-side code only.

**Migrations**:
- Generate: `npm run db:generate` → writes SQL to `drizzle/`
- Apply: `npm run db:migrate`
- Config file: `drizzle.config.ts` at project root (uses `dotenv/config` to load `.env`)
- Output directory: `drizzle/` at project root

---

## Forms

Schema, defaults, and types are defined separately from the component (`src/lib/schemas/`):

```ts
// src/lib/schemas/contact.ts
import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Enter at least 2 characters.").max(80, "Use 80 characters or fewer."),
  email: z.email("Enter a valid email address."),
  message: z.string().trim().min(20, "Enter at least 20 characters.").max(1000, "Use 1000 characters or fewer."),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const contactFormDefaults: ContactFormValues = {
  name: "",
  email: "",
  message: "",
};
```

The component (`src/components/forms/`) is a `"use client"` component that:
1. Receives an `onSubmit` callback that returns `Promise<ActionResult<unknown>>`
2. Wires RHF via `useForm` with `zodResolver`
3. Uses `defaultValues` from the schema file
4. Calls `form.reset(defaults)` after successful submission

```ts
const form = useForm<ContactFormValues>({
  resolver: zodResolver(contactFormSchema),
  defaultValues: contactFormDefaults,
});
```

The submit handler calls the callback with validated values — delivery logic is not inside the component.

---

## shadcn/ui

Components live in `src/components/ui/`. They are not auto-generated at runtime — they are
source files in the repository.

Add a new component via the shadcn CLI:

```bash
npx shadcn add <component-name>
```

The CLI writes to `src/components/ui/` using the configuration in `components.json`.

Extending a component: edit the file directly. For variants, use CVA (`class-variance-authority`):

```ts
const buttonVariants = cva("base-classes", {
  variants: {
    variant: { default: "...", outline: "..." },
    size: { default: "...", sm: "..." },
  },
  defaultVariants: { variant: "default", size: "default" },
});
```

Components export a named function (not default export) and attach `data-slot="<name>"` to the
root element — this is used by parent components for CSS selector targeting.

Use `cn()` for conditional class composition (see below).

---

## Route Handler Pattern

```ts
// src/app/api/<resource>/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages } from "@/db/schema";

export async function GET() {
  const data = await db.select().from(messages);
  return NextResponse.json({ ok: true, messages: data });
}
```

- File location: `src/app/api/<resource>/route.ts`
- Export named async functions for each HTTP method (`GET`, `POST`, etc.)
- Import `db` and schema tables directly — no service layer currently exists
- Return `NextResponse.json()`
- Validate request bodies with Zod before any DB operation (see `src/lib/schemas/`)

---

## Server Actions

Server Actions live in dedicated files under `src/actions/` with `"use server"` at the top of
the file so they can be imported into Client Components or passed from Server Components.

### ActionResult

All Server Actions return the same serializable shape from `src/lib/actions/action-result.ts`:

```ts
type ActionSuccess<T> = [T] extends [undefined] ? { ok: true } : { ok: true; data: T };

type ActionFailure =
  | {
      ok: false;
      errors: Record<string, string[]>;
    }
  | {
      ok: false;
      message: string;
    };

export type ActionResult<T = undefined> = ActionSuccess<T> | ActionFailure;
```

- Success without payload: `{ ok: true }`
- Success with payload: `{ ok: true, data }`
- Validation failure: `{ ok: false, errors }`
- Safe infrastructure failure: `{ ok: false, message }`

This is a discriminated union. Callers branch on `ok` first, then narrow with `"errors" in result`
or `"message" in result`.

### actionError helper

Use `src/lib/actions/action-error.ts` for unexpected failures:

```ts
import type { ActionResult } from "@/lib/actions/action-result";

export function actionError<T = undefined>(
  message = "Something went wrong. Please try again.",
): ActionResult<T> {
  return {
    ok: false,
    message,
  };
}
```

This keeps provider, database, and infrastructure errors off the client.

### Contact action

Real example from `src/actions/contact.ts`:

```ts
"use server";

import { db } from "@/db";
import { messages } from "@/db/schema";
import { actionError } from "@/lib/actions/action-error";
import type { ActionResult } from "@/lib/actions/action-result";
import { contactFormSchema } from "@/lib/schemas/contact";

function getFieldErrors(fieldErrors: Record<string, string[] | undefined>): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(fieldErrors).filter((entry): entry is [string, string[]] => Boolean(entry[1]?.length)),
  );
}

export async function submitContact(input: unknown): Promise<ActionResult<{ id: number; content: string }>> {
  const result = contactFormSchema.safeParse(input);

  if (!result.success) {
    return {
      ok: false,
      errors: getFieldErrors(result.error.flatten().fieldErrors),
    };
  }

  try {
    const [message] = await db
      .insert(messages)
      .values({ content: result.data.message })
      .returning({
        id: messages.id,
        content: messages.content,
      });

    return {
      ok: true,
      data: message,
    };
  } catch (error) {
    console.error(error);
    return actionError();
  }
}
```

Rules:
- Always validate input with `safeParse` before touching the DB
- Return `ActionResult`, not raw objects with inconsistent shapes
- Never import from `"use client"` components
- Access env only via `src/env/server.ts`
- Log unexpected infrastructure errors server-side and return a safe `message`
- Never expose raw database, provider, or stack-trace details to the client

### Client form flow

`src/components/forms/contact-form.tsx` keeps transport and mutation logic outside the
component. It receives a typed `onSubmit` prop and maps the action result back into RHF:

```ts
import { type FieldPath, useForm } from "react-hook-form";

type ContactFormProps = {
  onSubmit: (values: ContactFormValues) => Promise<ActionResult<unknown>>;
};

const contactFieldNames = {
  email: true,
  message: true,
  name: true,
} satisfies Record<FieldPath<ContactFormValues>, true>;

function isContactFieldName(field: string): field is FieldPath<ContactFormValues> {
  return field in contactFieldNames;
}

async function handleSubmit(values: ContactFormValues) {
  form.clearErrors();
  setServerMessage(null);
  setIsSubmitted(false);

  const result = await onSubmit(values);

  if (!result.ok) {
    if ("errors" in result) {
      for (const [field, messages] of Object.entries(result.errors)) {
        if (!isContactFieldName(field)) {
          continue;
        }

        const message = messages[0];

        if (!message) {
          continue;
        }

        form.setError(field, {
          type: "server",
          message,
        });
      }
    }

    if ("message" in result) {
      setServerMessage(result.message);
    }

    return;
  }

  setIsSubmitted(true);
  form.reset(contactFormDefaults);
}
```

Flow:
1. RHF validates on the client with `zodResolver`
2. The form calls the Server Action with typed values
3. The Server Action validates again with `safeParse`
4. Validation failures return structured `errors`
5. The client narrows field names with a type guard before calling `form.setError()`
6. Infrastructure failures return a safe `message`
7. Success resets the form and shows confirmation

---

## Email (Resend)

The Resend client is a singleton in `src/lib/resend.ts`:

```ts
import { Resend } from "resend";
import { env } from "@/env/server";

export const resend = new Resend(env.RESEND_API_KEY);
```

Email templates live in `src/emails/` as plain React components. Do not use `@react-email/components` — the package is deprecated. Plain JSX with inline styles is the established pattern:

```tsx
// src/emails/contact-notification.tsx
type ContactNotificationProps = { name: string; email: string; message: string };

export function ContactNotification({ name, email, message }: ContactNotificationProps) {
  return (
    <html lang="it">
      <head><meta charSet="utf-8" /><title>Nuovo messaggio di contatto</title></head>
      <body style={{ fontFamily: "sans-serif", color: "#111", maxWidth: "600px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "18px" }}>Nuovo messaggio di contatto</h1>
        <p><strong>Nome:</strong> {name}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Messaggio:</strong></p>
        <p style={{ whiteSpace: "pre-wrap" }}>{message}</p>
      </body>
    </html>
  );
}
```

Email helpers are plain server-side functions — they live in `src/lib/notifications/`, return `ActionResult`, and never expose Resend error details to the client. Use `resend.emails.send()` — it returns `{ data, error }` (no throw):

```tsx
// src/lib/notifications/contact.tsx
export async function sendContactNotification(data: ContactFormValues): Promise<ActionResult> {
  const { error } = await resend.emails.send({
    from: env.CONTACT_FROM_EMAIL,
    to: env.CONTACT_EMAIL,
    subject: `New contact message from ${data.name}`,
    react: <ContactNotification {...data} />,
  });

  if (error) {
    const err = new Error(`Resend error: ${error.message}`);
    logger.error({ err }, "[send-email] Resend delivery failed");
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  return { ok: true };
}
```

Email delivery is **best-effort** — `submitContact` calls `sendContactNotification` after a successful DB insert and logs failures server-side, but always returns `{ ok: true }` to the client. The message is persisted regardless of email delivery:

```ts
const emailResult = await sendContactNotification(result.data);
if (!emailResult.ok) {
  logger.error("[contact] Email notification failed after DB insert");
}
return { ok: true, data: message };
```

Env variables required (add to `src/env/server.ts`):
- `RESEND_API_KEY: z.string().min(1)`
- `CONTACT_EMAIL: z.email()`
- `CONTACT_FROM_EMAIL: z.email()` — sender address, must match a verified Resend domain

---

## `cn()` Utility

```ts
// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Import as `import { cn } from "@/lib/utils"`. Use for all conditional class merging in components.

---

## Naming Conventions

Observed in the codebase:

| What | Convention |
|---|---|
| Component files | `kebab-case.tsx` (e.g. `contact-form.tsx`, `button.tsx`) |
| Component exports | Named function, PascalCase (e.g. `export function ContactForm`) |
| Schema files | `kebab-case.ts` inside `src/lib/schemas/` |
| DB schema exports | camelCase singular (e.g. `messages`) |
| Route handlers | `route.ts` inside `src/app/api/<resource>/` |
| Env exports | `env` from server, `clientEnv` from client |
| Type exports | Named, co-located with schema (e.g. `ContactFormValues`) |
| Path alias | `@/` maps to `src/` |
| SQL column names | snake_case string passed as first argument to column helpers |

---

## next-intl (i18n)

Locales: `it` (default, no prefix) and `en` (prefix `/en`). Mode: `as-needed`.

**Routing config** (`src/i18n/routing.ts`):

```ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["it", "en"],
  defaultLocale: "it",
  localePrefix: { mode: "as-needed" },
});

export type Locale = (typeof routing.locales)[number];
```

**Request config** (`src/i18n/request.ts`) — loaded by the next-intl plugin:

```ts
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

**Proxy** (`src/proxy.ts`) — Next.js 16 renamed middleware to proxy, export named `proxy`:

```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export const proxy = createMiddleware(routing);

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)", "/"],
};
```

**Locale layout** (`src/app/[locale]/layout.tsx`):
- Has `html`/`body` (root `app/layout.tsx` just renders `{children}`)
- Calls `setRequestLocale(locale)` for static rendering
- Wraps with `<NextIntlClientProvider messages={messages}>`
- params is a `Promise<{ locale: string }>` — always `await params`

**Using translations:**

```ts
// Server components / Server Actions
import { getTranslations } from "next-intl/server";
const t = await getTranslations("Namespace");

// Client components ("use client")
import { useTranslations } from "next-intl";
const t = useTranslations("Namespace");
```

**Translation files** live in `messages/` at project root — `it.json` (default), `en.json`.
Keys are namespaced by component/page (e.g. `"HomePage"`, `"ContactForm"`).

**next.config.ts** wrapping order:

```ts
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
export default withSentryConfig(withNextIntl(nextConfig), sentryOptions);
```

Rules:
- Never import `next-intl/server` in `"use client"` components — use `useTranslations` instead.
- `messages/` is NOT inside `src/` — the import path in `request.ts` uses `../../messages/`.
- Always call `setRequestLocale(locale)` at the top of locale layouts and pages for static rendering.

---

## Vitest + Testing Library

Config: `vitest.config.ts` at project root. Environment: `jsdom`. Setup file: `src/test/setup.ts`.

`@vitejs/plugin-react` is pinned to `^4` (v6+ requires `@babel/core@8` which conflicts with `shadcn`'s `@babel/core@7`).

**Setup** (`src/test/setup.ts`):

```ts
import "@testing-library/jest-dom";
```

**Mock for next-intl** in client component tests — `useTranslations` returns `"Namespace.key"`:

```ts
vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) => `${namespace}.${key}`,
}));
```

**Typed mock for Server Actions**:

```ts
import { type Mock, vi } from "vitest";
import type { ActionResult } from "@/lib/actions/action-result";
import type { ContactFormValues } from "@/lib/schemas/contact";

let onSubmit: Mock<(values: ContactFormValues) => Promise<ActionResult<unknown>>>;
onSubmit = vi.fn().mockResolvedValue({ ok: true });
```

Test files live in `src/test/` mirroring the source structure:
- `src/test/schemas/` — Zod schema validation tests (pure, no DOM)
- `src/test/lib/` — utility function tests (pure, no DOM)
- `src/test/actions/` — action helper tests (pure, no DOM)
- `src/test/forms/` — React component render + interaction tests

Scripts: `npm run test` (single run), `npm run test:watch` (watch mode).

---

## Playwright E2E

Config: `playwright.config.ts` at project root. Browser: Chromium only. Test dir: `tests/e2e/`.

`webServer` auto-starts `npm run dev` before the suite and reuses an existing server locally.

**Locale-aware selectors** — use the translated label text from `messages/it.json` (default locale):

```ts
await page.getByLabel("Nome").fill("Ada Lovelace");
await page.getByRole("button", { name: "Invia messaggio" }).click();
```

Tests that require a live database (e.g. successful form submit) should be skipped in CI unless the DB is available. Validation and UI tests (client-side RHF errors) work without a DB.

Script: `npm run test:e2e`.
