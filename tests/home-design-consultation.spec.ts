import { expect, test } from '@playwright/test';

test('published consultation section mounts the configured Cal.com event responsively', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const section = page.locator('#book-consultation');
  await expect(section).toBeVisible();
  await expect(section.getByRole('heading', { name: 'Schedule a Design Consultation' })).toBeVisible();
  const imagePanel = section.getByTestId('consultation-image-panel');
  const consultationImage = imagePanel.locator('img');
  if (await consultationImage.count()) {
    await expect(consultationImage).toBeVisible();
    await expect(consultationImage).not.toHaveAttribute('alt', '');
  } else {
    await expect(imagePanel.getByText('Consultation image')).toBeVisible();
  }
  const iframe = section.locator('iframe').first();
  await expect(iframe).toBeVisible({ timeout: 30_000 });
  await expect.poll(() => iframe.getAttribute('src')).toMatch(/cal\.com/);
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(4000);
  const eventFrame = page.frameLocator('iframe').last();
  const calFrame = page.frames().find((frame) => frame.url().includes('app.cal.com'));
  expect(calFrame).toBeTruthy();
  await expect(eventFrame.getByText('FS Studio — Design Consultation')).toBeVisible({ timeout: 30_000 });
  await expect(eventFrame.getByText(/45m/)).toBeVisible();
  await expect(eventFrame.locator('button[aria-label*="November 30, 2026"]')).toBeVisible();
  const availableFutureDates = await eventFrame.locator('button[aria-label]').evaluateAll((buttons) => buttons.filter((button) => {
    const label = button.getAttribute('aria-label') ?? '';
    return !(button as HTMLButtonElement).disabled && /, \w+ \d{1,2}, 20\d{2}$/.test(label);
  }).length);
  expect(availableFutureDates).toBeGreaterThan(0);
  expect(await eventFrame.locator('button[aria-label*=" at "]:not([disabled])').count()).toBeGreaterThan(0);
  const firstSlot = eventFrame.locator('button[aria-label*=" at "]:not([disabled])').first();
  await firstSlot.scrollIntoViewIfNeeded();
  await expect(firstSlot).toBeVisible();
  await firstSlot.click();
  await expect.poll(() => eventFrame.locator('input').count()).toBeGreaterThanOrEqual(2);
  await eventFrame.getByRole('button', { name: /back/i }).click();
  await section.evaluate((element) => element.scrollIntoView({ block: 'start', behavior: 'instant' }));

  for (const [width, height] of [[1920, 1080], [1440, 900], [1366, 768], [1024, 768], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await expect(eventFrame.locator('button[aria-label*="November 30, 2026"]')).toBeVisible();
    await expect.poll(() => calFrame!.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight)).toBe(true);
    const sectionBox = await section.boundingBox();
    const imageBox = await imagePanel.boundingBox();
    const imageColumnBox = await section.locator('.experience-reveal').boundingBox();
    const bookingBox = await section.getByTestId('consultation-booking-panel').boundingBox();
    expect(sectionBox).not.toBeNull();
    expect(imageBox).not.toBeNull();
    expect(bookingBox).not.toBeNull();
    if (width >= 1024) {
      expect(imageBox!.x).toBeGreaterThan(sectionBox!.x + sectionBox!.width / 2);
      expect(imageColumnBox).not.toBeNull();
      await expect
        .poll(async () => {
          const [imageColumn, bookingPanel] = await Promise.all([
            section.locator('.experience-reveal').boundingBox(),
            section.getByTestId('consultation-booking-panel').boundingBox(),
          ]);
          if (!imageColumn || !bookingPanel) return Number.POSITIVE_INFINITY;
          return Math.abs(imageColumn.height - bookingPanel.height);
        })
        .toBeLessThanOrEqual(2);
    }
    if (width === 390) {
      const mobileSlot = eventFrame.locator('button[aria-label*=" at "]:not([disabled])').first();
      await mobileSlot.scrollIntoViewIfNeeded();
      await mobileSlot.click();
      await expect.poll(() => eventFrame.locator('input').count()).toBeGreaterThanOrEqual(2);
      const bookingFormIframe = await iframe.boundingBox();
      const bookingFormImage = await imagePanel.boundingBox();
      expect(bookingFormIframe).not.toBeNull();
      expect(bookingFormImage).not.toBeNull();
      expect(bookingFormImage!.y).toBeGreaterThanOrEqual(bookingFormIframe!.y + bookingFormIframe!.height - 1);
      await eventFrame.getByRole('button', { name: /back/i }).click();
      const iframeBox = await iframe.boundingBox();
      expect(iframeBox).not.toBeNull();
      expect(iframeBox!.height).toBeGreaterThan(900);
      expect(imageBox!.y).toBeGreaterThanOrEqual(iframeBox!.y + iframeBox!.height - 1);
    }
    if (width === 1920) {
      await iframe.scrollIntoViewIfNeeded();
      await page.screenshot({ path: 'test-results/design-consultation-desktop.png' });
    }
    if (width === 390) {
      await iframe.scrollIntoViewIfNeeded();
      await page.screenshot({ path: 'test-results/design-consultation-mobile.png' });
    }
    await expect.poll(() => section.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  }
  expect(consoleErrors.filter((error) => !error.includes('third-party cookie'))).toEqual([]);
});
