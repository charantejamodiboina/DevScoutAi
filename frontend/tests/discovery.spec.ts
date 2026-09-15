import { test, expect } from "@playwright/test";

test("user can discover job opportunities", async ({ page }) => {
  await page.goto("/discovery");

  await expect(
    page.getByRole("heading", {
      name: "Discover Opportunities",
    })
  ).toBeVisible();

  await page
    .getByPlaceholder("Bangalore, Chennai, Hyderabad...")
    .fill("Bangalore");

  await page.getByRole("combobox").selectOption("24");

  // Listen for API requests
  page.on("request", request => {
    if (request.url().includes("api.devscoutai.c4you.in")) {
      console.log("API REQUEST:", request.method(), request.url());
    }
  });

  // Listen for API responses
  page.on("response", async response => {
    if (response.url().includes("api.devscoutai.c4you.in")) {
      console.log(
        "API RESPONSE:",
        response.status(),
        response.url()
      );

      try {
        console.log("BODY:", await response.text());
      } catch {
        // Ignore response body errors
      }
    }
  });

  await page.getByRole("button", {
    name: "Discover opportunities",
  }).click();

  await page.waitForTimeout(10000);

  console.log("CURRENT URL:", page.url());

  console.log(
    "PAGE TEXT:",
    await page.locator("body").innerText()
  );
});