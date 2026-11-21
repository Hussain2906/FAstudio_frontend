import { expect, test } from "@playwright/test";

const viewports = [
  [320, 740],
  [390, 844],
  [768, 1024],
  [1024, 768],
  [1440, 900],
] as const;

test("Process page renders an honest, CMS-backed zero-step fallback", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/process", { waitUntil: "domcontentloaded" });

  const heading = page.getByRole("heading", { level: 1, name: "The design process" });
  await expect(heading).toBeVisible();
  await expect(page.getByRole("link", { name: "Discuss your project" })).toHaveAttribute(
    "href",
    "/contact",
  );
  await expect(page.locator("main img")).toHaveCount(1);
  await expect(page.locator("main img")).toHaveAttribute("loading", "eager");
  await expect(page.locator("main img")).toHaveAttribute("fetchpriority", "high");
  await expect(page.locator("footer.site-footer")).toHaveCount(1);
  await expect(page).toHaveTitle(/The design process \| FA Studio/);

  const layout = await page.evaluate(() => {
    const hero = document.querySelector("main [aria-labelledby='process-page-heading']");
    if (!(hero instanceof HTMLElement)) throw new Error("Process fallback hero is missing.");
    const rect = hero.getBoundingClientRect();
    return {
      xOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      top: rect.top,
      height: rect.height,
      viewportHeight: window.innerHeight,
    };
  });
  expect(layout.xOverflow).toBe(false);
  expect(Math.abs(layout.top)).toBeLessThanOrEqual(1);
  expect(layout.height).toBeGreaterThanOrEqual(layout.viewportHeight - 1);
  expect(pageErrors).toEqual([]);
  await page.screenshot({ path: "test-results/process-page-desktop.png", fullPage: true });
});

for (const [width, height] of viewports) {
  test(`keeps Process fallback usable without horizontal overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/process", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1, name: "The design process" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Discuss your project" })).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    }));
    expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
    if (width === 390) {
      await page.screenshot({ path: "test-results/process-page-mobile.png", fullPage: true });
    }
  });
}

test("reduced-motion preference keeps the Process route readable", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/process", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1, name: "The design process" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Discuss your project" })).toBeVisible();
});
