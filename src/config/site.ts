import { env } from "@/env/server";

export const siteConfig = {
	name: "Hello Next.js Template",
	description:
		"Reusable Next.js template for customer websites and applications with forms, internationalization, authentication, and production-ready defaults.",
	url: env.SITE_URL ? new URL(env.SITE_URL) : undefined,
};
