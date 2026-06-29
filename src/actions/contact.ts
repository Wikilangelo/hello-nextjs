"use server";

import { getTranslations } from "next-intl/server";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { actionError } from "@/lib/actions/action-error";
import type { ActionResult } from "@/lib/actions/action-result";
import { logger } from "@/lib/logger";
import { sendContactNotification } from "@/lib/notifications/contact";
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
		// Validation failures are expected — not captured by Sentry
		return {
			ok: false,
			errors: getFieldErrors(result.error.flatten().fieldErrors),
		};
	}

	try {
		const [message] = await db
			.insert(messages)
			.values({
				name: result.data.name,
				email: result.data.email,
				content: result.data.message,
			})
			.returning({
				id: messages.id,
				content: messages.content,
			});

		const emailResult = await sendContactNotification(result.data);
		if (!emailResult.ok) {
			logger.error("[contact] Email notification failed after DB insert");
		}

		return {
			ok: true,
			data: message,
		};
	} catch (error) {
		logger.error({ err: error }, "[contact] DB insert failed");

		const t = await getTranslations("ContactForm");
		return actionError(t("errorGeneric"));
	}
}
