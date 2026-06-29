import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

type Session = Awaited<ReturnType<typeof auth.api.getSession>>;
export type User = NonNullable<Session>["user"];

export async function getCurrentUser(): Promise<User | null> {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		return session?.user ?? null;
	} catch {
		return null;
	}
}

export async function requireUser(): Promise<User> {
	const user = await getCurrentUser();
	if (!user) {
		redirect("/");
	}
	return user;
}
