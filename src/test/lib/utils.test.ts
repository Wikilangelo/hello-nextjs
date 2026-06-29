import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
	it("returns a single class", () => {
		expect(cn("foo")).toBe("foo");
	});

	it("merges multiple classes", () => {
		expect(cn("foo", "bar")).toBe("foo bar");
	});

	it("filters out falsy values", () => {
		expect(cn("foo", false, null, undefined, "bar")).toBe("foo bar");
	});

	it("resolves tailwind conflicts — last wins", () => {
		expect(cn("p-4", "p-8")).toBe("p-8");
	});

	it("handles conditional classes", () => {
		const active = true;
		expect(cn("base", active && "active")).toBe("base active");
		expect(cn("base", !active && "inactive")).toBe("base");
	});

	it("returns empty string for no input", () => {
		expect(cn()).toBe("");
	});
});
