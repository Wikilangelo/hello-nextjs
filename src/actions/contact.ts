"use server";

import { db } from "@/db";
import { messages } from "@/db/schema";
import { actionError } from "@/lib/actions/action-error";
import type { ActionResult } from "@/lib/actions/action-result";
import { contactFormSchema } from "@/lib/schemas/contact";

function getFieldErrors(
	fieldErrors: Record<string, string[] | undefined>,
): Record<string, string[]> {
	return Object.fromEntries(
		Object.entries(fieldErrors).filter((entry): entry is [string, string[]] =>
			Boolean(entry[1]?.length),
		),
	);
}

export async function submitContact(
	input: unknown,
): Promise<ActionResult<{ id: number; content: string }>> {
	const result = contactFormSchema.safeParse(input);

	if (!result.success) {
		return {
			ok: false,
			errors: getFieldErrors(result.error.flatten().fieldErrors),
		};
	}

	try {
		const [message] = await db
			.insert(messages)
			.values({
				content: result.data.message,
			})
			.returning({
				id: messages.id,
				content: messages.content,
			});

		return {
			ok: true,
			data: message,
		};
	} catch (error) {
		console.error(error);

		return actionError();
	}
}
