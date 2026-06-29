import { describe, expect, it } from "vitest";
import { actionError } from "@/lib/actions/action-error";

describe("actionError", () => {
	it("returns ok: false", () => {
		const result = actionError();
		expect(result.ok).toBe(false);
	});

	it("returns the default message", () => {
		const result = actionError();
		expect(result).toEqual({
			ok: false,
			message: "Something went wrong. Please try again.",
		});
	});

	it("returns a custom message", () => {
		const result = actionError("Custom error message.");
		expect(result).toEqual({ ok: false, message: "Custom error message." });
	});

	it("has the ActionResult shape — message variant", () => {
		const result = actionError();
		expect("message" in result).toBe(true);
		expect("errors" in result).toBe(false);
	});
});
