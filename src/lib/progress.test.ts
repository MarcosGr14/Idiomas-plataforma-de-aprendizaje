import { describe, it, expect } from "vitest";
import {
  freshProgress,
  completeLesson,
  reviewWord,
  streak,
  xp,
  normalizeProgress,
} from "./progress";
describe("learning progress", () => {
  it("does not award lesson XP twice and preserves the best score", () => {
    const a = completeLesson(
      freshProgress(),
      "a",
      100,
      ["a"],
      new Date(2026, 9, 22),
    );
    const b = completeLesson(a, "a", 60, ["a"], new Date(2026, 9, 23));
    expect(xp(b)).toBe(30);
    expect(b.completed.a.score).toBe(100);
    expect(b.reviews.a.due).toBe("2026-10-22");
  });
  it("schedules reviews using calendar days and prevents repeated XP", () => {
    const a = completeLesson(
      freshProgress(),
      "a",
      100,
      ["a"],
      new Date(2026, 9, 22),
    );
    const b = reviewWord(a, "a", true, new Date(2026, 9, 22));
    expect(b.reviews.a.due).toBe("2026-10-23");
    expect(xp(reviewWord(b, "a", true, new Date(2026, 9, 22)))).toBe(35);
  });
  it("keeps yesterday streak until today expires", () => {
    const p = freshProgress();
    p.activity = { "2026-10-21": 30, "2026-10-20": 30 };
    expect(streak(p, new Date(2026, 9, 22))).toBe(2);
    expect(streak(p, new Date(2026, 9, 23))).toBe(0);
  });
  it("resets a forgotten review and caps intervals", () => {
    const p = freshProgress();
    p.reviews.a = { due: "2026-10-22", interval: 30, correct: 5 };
    expect(
      reviewWord(p, "a", true, new Date(2026, 9, 22)).reviews.a.interval,
    ).toBe(30);
    expect(
      reviewWord(p, "a", false, new Date(2026, 9, 22)).reviews.a.correct,
    ).toBe(0);
  });
  it("handles absent and malformed local records", () => {
    expect(normalizeProgress(null)).toEqual(freshProgress());
    expect(normalizeProgress({ goal: 99 })).toMatchObject({ goal: 10 });
  });
});

it("counts revisiting a lesson for the streak without farming XP", () => {
  const a = completeLesson(
    freshProgress(),
    "a",
    100,
    [],
    new Date(2026, 9, 21),
  );
  const b = completeLesson(a, "a", 100, [], new Date(2026, 9, 22));
  expect(streak(b, new Date(2026, 9, 22))).toBe(2);
  expect(xp(b)).toBe(30);
});
