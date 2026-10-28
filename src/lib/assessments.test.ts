import { expect, it } from "vitest";
import { lessons } from "../data/course";
import { freshProgress } from "./progress";
import { assessmentPlan } from "./assessments";
const learned = (count: number) => ({
  ...freshProgress(),
  completed: Object.fromEntries(
    lessons
      .slice(0, count)
      .map((lesson) => [lesson.id, { score: 100, date: "2026-10-27" }]),
  ),
});
it("uses only completed lessons and has a safe empty plan", () => {
  expect(
    assessmentPlan(freshProgress(), "semanal", "2026-10-27").questions,
  ).toEqual([]);
  const plan = assessmentPlan(learned(1), "mensual", "2026-10-27");
  expect(plan.questions).toHaveLength(5);
  expect(plan.questions.every((q) => q.lessonId === lessons[0].id)).toBe(true);
});
it("caps each plan, balances lessons and never repeats a question", () => {
  const plan = assessmentPlan(learned(4), "semanal", "2026-10-27");
  expect(plan.questions).toHaveLength(10);
  expect(new Set(plan.questions.map((q) => q.id)).size).toBe(10);
  const counts = lessons
    .slice(0, 4)
    .map(
      (lesson) => plan.questions.filter((q) => q.lessonId === lesson.id).length,
    );
  expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
  expect(
    assessmentPlan(learned(16), "mensual", "2026-10-27").questions,
  ).toHaveLength(20);
});
it("is reproducible within the period and never mutates the course", () => {
  const before = JSON.stringify(lessons),
    p = learned(10);
  expect(assessmentPlan(p, "semanal", "2026-10-26").questions).toEqual(
    assessmentPlan(p, "semanal", "2026-11-01").questions,
  );
  expect(
    assessmentPlan(p, "semanal", "2026-10-27").questions.map((q) => q.id),
  ).not.toEqual(
    assessmentPlan(p, "semanal", "2026-11-03").questions.map((q) => q.id),
  );
  expect(JSON.stringify(lessons)).toBe(before);
});
