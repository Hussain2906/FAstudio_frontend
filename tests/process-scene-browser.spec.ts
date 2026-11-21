import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

function progressbar(page: Page) {
  return page.locator('[role="progressbar"]');
}

function progressScale(style: string | null | undefined) {
  const value = style?.match(/scaleX\(([\d.]+)\)/)?.[1];
  return value ? Number(value) : Number.NaN;
}

test("native scroll scrubs three fixture steps in both directions and reaches the footer", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/process-test", { waitUntil: "domcontentloaded" });
  const track = page.locator('section[aria-label="Scroll-driven process story"]');
  const progress = progressbar(page);

  await expect(track).toBeVisible();
  await expect(progress).toHaveAttribute("aria-valuetext", "Step 1 of 3: Fixture stage one");
  await expect(page.locator("#process-reading-list img")).toHaveCount(0);
  await expect(
    page.locator(
      '#process-reading-list [role="img"][aria-label="Interior photograph used only for local browser testing."]',
    ),
  ).toHaveCount(3);
  expect(await track.locator("img").count()).toBeLessThanOrEqual(2);
  await expect(track.locator('[data-process-image="outgoing"] img')).toHaveAttribute(
    "loading",
    "eager",
  );
  await expect(track.locator('[data-process-image="outgoing"] img')).toHaveAttribute(
    "fetchpriority",
    "high",
  );
  await page.screenshot({ path: "test-results/process-story-start.png" });

  await page.evaluate(() =>
    window.scrollTo({ top: window.innerHeight * 0.82 * 0.5, behavior: "instant" }),
  );
  await expect.poll(() => progress.getAttribute("aria-valuetext")).toBe("Step 2 of 3: Plan");
  await page.screenshot({ path: "test-results/process-story-midpoint.png" });
  const midpoint = await page.evaluate(() => ({
    incomingImage: Number(
      getComputedStyle(document.querySelector('[data-process-image="incoming"]')!).opacity,
    ),
    incomingCopy: Number(
      getComputedStyle(document.querySelector('[data-step-copy="incoming"]')!).opacity,
    ),
    outgoingImage: Number(
      getComputedStyle(document.querySelector('[data-process-image="outgoing"]')!).opacity,
    ),
    outgoingCopy: Number(
      getComputedStyle(document.querySelector('[data-step-copy="outgoing"]')!).opacity,
    ),
    progress: document.querySelector('[role="progressbar"] > span')?.getAttribute("style"),
    hasDoubleExposure: [...document.querySelectorAll<HTMLElement>("[data-flap-cell]")].some(
      (cell) => {
        const oldOpacity = Number(
          getComputedStyle(cell.querySelector<HTMLElement>('[data-flap-face="old"]')!).opacity,
        );
        const newOpacity = Number(
          getComputedStyle(cell.querySelector<HTMLElement>('[data-flap-face="new"]')!).opacity,
        );
        return oldOpacity > 0 && newOpacity > 0;
      },
    ),
  }));
  expect(midpoint.hasDoubleExposure).toBe(false);
  expect(midpoint.incomingImage).toBeCloseTo(0.5, 2);
  expect(midpoint.incomingCopy).toBeCloseTo(0, 2);
  expect(midpoint.outgoingImage).toBeCloseTo(0.5, 2);
  expect(midpoint.outgoingCopy).toBeCloseTo(0, 2);
  expect(progressScale(midpoint.progress)).toBeCloseTo(0.25, 2);

  await page.evaluate(() =>
    window.scrollTo({ top: window.innerHeight * 0.82 * 0.75, behavior: "instant" }),
  );
  await expect
    .poll(() =>
      track
        .locator('[data-process-image="incoming"]')
        .evaluate((element) => Number(getComputedStyle(element).opacity)),
    )
    .toBeGreaterThan(0.74);
  const crossfade = await page.evaluate(() => ({
    incomingImage: Number(
      getComputedStyle(document.querySelector('[data-process-image="incoming"]')!).opacity,
    ),
    incomingCopy: Number(
      getComputedStyle(document.querySelector('[data-step-copy="incoming"]')!).opacity,
    ),
    outgoingImage: Number(
      getComputedStyle(document.querySelector('[data-process-image="outgoing"]')!).opacity,
    ),
    outgoingCopy: Number(
      getComputedStyle(document.querySelector('[data-step-copy="outgoing"]')!).opacity,
    ),
    progress: document.querySelector('[role="progressbar"] > span')?.getAttribute("style"),
  }));
  expect(crossfade.incomingImage).toBeCloseTo(0.75, 2);
  expect(crossfade.incomingCopy).toBeCloseTo(1, 2);
  expect(crossfade.outgoingImage).toBeCloseTo(0.25, 2);
  expect(crossfade.outgoingCopy).toBeCloseTo(0, 2);
  expect(progressScale(crossfade.progress)).toBeCloseTo(0.375, 2);

  await page.evaluate(() =>
    window.scrollTo({ top: window.innerHeight * 0.82, behavior: "instant" }),
  );
  await expect.poll(() => progress.getAttribute("aria-valuetext")).toBe("Step 2 of 3: Plan");
  const [oldTitle, newTitle] = await Promise.all([
    track.locator('[data-flap-face="old"]').allTextContents(),
    track.locator('[data-flap-face="new"]').allTextContents(),
  ]);
  expect([oldTitle.join("").trim(), newTitle.join("").trim()]).toContain("Plan");

  const restoreScroll = await page.evaluate(() => window.scrollY);
  await page.reload();
  const reloadedTrack = page.locator('section[aria-label="Scroll-driven process story"]');
  await expect(reloadedTrack).toBeVisible();
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), restoreScroll);
  await expect.poll(() => progress.getAttribute("aria-valuetext")).toBe("Step 2 of 3: Plan");

  await page.setViewportSize({ width: 1280, height: 800 });
  await expect.poll(() => progress.getAttribute("aria-valuetext")).toBe("Step 2 of 3: Plan");
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect.poll(() => progress.getAttribute("aria-valuetext")).toBe("Step 2 of 3: Plan");

  await page.evaluate(() =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
  );
  await expect
    .poll(() => progress.getAttribute("aria-valuetext"))
    .toBe("Step 3 of 3: Fixture stage three");
  await expect(page.locator("footer.site-footer")).toBeVisible();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect
    .poll(() => progress.getAttribute("aria-valuetext"))
    .toBe("Step 1 of 3: Fixture stage one");

  await page.getByRole("button", { name: "Read fixture steps as text" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Process story browser fixture" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Fixture stage three" })).toBeVisible();
  await expect(page.locator("#process-reading-list img")).toHaveCount(3);
  const widths = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(widths.documentWidth).toBeLessThanOrEqual(widths.viewportWidth);
});

test("serves the full readable process when JavaScript is unavailable", async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: "http://localhost:3000",
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 900 },
  });
  try {
    const page = await context.newPage();
    await page.goto("/process-test", { waitUntil: "domcontentloaded" });
    await expect(page.locator('section[aria-label="Scroll-driven process story"]')).toHaveCount(0);
    await expect(
      page.getByRole("heading", { level: 1, name: "Process story browser fixture" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Fixture stage one" })).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "Fixture stage three" }),
    ).toBeVisible();
    await expect(page.locator('#process-reading-list [role="img"]')).toHaveCount(3);
  } finally {
    await context.close();
  }
});

test("mobile and reduced-motion users get the complete readable step list", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/process-test", { waitUntil: "domcontentloaded" });
  await expect(page.locator('section[aria-label="Scroll-driven process story"]')).toBeHidden();
  await expect(
    page.getByRole("heading", { level: 1, name: "Process story browser fixture" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Fixture stage one" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Fixture stage three" })).toBeVisible();
  await expect(page.locator("#process-reading-list img")).toHaveCount(3);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/process-test", { waitUntil: "domcontentloaded" });
  await expect(page.locator('section[aria-label="Scroll-driven process story"]')).toBeHidden();
  await expect(page.getByRole("heading", { level: 2, name: "Plan" })).toBeVisible();
  await expect(page.locator("#process-reading-list img")).toHaveCount(3);

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/process-test", { waitUntil: "domcontentloaded" });
  const tabletTrack = page.locator('section[aria-label="Scroll-driven process story"]');
  await expect(tabletTrack).toBeVisible();
  await page.evaluate(() =>
    window.scrollTo({ top: window.innerHeight * 0.41, behavior: "instant" }),
  );
  await expect
    .poll(() => progressbar(page).getAttribute("aria-valuetext"))
    .toBe("Step 2 of 3: Plan");
  const widths = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));
  expect(widths.documentWidth).toBeLessThanOrEqual(widths.viewportWidth);
});
