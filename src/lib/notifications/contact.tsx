import { ContactNotification } from "@/emails/contact-notification";
import { env } from "@/env/server";
import type { ActionResult } from "@/lib/actions/action-result";
import { logger } from "@/lib/logger";
import { resend } from "@/lib/resend";
import type { ContactFormValues } from "@/lib/schemas/contact";

export async function sendContactNotification(data: ContactFormValues): Promise<ActionResult> {
	const { error } = await resend.emails.send({
		from: env.CONTACT_FROM_EMAIL,
		to: env.CONTACT_EMAIL,
		subject: `New contact message from ${data.name}`,
		react: <ContactNotification email={data.email} message={data.message} name={data.name} />,
	});

	if (error) {
		const err = new Error(`Resend error: ${error.message}`);
		logger.error({ err }, "[send-email] Resend delivery failed");
		return { ok: false, message: "Something went wrong. Please try again." };
	}

	return { ok: true };
}
