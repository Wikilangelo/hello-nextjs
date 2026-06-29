import * as Sentry from "@sentry/nextjs";
import { env } from "./src/env/server";

Sentry.init({
	dsn: env.SENTRY_DSN,
	tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
	debug: false,
});
