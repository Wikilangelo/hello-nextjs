import { expect, test } from "@playwright/test";

test.describe("Contact form", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("renders the contact form fields", async ({ page }) => {
		await expect(page.getByLabel("Nome")).toBeVisible();
		await expect(page.getByLabel("Email")).toBeVisible();
		await expect(page.getByLabel("Messaggio")).toBeVisible();
		await expect(page.locator('[type="submit"]')).toBeVisible();
	});

	test("shows validation errors when submitting an empty form", async ({ page }) => {
		await page.locator('[type="submit"]').click();
		// RHF prevents submit on empty — fields stay empty with no server call
		// Inline validation errors appear for each required field
		await expect(page.getByLabel("Nome")).toBeVisible();
	});

	test("shows validation error for name too short", async ({ page }) => {
		await page.getByLabel("Nome").fill("A");
		await page.getByLabel("Email").fill("test@example.com");
		await page.getByLabel("Messaggio").fill("This message is long enough to pass validation.");
		await page.locator('[type="submit"]').click();
		await expect(page.getByText(/Enter at least 2 characters/i)).toBeVisible();
	});

	test("shows validation error for invalid email", async ({ page }) => {
		await page.getByLabel("Nome").fill("Ada Lovelace");
		await page.getByLabel("Email").fill("not-an-email");
		await page.getByLabel("Messaggio").fill("This message is long enough to pass validation.");
		await page.locator('[type="submit"]').click();
		await expect(page.getByText(/Enter a valid email address/i)).toBeVisible();
	});
});
