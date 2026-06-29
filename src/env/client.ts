import { z } from "zod";

const clientEnvSchema = z.object({
	NEXT_PUBLIC_SENTRY_DSN: z.url(),
});

export const clientEnv = clientEnvSchema.parse({
	NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
});
