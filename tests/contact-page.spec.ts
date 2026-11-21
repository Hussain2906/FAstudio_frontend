import { expect, test } from "@playwright/test";

async function fillRequiredFields(page: import("@playwright/test").Page) {
  await page.getByLabel("Your name").fill("Taylor Morgan");
  await page.getByLabel("Email address").fill("taylor@example.com");
  await page
    .getByLabel("A little about your project")
    .fill("I am planning a calm, functional living space.");
}

test("renders the default Contact page, validated footer channels, and CMS photo fallback", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/contact", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("heading", { level: 1, name: "Let’s talk about your space." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Tell us about your project" }),
  ).toBeVisible();
  await expect(page).toHaveTitle(/Let’s talk about your space\. \| FA Studio/);
  await expect(page.locator("main img")).toHaveCount(1);
  await expect(page.locator("main img")).toHaveAttribute("loading", "eager");
  await expect(page.locator("main img")).not.toHaveAttribute("alt", "");
  await expect(page.locator("main address a[href^='mailto:']")).toHaveCount(1);
  await expect(page.locator("main address a[href^='tel:']")).toHaveCount(1);
  await expect(page.getByLabel("Your name")).toHaveAttribute("maxlength", "120");
  await expect(page.getByLabel("Email address")).toHaveAttribute("maxlength", "254");
  await expect(page.getByLabel("Phone number (optional)")).toHaveAttribute("maxlength", "40");
  await expect(page.getByLabel("A little about your project")).toHaveAttribute("maxlength", "5000");
  await expect(page.locator("#contact-website")).toHaveCount(1);

  for (const [width, height] of [
    [320, 740],
    [390, 844],
    [768, 1024],
    [1024, 768],
    [1440, 900],
  ]) {
    await page.setViewportSize({ width, height });
    const dimensions = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    }));
    expect(dimensions.documentWidth, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(
      dimensions.viewportWidth,
    );
  }
});

test("provides inline required-field errors and focuses the summary", async ({ page }) => {
  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Send message" }).click();

  const summary = page.locator("#contact-error-summary");
  await expect(summary).toContainText("Please correct the following fields");
  await expect(summary).toBeFocused();
  await expect(page.getByLabel("Your name")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#contact-name-error")).toHaveText("Enter your name.");
  await expect(page.getByLabel("Email address")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("A little about your project")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
});

test("sends the CMS-selected project type and honeypot field, then confirms success", async ({
  page,
}) => {
  let submitted: Record<string, unknown> | null = null;
  await page.route("**/contact/enquiries", async (route) => {
    expect(route.request().method()).toBe("POST");
    submitted = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ received: true }),
    });
  });

  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  await fillRequiredFields(page);
  await page.getByLabel("Phone number (optional)").fill("+1 416 555 0142");
  await page.getByLabel("Service you’re enquiring about").selectOption("Space Planning");
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByRole("status")).toContainText("Thank you. Your enquiry has been sent.");
  expect(submitted).toMatchObject({
    name: "Taylor Morgan",
    email: "taylor@example.com",
    phone: "+1 416 555 0142",
    projectType: "Space Planning",
    message: "I am planning a calm, functional living space.",
    website: "",
  });
  await expect(page.getByLabel("Your name")).toHaveValue("");
});

test("shows email and phone recovery links when the enquiry endpoint is unavailable", async ({
  page,
}) => {
  await page.route("**/contact/enquiries", (route) => route.abort("failed"));
  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  await fillRequiredFields(page);
  await page.getByRole("button", { name: "Send message" }).click();

  const status = page.getByRole("status");
  await expect(status).toContainText(
    "The online enquiry form is temporarily unavailable. Please email or phone the Studio.",
  );
  await expect(status.locator("a[href^='mailto:']")).toHaveText("Email the Studio");
  await expect(status.locator("a[href^='tel:']")).toHaveText("Call the Studio");
  await expect(page.getByLabel("Your name")).toHaveValue("Taylor Morgan");
});
