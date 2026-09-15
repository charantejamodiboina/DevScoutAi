import { test, expect } from "@playwright/test";

test("user can login and access authenticated page", async ({ page }) => {
  const email = process.env.DEVSCOUT_TEST_EMAIL;
  const password = process.env.DEVSCOUT_TEST_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "DEVSCOUT_TEST_EMAIL and DEVSCOUT_TEST_PASSWORD are not set"
    );
  }

  await page.goto("/login");

  await page
    .getByPlaceholder("you@example.com")
    .fill(email);

  await page
    .getByPlaceholder("Enter your password")
    .fill(password);

  await page
    .getByRole("button", { name: "Sign in" })
    .click();

  await expect(page).not.toHaveURL(/\/login/);

  const token = await page.evaluate(() =>
    localStorage.getItem("access_token")
  );

  const user = await page.evaluate(() =>
    localStorage.getItem("user")
  );

  expect(token).not.toBeNull();
  expect(user).not.toBeNull();
});

test('discovery page loads jobs', async ({ page }) => {
  await page.goto('/discovery');

  await expect(
    page.getByRole('heading', { name: /discovery/i })
  ).toBeVisible();

  await expect(
    page.locator('[data-testid="opportunity-card"]').first()
  ).toBeVisible();
});