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
