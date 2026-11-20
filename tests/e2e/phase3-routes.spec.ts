import { test, expect } from "@playwright/test";

const PROTECTED_ROUTES = [
  "/representative/dashboard",
  "/representative/class",
  "/representative/documents",
  "/representative/timetable",
  "/representative/assignments",
  "/representative/moderation",
  "/representative/notebook",
  "/admin/dashboard",
  "/admin/users",
  "/admin/classes",
  "/admin/ai-monitoring",
  "/admin/audit",
  "/admin/settings",
];

for (const route of PROTECTED_ROUTES) {
  test(`${route} redirects an unauthenticated visitor`, async ({ page }) => {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login/);
  });
}
