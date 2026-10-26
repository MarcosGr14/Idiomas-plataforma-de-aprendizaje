import { describe, expect, it } from "vitest";
import { hiraganaGlyphs } from "../data/writing";
import { checkStroke, resample, type Point } from "./writing";
describe("guided stroke assistance", () => {
  it("covers all 46 basic hiragana with finite ordered geometry", () => {
    expect(Object.keys(hiraganaGlyphs)).toHaveLength(46);
    for (const strokes of Object.values(hiraganaGlyphs)) {
      expect(strokes.length).toBeGreaterThan(0);
      for (const stroke of strokes) {
        expect(stroke.d.startsWith("M")).toBe(true);
        expect(checkStroke(stroke.points, stroke.points)).toBe("accepted");
      }
    }
  });
  it("accepts sparse events and a small human offset", () => {
    const expected = hiraganaGlyphs["い"][0].points;
    const sparse = resample(expected, 12).map(
      (p) => [p[0] + 2, p[1] - 2] as Point,
    );
    expect(checkStroke(sparse, expected)).toBe("accepted");
  });
  it("rejects reverse direction, a different stroke and a scribble", () => {
    const expected = hiraganaGlyphs["い"][0].points;
    expect(checkStroke([...expected].reverse(), expected)).not.toBe("accepted");
    expect(checkStroke(hiraganaGlyphs["い"][1].points, expected)).not.toBe(
      "accepted",
    );
    const scribble: Point[] = [
      expected[0],
      [100, 0],
      [0, 100],
      [100, 100],
      expected.at(-1)!,
    ];
    expect(checkStroke(scribble, expected)).toBe("shape");
  });
  it("rejects taps, unfinished strokes, nonfinite and oversized input", () => {
    const expected = hiraganaGlyphs["あ"][0].points;
    expect(checkStroke([expected[0]], expected)).toBe("invalid");
    expect(checkStroke([expected[0], [NaN, 0]], expected)).toBe("invalid");
    expect(checkStroke(Array(2049).fill(expected[0]), expected)).toBe(
      "invalid",
    );
    expect(checkStroke(expected.slice(0, 3), expected)).not.toBe("accepted");
  });
});
