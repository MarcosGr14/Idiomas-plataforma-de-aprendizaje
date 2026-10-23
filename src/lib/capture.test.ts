import { expect, it } from "vitest";
import { captureEnabled, CAPTURE_DATE, normalizeCaptureFrame } from "./capture";
import { createDemoProgress } from "./demo";
import { streak, xp } from "./progress";
it("does not enable capture without an explicit browser parameter", () => {
  expect(captureEnabled).toBe(false);
});
it("normalizes frame inputs without wall-clock dependence", () => {
  expect(
    normalizeCaptureFrame({ time: 8, pointerX: 9, pointerY: -9, scroll: 4 }),
  ).toEqual({ time: 8, pointerX: 1, pointerY: -1, scroll: 1 });
  expect(normalizeCaptureFrame({ time: NaN })).toEqual({
    time: 0,
    pointerX: 0,
    pointerY: 0,
    scroll: 0,
  });
});
it("seeds reproducible valid progress with no shared mutable state", () => {
  const a = createDemoProgress(),
    b = createDemoProgress();
  expect(a).toEqual(b);
  expect(streak(a, new Date(CAPTURE_DATE))).toBe(7);
  expect(xp(a)).toBe(200);
  expect(Object.keys(a.completed)).toHaveLength(3);
  expect(Object.keys(a.reviews)).toHaveLength(15);
  a.activity.extra = 999;
  expect(b.activity.extra).toBeUndefined();
});
