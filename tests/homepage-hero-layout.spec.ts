import { expect, test } from '@playwright/test';

const viewports = [375, 768, 1024, 1440, 1920];

for (const width of viewports) {
  test(`keeps Hero heading and description separated at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    const heading = page.locator('#hero-heading');
    const description = heading.locator('xpath=following-sibling::p');
    await expect(heading).toBeVisible();
    await expect(description).toBeVisible();

    const boxes = await heading.evaluate((element) => {
      const descriptionElement = element.nextElementSibling;
      if (!(descriptionElement instanceof HTMLElement)) throw new Error('Hero description is missing.');
      const headingBox = element.getBoundingClientRect();
      const descriptionBox = descriptionElement.getBoundingClientRect();
      return {
        headingBottom: headingBox.bottom,
        descriptionTop: descriptionBox.top,
        gap: descriptionBox.top - headingBox.bottom,
        headingHeight: headingBox.height,
        descriptionHeight: descriptionBox.height,
        computed: {
          fontSize: getComputedStyle(element).fontSize,
          lineHeight: getComputedStyle(element).lineHeight,
          letterSpacing: getComputedStyle(element).letterSpacing,
        },
      };
    });

    expect(boxes.headingHeight).toBeGreaterThan(0);
    expect(boxes.descriptionHeight).toBeGreaterThan(0);
    expect(boxes.gap, JSON.stringify(boxes.computed)).toBeGreaterThanOrEqual(16);
  });
}

test('keeps a longer CMS heading in flow without horizontal overflow', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const heading = page.locator('#hero-heading');
  await expect(heading).toBeVisible();
  await heading.evaluate((element) => {
    element.textContent = 'A home that feels entirely yours, considered for every season and every way of living.';
  });
  const result = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    headingBottom: document.querySelector('#hero-heading')!.getBoundingClientRect().bottom,
    descriptionTop: document.querySelector('#hero-heading + p')!.getBoundingClientRect().top,
  }));
  expect(result.overflow).toBe(false);
  expect(result.descriptionTop - result.headingBottom).toBeGreaterThanOrEqual(16);
});

test('preserves heading separation at 200% zoom', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.locator('body').evaluate((element) => { element.style.zoom = '2'; });
  const gap = await page.locator('#hero-heading').evaluate((element) => {
    const description = element.nextElementSibling;
    if (!(description instanceof HTMLElement)) throw new Error('Hero description is missing.');
    return description.getBoundingClientRect().top - element.getBoundingClientRect().bottom;
  });
  expect(gap).toBeGreaterThanOrEqual(16);
});
