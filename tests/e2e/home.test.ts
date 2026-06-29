import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
	test("loads and renders a top-level heading", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
	});

	test("renders an h1 at /en", async ({ page }) => {
		await page.goto("/en");
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
	});

	test("renders an h1 at / (default locale)", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
	});
});
