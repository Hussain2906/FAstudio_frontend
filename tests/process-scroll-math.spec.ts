import { expect, test } from "@playwright/test";
import { deriveProcessTimeline } from "../src/components/site/process/process-scroll-math";

test("process timeline handles empty, single-step, and uncapped dynamic sequences", () => {
  expect(deriveProcessTimeline(0, 900, 0)).toEqual({
    segmentIndex: 0,
    segmentProgress: 0,
    activeIndex: 0,
    totalProgress: 0,
  });
  expect(deriveProcessTimeline(900, 900, 1).activeIndex).toBe(0);

  const viewportHeight = 1000;
  const steps = 14;
  const stepDistance = viewportHeight * 0.82;
  expect(deriveProcessTimeline(0, viewportHeight, steps)).toMatchObject({
    segmentIndex: 0,
    segmentProgress: 0,
    activeIndex: 0,
    totalProgress: 0,
  });
  expect(deriveProcessTimeline(stepDistance * 0.5, viewportHeight, steps)).toMatchObject({
    segmentIndex: 0,
    segmentProgress: 0.5,
    activeIndex: 1,
  });
  expect(deriveProcessTimeline(stepDistance * (steps - 1), viewportHeight, steps)).toMatchObject({
    segmentIndex: steps - 2,
    segmentProgress: 1,
    activeIndex: steps - 1,
    totalProgress: 1,
  });
  expect(deriveProcessTimeline(stepDistance * 40, viewportHeight, steps).totalProgress).toBe(1);
  expect(deriveProcessTimeline(0, viewportHeight, steps).activeIndex).toBe(0);
});
