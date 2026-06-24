"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
	FormDescription,
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
	contactFormSchema,
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
	const [serverMessage, setServerMessage] = useState<string | null>(null);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const form = useForm<ContactFormValues>({
		resolver: zodResolver(contactFormSchema),
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
				<CardTitle>Contact Form</CardTitle>
				<CardDescription>
					Collect inbound project requests with a reusable client-safe form.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form className="space-y-5" noValidate onSubmit={form.handleSubmit(handleSubmit)}>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input autoComplete="name" placeholder="Ada Lovelace" {...field} />
									</FormControl>
									<FormDescription>
										Use the contact name you want tied to the request.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											autoComplete="email"
											inputMode="email"
											placeholder="ada@analytical.engine"
											type="email"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Use a delivery address that can receive follow-up.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="message"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Message</FormLabel>
									<FormControl>
										<Textarea
											className="min-h-32 resize-y"
											placeholder="Project scope, timing, constraints, and any relevant context."
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Capture enough detail to qualify the request before backend wiring.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<CardFooter className="mt-6 justify-end gap-2 px-0">
							<Button onClick={handleReset} type="button" variant="outline">
								Reset
							</Button>
							<Button disabled={form.formState.isSubmitting} type="submit">
								{form.formState.isSubmitting ? "Sending..." : "Send message"}
							</Button>
						</CardFooter>
						{serverMessage ? <p className="text-sm text-destructive">{serverMessage}</p> : null}
						{isSubmitted ? (
							<p className="text-sm text-muted-foreground">Message submitted successfully.</p>
						) : null}
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
