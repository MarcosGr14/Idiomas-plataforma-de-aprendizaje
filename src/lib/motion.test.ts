import { describe, expect, it } from "vitest";
import { normalizeProgress } from "./progress";
import {
  normalizeMotion,
  resolveMotion,
  downgradeMotion,
  nextFrameDeadline,
} from "./motion";
describe("motion preferences", () => {
  it("preserves legacy reduced preference and rejects invalid new modes", () => {
    expect(normalizeMotion(undefined, true)).toBe("reduced");
    expect(normalizeMotion("broken")).toBeUndefined();
    expect(
      normalizeProgress({
        reducedMotion: true,
        completed: { first: { score: 80, date: "2026-10-22" } },
      }).motion,
    ).toBe("reduced");
    expect(normalizeProgress({ motion: "off" }).motion).toBe("off");
  });
  it("keeps system reduced motion static and handles unavailable WebGL", () => {
    expect(resolveMotion("full", { reduce: true })).toBe("off");
    expect(resolveMotion("full", { webgl: false })).toBe("off");
  });
  it("uses device hints only for the initial preference", () => {
    expect(resolveMotion(undefined, { memory: 2 })).toBe("reduced");
    expect(resolveMotion(undefined, { saveData: true })).toBe("reduced");
    expect(resolveMotion("off", {})).toBe("off");
    expect(resolveMotion("full", { memory: 2 })).toBe("full");
  });
  it("waits for sustained measurements before stepping quality down", () => {
    expect(downgradeMotion("full", 20, 80)).toBe("full");
    expect(downgradeMotion("full", 20, 100)).toBe("reduced");
    expect(downgradeMotion("reduced", 20, 100)).toBe("off");
    expect(downgradeMotion("full", 60, 100)).toBe("full");
  });
});

it("maintains 30 fps with jittery 60 Hz callbacks without false downgrade", () => {
  let deadline = 0;
  const rendered: number[] = [];
  for (let i = 0; i < 1200; i++) {
    const now = 100 + i * (1000 / 60) + ((i % 3) - 1) * 0.3;
    const next = nextFrameDeadline(now, deadline);
    if (next !== null) {
      deadline = next;
      rendered.push(now);
    }
  }
  const fps = ((rendered.length - 1) * 1000) / (rendered.at(-1)! - rendered[0]);
  expect(fps).toBeGreaterThan(29.5);
  expect(fps).toBeLessThan(30.5);
  expect(downgradeMotion("reduced", fps, rendered.length)).toBe("reduced");
});
