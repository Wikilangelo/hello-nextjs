import { describe, expect, it } from "vitest";
import { actionError } from "@/lib/actions/action-error";

describe("actionError", () => {
	it("returns ok: false", () => {
		const result = actionError("An error occurred.");
		expect(result.ok).toBe(false);
	});

	it("returns the provided message", () => {
		const result = actionError("Custom error message.");
		expect(result).toEqual({ ok: false, message: "Custom error message." });
	});

	it("has the ActionResult shape — message variant", () => {
		const result = actionError("An error occurred.");
		expect("message" in result).toBe(true);
		expect("errors" in result).toBe(false);
	});
});
