import { describe, expect, it } from "vitest";
import { contactFormSchema } from "@/lib/schemas/contact";

const validInput = {
	name: "Ada Lovelace",
	email: "ada@example.com",
	message: "This is a message with enough characters to pass validation.",
};

describe("contactFormSchema", () => {
	it("accepts valid input", () => {
		const result = contactFormSchema.safeParse(validInput);
		expect(result.success).toBe(true);
	});

	it("trims whitespace from name and message", () => {
		const result = contactFormSchema.safeParse({
			...validInput,
			name: "  Ada  ",
			message: "  This is a message with enough characters to pass validation.  ",
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe("Ada");
		}
	});

	it("rejects name shorter than 2 characters", () => {
		const result = contactFormSchema.safeParse({ ...validInput, name: "A" });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.flatten().fieldErrors.name).toBeDefined();
		}
	});

	it("rejects name longer than 80 characters", () => {
		const result = contactFormSchema.safeParse({ ...validInput, name: "A".repeat(81) });
		expect(result.success).toBe(false);
	});

	it("rejects invalid email", () => {
		const result = contactFormSchema.safeParse({ ...validInput, email: "not-an-email" });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.flatten().fieldErrors.email).toBeDefined();
		}
	});

	it("rejects message shorter than 20 characters", () => {
		const result = contactFormSchema.safeParse({ ...validInput, message: "Too short" });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.flatten().fieldErrors.message).toBeDefined();
		}
	});

	it("rejects message longer than 1000 characters", () => {
		const result = contactFormSchema.safeParse({ ...validInput, message: "A".repeat(1001) });
		expect(result.success).toBe(false);
	});

	it("rejects missing fields", () => {
		const result = contactFormSchema.safeParse({});
		expect(result.success).toBe(false);
		if (!result.success) {
			const fieldErrors = result.error.flatten().fieldErrors;
			expect(fieldErrors.name).toBeDefined();
			expect(fieldErrors.email).toBeDefined();
			expect(fieldErrors.message).toBeDefined();
		}
	});
});
