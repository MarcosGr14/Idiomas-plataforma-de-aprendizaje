import { expect, it } from "vitest";
import { availableVocabulary, recommendedLesson } from "./learning";
import { completeLesson, freshProgress, xp } from "./progress";
import { lessons, words } from "../data/course";
it("offers only the first preview to a new learner", () => {
  expect(availableVocabulary(freshProgress())).toEqual(
    words.filter((w) => w.lesson === 0),
  );
  expect([
    recommendedLesson(null),
    recommendedLesson(49),
    recommendedLesson(50),
    recommendedLesson(79),
    recommendedLesson(80),
  ]).toEqual([0, 0, 1, 1, 3]);
});
it("opens placement previews without scheduling reviews or awarding XP", () => {
  const progress = { ...freshProgress(), placement: 80 };
  expect(availableVocabulary(progress)).toEqual(
    words.filter((w) => w.lesson <= 3),
  );
  expect(progress.reviews).toEqual({});
  expect(xp(progress)).toBe(0);
});
it("unlocks a new lesson library and preserves its SRS after reload", () => {
  const lessonWords = words.filter((w) => w.lesson === 5);
  const progress = completeLesson(
    freshProgress(),
    lessons[5].id,
    80,
    lessonWords.map((w) => w.id),
  );
  expect(availableVocabulary(progress)).toEqual([
    ...words.filter((w) => w.lesson === 0),
    ...lessonWords,
  ]);
  expect(lessonWords.every((w) => progress.reviews[w.id])).toBe(true);
  expect(
    xp(
      completeLesson(
        progress,
        lessons[5].id,
        100,
        lessonWords.map((w) => w.id),
      ),
    ),
  ).toBe(30);
});
