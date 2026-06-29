import { z } from "zod";

const serverEnvSchema = z.object({
	DATABASE_URL: z.url(),
	RESEND_API_KEY: z.string().min(1),
	CONTACT_EMAIL: z.email(),
	CONTACT_FROM_EMAIL: z.email(),
	SENTRY_DSN: z.url(),
	LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"]).default("info"),
	BETTER_AUTH_SECRET: z.string().min(32),
	BETTER_AUTH_URL: z.url(),
});

const parsedServerEnv = serverEnvSchema.safeParse({
	DATABASE_URL: process.env.DATABASE_URL,
	RESEND_API_KEY: process.env.RESEND_API_KEY,
	CONTACT_EMAIL: process.env.CONTACT_EMAIL,
	CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
	SENTRY_DSN: process.env.SENTRY_DSN,
	LOG_LEVEL: process.env.LOG_LEVEL,
	BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
	BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
});

if (!parsedServerEnv.success) {
	throw new Error(`Invalid server environment variables: ${parsedServerEnv.error.message}`);
}

export const env = parsedServerEnv.data;
