import { lessons, type Question } from "../data/course";
import type { Progress } from "./progress";
import { assessmentKey, dayKey, type AssessmentMode } from "./calendar";
export type AssessmentQuestion = Question & {
  id: string;
  lessonId: string;
  lessonTitle: string;
};
export function questionPool(progress: Progress): AssessmentQuestion[] {
  return lessons
    .filter((lesson) => progress.completed[lesson.id])
    .flatMap((lesson) =>
      lesson.questions.map((question, index) => ({
        ...question,
        id: `${lesson.id}:${index}`,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
      })),
    );
}
function seed(text: string) {
  let value = 2166136261;
  for (const char of text)
    value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return value >>> 0;
}
function shuffle<T>(items: readonly T[], text: string) {
  const result = [...items];
  let state = seed(text) || 1;
  for (let i = result.length - 1; i > 0; i--) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    const j = (state >>> 0) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
/** Snapshot at start: balanced round-robin, bounded length, stable for a period. */
export function assessmentPlan(
  progress: Progress,
  mode: AssessmentMode,
  day = dayKey(),
) {
  const period = assessmentKey(mode, day),
    limit = mode === "semanal" ? 10 : 20,
    pool = questionPool(progress);
  const groups = shuffle(
    lessons.filter((lesson) => progress.completed[lesson.id]),
    period,
  ).map((lesson) =>
    shuffle(
      pool.filter((question) => question.lessonId === lesson.id),
      `${period}:${lesson.id}`,
    ),
  );
  const questions: AssessmentQuestion[] = [];
  for (
    let row = 0;
    questions.length < limit && groups.some((group) => group[row]);
    row++
  ) {
    for (const group of groups) {
      if (group[row]) questions.push(group[row]);
      if (questions.length === limit) break;
    }
  }
  return { period, mode, day, questions };
}
