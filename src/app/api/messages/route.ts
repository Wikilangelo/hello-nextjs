import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { logger } from "@/lib/logger";

export async function GET() {
	try {
		const data = await db.select().from(messages);

		return NextResponse.json({
			ok: true,
			messages: data,
		});
	} catch (error) {
		logger.error({ err: error }, "[api/messages] GET failed");

		return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
	}
}
