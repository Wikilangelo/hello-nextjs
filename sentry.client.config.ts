import * as Sentry from "@sentry/nextjs";
import { clientEnv } from "./src/env/client";

Sentry.init({
	dsn: clientEnv.NEXT_PUBLIC_SENTRY_DSN,
	tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
	debug: false,
});
