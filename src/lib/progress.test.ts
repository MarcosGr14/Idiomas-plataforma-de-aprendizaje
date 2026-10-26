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

it("rejects malformed nested progress without losing valid records", () => {
  const p = normalizeProgress({
    goal: "20",
    placement: Infinity,
    romanization: "false",
    reducedMotion: "false",
    completed: {
      good: { score: 80, date: "2026-10-26" },
      broken: null,
      bad: { score: "100", date: "2026-10-26" },
    },
    reviews: {
      bad: { due: "2026-02-30", interval: 1, correct: 0 },
      good: { due: "2026-10-27", interval: 2, correct: 1 },
    },
    activity: {
      "2026-10-26": 30,
      "2026-10-25": "50",
      "2026-10-24": -20,
      garbage: 500,
    },
    studied: [null, "2026-10-26", "2026-10-26", "2026-02-30"],
    exams: { bad: { score: 101, total: 0, date: "2026-10-26" } },
    extra: "ignored",
  });
  expect(p.completed).toEqual({ good: { score: 80, date: "2026-10-26" } });
  expect(Object.keys(p.reviews)).toEqual(["good"]);
  expect(xp(p)).toBe(30);
  expect(p.studied).toEqual(["2026-10-26"]);
  expect(p).toMatchObject({
    goal: 10,
    placement: null,
    romanization: true,
    reducedMotion: false,
    exams: {},
  });
  expect(p).not.toHaveProperty("extra");
});
it("filters prototype keys and array-shaped records", () => {
  const p = normalizeProgress(
    JSON.parse(
      '{"completed":{"__proto__":{"score":100,"date":"2026-10-26"},"constructor":{"score":100,"date":"2026-10-26"}},"reviews":[null],"activity":[900]}',
    ),
  );
  expect(p.completed).toEqual({});
  expect(p.reviews).toEqual({});
  expect(xp(p)).toBe(0);
  expect(Object.getPrototypeOf(p.completed)).toBe(Object.prototype);
});
it("retains valid legacy progress and normalizes idempotently", () => {
  const original = completeLesson(
    freshProgress(),
    "vocales",
    100,
    ["a"],
    new Date(2026, 9, 26),
  );
  const clean = normalizeProgress(original);
  expect(clean.completed).toEqual(original.completed);
  expect(clean.reviews).toEqual(original.reviews);
  expect(normalizeProgress(clean)).toEqual(clean);
});
it("handles arbitrary JSON shapes without producing nonnumeric XP", () => {
  for (const raw of [
    null,
    [],
    true,
    42,
    "oops",
    { activity: null },
    { activity: { "2026-10-26": 1e100 } },
    { completed: [true], reviews: { a: false } },
  ]) {
    const p = normalizeProgress(raw);
    expect(Number.isFinite(xp(p))).toBe(true);
    expect(() => streak(p)).not.toThrow();
  }
});
