import { expect, test } from "@playwright/test";

const PROTECTED_STUDENT_ROUTES = [
  "/student/courses",
  "/student/documents",
  "/student/timetable",
  "/student/assignments",
  "/student/tasks",
  "/student/opportunities",
  "/student/discussions",
  "/student/notifications",
  "/student/saved",
  "/student/settings",
];

for (const route of PROTECTED_STUDENT_ROUTES) {
  test(`${route} redirects unauthenticated visitors`, async ({ page }) => {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login\?reason=(not_configured|auth_required)/);
  });
}

test("staff areas remain closed to unauthenticated visitors", async ({ page }) => {
  await page.goto("/representative/dashboard");
  await expect(page).toHaveURL(/\/login\?reason=(not_configured|auth_required)/);

  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/login\?reason=(not_configured|auth_required)/);
});
