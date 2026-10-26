import { describe, expect, it } from "vitest";
import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { lessons, words, placement, type Question } from "./course";
import course from "../../content/japanese-pilot.json";
function checkQuestion(question: Question) {
  expect(question.prompt.trim().length).toBeGreaterThan(0);
  expect(question.explanation.trim().length).toBeGreaterThan(0);
  expect(question.options.length).toBeGreaterThanOrEqual(2);
  expect(new Set(question.options).size).toBe(question.options.length);
  expect(question.options.every((option) => option.trim().length > 0)).toBe(
    true,
  );
  expect(Number.isInteger(question.correct)).toBe(true);
  expect(question.correct).toBeGreaterThanOrEqual(0);
  expect(question.correct).toBeLessThan(question.options.length);
}
describe("course publishing integrity", () => {
  it("has unique safe identifiers and usable exercises", () => {
    expect(new Set(lessons.map((l) => l.id)).size).toBe(lessons.length);
    expect(new Set(words.map((w) => w.id)).size).toBe(words.length);
    for (const lesson of lessons) {
      expect(lesson.id).toMatch(/^[a-z0-9-]+$/);
      expect(lesson.questions.length).toBeGreaterThan(0);
      expect(lesson.paragraphs.length).toBeGreaterThan(0);
      expect(lesson.objective.trim().length).toBeGreaterThan(0);
      lesson.questions.forEach(checkQuestion);
    }
    expect(placement.length).toBeGreaterThan(0);
    placement.forEach(checkQuestion);
  });
  it("links vocabulary to existing lessons and nonempty static audio", () => {
    for (const word of words) {
      expect(word.id).toMatch(/^[a-z0-9-]+$/);
      expect(Number.isInteger(word.lesson)).toBe(true);
      expect(word.lesson).toBeGreaterThanOrEqual(0);
      expect(word.lesson).toBeLessThan(lessons.length);
      expect(word.jp.trim()).not.toBe("");
      expect(word.reading.trim()).not.toBe("");
      const path = fileURLToPath(
        new URL(`../../public/audio/${word.id}.mp3`, import.meta.url),
      );
      expect(existsSync(path), word.id).toBe(true);
      expect(statSync(path).size).toBeGreaterThan(100);
    }
  });
  it("retains explicit editorial review metadata", () => {
    expect(typeof course.reviewed).toBe("boolean");
    for (const item of [...course.words, ...course.lessons])
      expect(typeof item.reviewed).toBe("boolean");
  });
});
