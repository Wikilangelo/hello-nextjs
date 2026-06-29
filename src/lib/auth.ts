import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import { accounts, sessions, users, verifications } from "@/db/schema";
import { env } from "@/env/server";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: { users, sessions, accounts, verifications },
		usePlural: true,
	}),
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	emailAndPassword: {
		enabled: true,
	},
	plugins: [nextCookies()],
});
