import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export const proxy = createMiddleware(routing);

export const config = {
	matcher: [
		// Match all pathnames except Next.js internals and static files
		"/((?!_next|_vercel|.*\\..*).*)",
		// Always match the root
		"/",
	],
};
