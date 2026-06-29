import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
	test("loads and displays the heading", async ({ page }) => {
		await page.goto("/");
		await expect(page).toHaveTitle(/hello-nextjs/i);
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
	});

	test("loads the English version at /en", async ({ page }) => {
		await page.goto("/en");
		await expect(page.getByRole("heading", { level: 1 })).toContainText(
			"Start from a lean form-ready SaaS baseline.",
		);
	});

	test("loads the Italian version at /", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByRole("heading", { level: 1 })).toContainText(
			"Parti da una base SaaS lean",
		);
	});
});
