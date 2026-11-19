import { expect, test } from "@playwright/test";

test("landing page renders the HIVE identity and calls to action", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Learn together");
  await expect(page.getByRole("link", { name: /get started/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /sign in/i }).first()).toBeVisible();
});

test("login page renders accessible form fields", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.getByLabel(/^Password/)).toBeVisible();
  await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
});

test("protected dashboard redirects unauthenticated users to sign in", async ({ page }) => {
  await page.goto("/student/dashboard");
  // Unconfigured backends report `not_configured`; a configured backend reports
  // `auth_required`. Both must land the visitor on the login page with a reason.
  await expect(page).toHaveURL(/\/login\?reason=(not_configured|auth_required)/);
});

test("mobile viewport keeps the primary call to action visible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("link", { name: /join your class/i })).toBeVisible();
});
