"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { type FieldPath, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/lib/actions/action-result";
import {
	type ContactFormValues,
	contactFormDefaults,
	createContactFormSchema,
} from "@/lib/schemas/contact";

type ContactFormProps = {
	onSubmit: (values: ContactFormValues) => Promise<ActionResult<unknown>>;
};

const contactFieldNames = {
	email: true,
	message: true,
	name: true,
} satisfies Record<FieldPath<ContactFormValues>, true>;

function isContactFieldName(field: string): field is FieldPath<ContactFormValues> {
	return field in contactFieldNames;
}

export function ContactForm({ onSubmit }: ContactFormProps) {
	const t = useTranslations("ContactForm");
	const errorNameMin = t("errorNameMin");
	const errorNameMax = t("errorNameMax");
	const errorEmailInvalid = t("errorEmailInvalid");
	const errorMessageMin = t("errorMessageMin");
	const errorMessageMax = t("errorMessageMax");
	const schema = useMemo(
		() =>
			createContactFormSchema({
				nameMin: errorNameMin,
				nameMax: errorNameMax,
				emailInvalid: errorEmailInvalid,
				messageMin: errorMessageMin,
				messageMax: errorMessageMax,
			}),
		[errorNameMin, errorNameMax, errorEmailInvalid, errorMessageMin, errorMessageMax],
	);
	const [serverMessage, setServerMessage] = useState<string | null>(null);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const form = useForm<ContactFormValues>({
		resolver: zodResolver(schema),
		defaultValues: contactFormDefaults,
	});

	async function handleSubmit(values: ContactFormValues) {
		form.clearErrors();
		setServerMessage(null);
		setIsSubmitted(false);

		const result = await onSubmit(values);

		if (!result.ok) {
			if ("errors" in result) {
				for (const [field, messages] of Object.entries(result.errors)) {
					if (!isContactFieldName(field)) {
						continue;
					}

					const message = messages[0];

					if (!message) {
						continue;
					}

					form.setError(field, {
						type: "server",
						message,
					});
				}
			}

			if ("message" in result) {
				setServerMessage(result.message);
			}

			return;
		}

		setIsSubmitted(true);
		form.reset(contactFormDefaults);
	}

	function handleReset() {
		form.reset(contactFormDefaults);
		setIsSubmitted(false);
		setServerMessage(null);
	}

	return (
		<Card className="w-full max-w-xl">
			<CardHeader>
				<CardTitle>{t("title")}</CardTitle>
				<CardDescription>{t("description")}</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						className="flex flex-col gap-5"
						noValidate
						onSubmit={form.handleSubmit(handleSubmit)}
					>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("name")}</FormLabel>
									<FormControl>
										<Input autoComplete="name" placeholder={t("namePlaceholder")} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("email")}</FormLabel>
									<FormControl>
										<Input
											autoComplete="email"
											inputMode="email"
											placeholder={t("emailPlaceholder")}
											spellCheck={false}
											type="email"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="message"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("message")}</FormLabel>
									<FormControl>
										<Textarea
											className="min-h-32 resize-y"
											placeholder={t("messagePlaceholder")}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<CardFooter className="mt-6 justify-end gap-2 px-0">
							<Button onClick={handleReset} type="button" variant="outline">
								{t("reset")}
							</Button>
							<Button disabled={form.formState.isSubmitting} type="submit">
								{form.formState.isSubmitting ? t("submitting") : t("submit")}
							</Button>
						</CardFooter>
						<div aria-atomic="true" aria-live="polite" className="flex flex-col gap-2">
							{serverMessage ? <p className="text-sm text-destructive">{serverMessage}</p> : null}
							{isSubmitted ? (
								<div className="flex flex-col gap-1">
									<p className="text-sm font-medium">{t("successTitle")}</p>
									<p className="text-sm text-muted-foreground">{t("successDescription")}</p>
								</div>
							) : null}
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
