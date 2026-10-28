import type { Question } from "../data/course";
export type QuizState = {
  index: number;
  choice: number | null;
  checked: boolean;
  score: number;
  done: boolean;
  attempt: number;
  responses: number[];
};
export const initialQuiz: QuizState = {
  index: 0,
  choice: null,
  checked: false,
  score: 0,
  done: false,
  attempt: 0,
  responses: [],
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
  const responses = [...state.responses, state.choice];
  return state.index + 1 === questions.length
    ? { ...state, score, responses, done: true }
    : {
        ...state,
        index: state.index + 1,
        score,
        responses,
        choice: null,
        checked: false,
      };
}

export type QuizReport = {
  score: number;
  correct: number;
  total: number;
  attempt: number;
  answers: { index: number; choice: number; correct: boolean }[];
};
export function quizReport(
  state: QuizState,
  questions: readonly Question[],
): QuizReport | null {
  if (
    !state.done ||
    !questions.length ||
    state.responses.length !== questions.length
  )
    return null;
  return {
    score: Math.round((state.score / questions.length) * 100),
    correct: state.score,
    total: questions.length,
    attempt: state.attempt,
    answers: state.responses.map((choice, index) => ({
      index,
      choice,
      correct: questions[index].correct === choice,
    })),
  };
}
