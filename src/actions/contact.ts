"use server";

import { getTranslations } from "next-intl/server";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { actionError } from "@/lib/actions/action-error";
import type { ActionResult } from "@/lib/actions/action-result";
import { logger } from "@/lib/logger";
import { sendContactNotification } from "@/lib/notifications/contact";
import { createContactFormSchema } from "@/lib/schemas/contact";

function getFieldErrors(
	fieldErrors: Record<string, string[] | undefined>,
): Record<string, string[]> {
	return Object.fromEntries(
		Object.entries(fieldErrors).filter((entry): entry is [string, string[]] =>
			Boolean(entry[1]?.length),
		),
	);
}

export async function submitContact(input: unknown): Promise<ActionResult<null>> {
	const t = await getTranslations("ContactForm");
	const schema = createContactFormSchema({
		nameMin: t("errorNameMin"),
		nameMax: t("errorNameMax"),
		emailInvalid: t("errorEmailInvalid"),
		messageMin: t("errorMessageMin"),
		messageMax: t("errorMessageMax"),
	});
	const result = schema.safeParse(input);

	if (!result.success) {
		// Validation failures are expected — not captured by Sentry
		return {
			ok: false,
			errors: getFieldErrors(result.error.flatten().fieldErrors),
		};
	}

	try {
		await db.insert(messages).values({
			name: result.data.name,
			email: result.data.email,
			content: result.data.message,
		});

		const emailResult = await sendContactNotification(result.data);
		if (!emailResult.ok) {
			logger.error("[contact] Email notification failed after DB insert");
		}

		return {
			ok: true,
			data: null,
		};
	} catch (error) {
		logger.error({ err: error }, "[contact] DB insert failed");

		return actionError(t("errorGeneric"));
	}
}
