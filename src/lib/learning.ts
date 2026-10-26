import { words, lessons } from "../data/course";
import type { Progress } from "./progress";
/** A placement recommendation opens previews, never claims mastery or schedules reviews. */
export function recommendedLesson(placement: number | null) {
  return placement !== null && placement >= 80
    ? 3
    : placement !== null && placement >= 50
      ? 1
      : 0;
}
export function availableVocabulary(progress: Progress) {
  const entry = recommendedLesson(progress.placement);
  return words.filter(
    (word) =>
      word.lesson <= entry ||
      progress.reviews[word.id] ||
      progress.completed[lessons[word.lesson].id],
  );
}
