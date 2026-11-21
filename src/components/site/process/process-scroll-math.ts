export type ProcessTimeline = {
  readonly segmentIndex: number;
  readonly segmentProgress: number;
  readonly activeIndex: number;
  readonly totalProgress: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Maps native scroll distance to a reversible, count-independent process timeline. */
export function deriveProcessTimeline(
  scrollOffset: number,
  viewportHeight: number,
  stepCount: number,
): ProcessTimeline {
  if (stepCount <= 1) {
    return { segmentIndex: 0, segmentProgress: 0, activeIndex: 0, totalProgress: 0 };
  }

  const stepDistance = Math.max(1, viewportHeight) * 0.82;
  const timeline = clamp(Math.max(0, scrollOffset) / stepDistance, 0, stepCount - 1);
  const segmentIndex = Math.min(Math.floor(timeline), stepCount - 2);
  const segmentProgress = timeline >= stepCount - 1 ? 1 : clamp(timeline - segmentIndex, 0, 1);

  return {
    segmentIndex,
    segmentProgress,
    activeIndex: segmentProgress < 0.5 ? segmentIndex : segmentIndex + 1,
    totalProgress: timeline / (stepCount - 1),
  };
}
