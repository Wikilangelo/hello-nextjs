import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { ContactForm } from "@/components/forms/contact-form";
import type { ActionResult } from "@/lib/actions/action-result";
import type { ContactFormValues } from "@/lib/schemas/contact";

// next-intl useTranslations returns the key as-is in tests
vi.mock("next-intl", () => ({
	useTranslations: (namespace: string) => (key: string) => `${namespace}.${key}`,
}));

const validValues = {
	name: "Ada Lovelace",
	email: "ada@example.com",
	message: "This is a message with enough characters to pass validation.",
};

describe("ContactForm", () => {
	let onSubmit: Mock<(values: ContactFormValues) => Promise<ActionResult<unknown>>>;

	beforeEach(() => {
		onSubmit = vi.fn().mockResolvedValue({ ok: true });
	});

	it("renders all form fields", () => {
		render(<ContactForm onSubmit={onSubmit} />);
		expect(screen.getByLabelText(/ContactForm.name/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/ContactForm.email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/ContactForm.message/i)).toBeInTheDocument();
	});

	it("renders the submit button", () => {
		render(<ContactForm onSubmit={onSubmit} />);
		expect(screen.getByRole("button", { name: /ContactForm.submit/i })).toBeInTheDocument();
	});

	it("calls onSubmit with valid values", async () => {
		const user = userEvent.setup();
		render(<ContactForm onSubmit={onSubmit} />);

		await user.type(screen.getByLabelText(/ContactForm.name/i), validValues.name);
		await user.type(screen.getByLabelText(/ContactForm.email/i), validValues.email);
		await user.type(screen.getByLabelText(/ContactForm.message/i), validValues.message);
		await user.click(screen.getByRole("button", { name: /ContactForm.submit/i }));

		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledOnce();
			expect(onSubmit).toHaveBeenCalledWith(validValues);
		});
	});

	it("shows success state after successful submit", async () => {
		const user = userEvent.setup();
		render(<ContactForm onSubmit={onSubmit} />);

		await user.type(screen.getByLabelText(/ContactForm.name/i), validValues.name);
		await user.type(screen.getByLabelText(/ContactForm.email/i), validValues.email);
		await user.type(screen.getByLabelText(/ContactForm.message/i), validValues.message);
		await user.click(screen.getByRole("button", { name: /ContactForm.submit/i }));

		await waitFor(() => {
			expect(screen.getByText(/ContactForm.successTitle/i)).toBeInTheDocument();
		});
	});

	it("shows server error message on action failure", async () => {
		onSubmit.mockResolvedValueOnce({ ok: false, message: "Server is down." });
		const user = userEvent.setup();
		render(<ContactForm onSubmit={onSubmit} />);

		await user.type(screen.getByLabelText(/ContactForm.name/i), validValues.name);
		await user.type(screen.getByLabelText(/ContactForm.email/i), validValues.email);
		await user.type(screen.getByLabelText(/ContactForm.message/i), validValues.message);
		await user.click(screen.getByRole("button", { name: /ContactForm.submit/i }));

		await waitFor(() => {
			expect(screen.getByText("Server is down.")).toBeInTheDocument();
		});
	});

	it("does not call onSubmit when name is too short", async () => {
		const user = userEvent.setup();
		render(<ContactForm onSubmit={onSubmit} />);

		await user.type(screen.getByLabelText(/ContactForm.name/i), "A");
		await user.type(screen.getByLabelText(/ContactForm.email/i), validValues.email);
		await user.type(screen.getByLabelText(/ContactForm.message/i), validValues.message);
		await user.click(screen.getByRole("button", { name: /ContactForm.submit/i }));

		await waitFor(() => {
			expect(onSubmit).not.toHaveBeenCalled();
		});
	});
});
