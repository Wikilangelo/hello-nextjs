import * as Sentry from "@sentry/nextjs";
import pino from "pino";
import { env } from "@/env/server";

function makeSentryStream() {
	return {
		write(msg: string) {
			try {
				const parsed = JSON.parse(msg) as { level?: number; err?: unknown; msg?: string };
				// pino level 50 = error, 60 = fatal
				if (parsed.level !== undefined && parsed.level >= 50) {
					const err = parsed.err instanceof Error ? parsed.err : new Error(parsed.msg ?? msg);
					Sentry.captureException(err);
				}
			} catch {
				// non-JSON output — ignore
			}
		},
	};
}

export const logger = pino(
	{ level: env.LOG_LEVEL },
	pino.multistream([
		{
			stream:
				process.env.NODE_ENV === "development"
					? (await import("pino-pretty")).default({ colorize: true })
					: process.stdout,
		},
		{ stream: makeSentryStream(), level: "error" },
	]),
);
