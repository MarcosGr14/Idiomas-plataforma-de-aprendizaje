import type { Question } from "../data/course";
export type QuizState = {
  index: number;
  choice: number | null;
  checked: boolean;
  score: number;
  done: boolean;
  attempt: number;
};
export const initialQuiz: QuizState = {
  index: 0,
  choice: null,
  checked: false,
  score: 0,
  done: false,
  attempt: 0,
};
export type QuizAction =
  | { type: "select"; choice: number; index: number }
  | { type: "check" | "next"; index: number }
  | { type: "restart" };
export function advanceQuiz(
  state: QuizState,
  action: QuizAction,
  questions: readonly Question[],
): QuizState {
  if (action.type === "restart")
    return { ...initialQuiz, attempt: state.attempt + 1 };
  const question = questions[state.index];
  if (!question || state.done || action.index !== state.index) return state;
  if (action.type === "select")
    return !state.checked &&
      Number.isInteger(action.choice) &&
      action.choice >= 0 &&
      action.choice < question.options.length
      ? { ...state, choice: action.choice }
      : state;
  if (action.type === "check")
    return state.choice === null ? state : { ...state, checked: true };
  if (!state.checked || state.choice === null) return state;
  const score = state.score + Number(state.choice === question.correct);
  return state.index + 1 === questions.length
    ? { ...state, score, done: true }
    : { ...state, index: state.index + 1, score, choice: null, checked: false };
}
