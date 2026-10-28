import { expect, it } from "vitest";
import { addDays } from "./calendar";
import {
  completeLesson,
  freshProgress,
  levelInfo,
  longestStreak,
  normalizeProgress,
  recordAssessment,
  reviewWord,
  streak,
  xp,
} from "./progress";
const date = (day: string) => new Date(`${day}T12:00:00`);
const exam = (
  mode: "semanal" | "mensual" = "semanal",
  score = 100,
  attemptId = "one",
) => ({
  mode,
  score,
  attemptId,
  period: mode === "semanal" ? "semanal:2026-W44" : "mensual:2026-10",
  total: 5,
  mistakes: [],
});
it("requires a passing score, preserves the best result and pays once per period", () => {
  let p = recordAssessment(
    freshProgress(),
    exam("mensual", 0),
    date("2026-10-27"),
  );
  expect(xp(p)).toBe(0);
  expect(p.exams["mensual:2026-10"].rewarded).toBe(false);
  p = recordAssessment(p, exam("mensual", 80, "two"), date("2026-10-27"));
  expect(xp(p)).toBe(100);
  p = recordAssessment(p, exam("mensual", 20, "three"), date("2026-10-28"));
  expect(xp(p)).toBe(100);
  expect(p.exams["mensual:2026-10"]).toMatchObject({
    score: 80,
    lastScore: 20,
    attempts: 3,
  });
  expect(
    recordAssessment(p, exam("mensual", 20, "three"), date("2026-10-28")),
  ).toBe(p);
});
it("distinguishes weekly and monthly rewards and rejects bad records", () => {
  let p = recordAssessment(freshProgress(), exam(), date("2026-10-27"));
  p = recordAssessment(p, exam("mensual"), date("2026-10-27"));
  expect(xp(p)).toBe(150);
  expect(
    recordAssessment(p, { ...exam(), score: Infinity }, date("2026-10-27")),
  ).toBe(p);
  expect(
    recordAssessment(
      p,
      { ...exam(), period: "mensual:2026-10" },
      date("2026-10-27"),
    ),
  ).toBe(p);
});
it("awards streak bonuses on seven active days, surviving reloads and repeats", () => {
  let p = freshProgress();
  for (let i = 0; i < 14; i++)
    p = completeLesson(p, "vocales", 100, [], date(addDays("2026-10-14", i)));
  expect(streak(p, date("2026-10-27"))).toBe(14);
  expect(Object.keys(p.rewards)).toHaveLength(2);
  expect(xp(p)).toBe(130);
  p = normalizeProgress(JSON.parse(JSON.stringify(p)));
  expect(xp(completeLesson(p, "vocales", 100, [], date("2026-10-27")))).toBe(
    130,
  );
  expect(streak(p, date("2026-10-28"))).toBe(14);
  expect(streak(p, date("2026-10-29"))).toBe(0);
});
it("starts a new streak after a gap and preserves the previous bonus", () => {
  let p = freshProgress();
  for (const start of ["2026-10-01", "2026-10-15"])
    for (let i = 0; i < 7; i++)
      p = completeLesson(p, "vocales", 100, [], date(addDays(start, i)));
  expect(longestStreak(p, date("2026-10-21"))).toBe(7);
  expect(streak(p, date("2026-10-21"))).toBe(7);
  expect(Object.keys(p.rewards)).toHaveLength(2);
  expect(xp(p)).toBe(130);
});
it("migrates legacy weekly periods without duplicating previously paid XP", () => {
  const p = normalizeProgress({
    ...freshProgress(),
    activity: { "2026-10-26": 50 },
    exams: { "semanal:2026-w42": { score: 20, total: 5, date: "2026-10-26" } },
  });
  expect(p.exams["semanal:2026-W44"]).toMatchObject({
    score: 20,
    rewarded: true,
  });
  expect(p.exams["semanal:2026-w42"]).toBeUndefined();
  expect(xp(recordAssessment(p, exam(), date("2026-10-27")))).toBe(50);
  expect(normalizeProgress(p)).toEqual(p);
});
it("merges legacy periods landing in one ISO week conservatively", () => {
  const p = normalizeProgress({
    ...freshProgress(),
    exams: {
      "semanal:2026-w42": { score: 100, total: 5, date: "2026-10-26" },
      "semanal:2026-w43": { score: 40, total: 10, date: "2026-10-30" },
    },
  });
  expect(Object.keys(p.exams)).toEqual(["semanal:2026-W44"]);
  expect(p.exams["semanal:2026-W44"]).toMatchObject({
    score: 100,
    total: 5,
    lastScore: 40,
    date: "2026-10-30",
    rewarded: true,
  });
});
it("filters malformed reward data and keeps old progress intact", () => {
  const p = normalizeProgress({
    activity: { "2026-10-27": 30 },
    rewards: {
      bad: { date: "2026-10-27", xp: 50 },
      "racha:2026-10-21:1": { date: "2026-10-27", xp: "50" },
    },
  });
  expect(p.rewards).toEqual({});
  expect(xp(p)).toBe(30);
  expect(completeLesson(p, "vocales", 0, [], date("2026-10-27"))).toBe(p);
  expect(reviewWord(p, "never-learned", true, date("2026-10-27"))).toBe(p);
});
it("keeps level boundaries separate from language proficiency", () => {
  expect(levelInfo(freshProgress())).toMatchObject({
    level: 1,
    current: 0,
    remaining: 100,
  });
  expect(
    levelInfo({ ...freshProgress(), activity: { "2026-10-27": 150 } }),
  ).toEqual({ total: 150, level: 2, current: 50, remaining: 50 });
});
