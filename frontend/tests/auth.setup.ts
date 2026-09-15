import { test as setup, expect } from "@playwright/test";

setup("authenticate", async ({ page }) => {
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

  await expect
    .poll(() =>
      page.evaluate(() =>
        localStorage.getItem("access_token")
      )
    )
    .not.toBeNull();

  await page.context().storageState({
    path: "playwright/.auth/user.json",
  });
});