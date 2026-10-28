import { expect, it } from "vitest";
import { advanceQuiz, initialQuiz } from "./quiz";
const questions = [
  { prompt: "Test", options: ["a", "b"], correct: 1, explanation: "Test" },
  { prompt: "Next", options: ["a", "b"], correct: 0, explanation: "Test" },
];
it("requires a valid choice and a check before advancing", () => {
  expect(advanceQuiz(initialQuiz, { type: "next", index: 0 }, questions)).toBe(
    initialQuiz,
  );
  expect(advanceQuiz(initialQuiz, { type: "check", index: 0 }, questions)).toBe(
    initialQuiz,
  );
  expect(
    advanceQuiz(
      initialQuiz,
      { type: "select", choice: 99, index: 0 },
      questions,
    ),
  ).toBe(initialQuiz);
});
it("ignores repeated and stale next actions without inflating score", () => {
  let state = advanceQuiz(
    initialQuiz,
    { type: "select", choice: 1, index: 0 },
    questions,
  );
  state = advanceQuiz(state, { type: "check", index: 0 }, questions);
  state = advanceQuiz(state, { type: "next", index: 0 }, questions);
  expect(state.score).toBe(1);
  expect(advanceQuiz(state, { type: "next", index: 0 }, questions)).toBe(state);
  state = advanceQuiz(
    state,
    { type: "select", choice: 1, index: 1 },
    questions,
  );
  state = advanceQuiz(state, { type: "check", index: 1 }, questions);
  state = advanceQuiz(state, { type: "next", index: 1 }, questions);
  expect(state.done).toBe(true);
  expect(state.score).toBe(1);
  expect(advanceQuiz(state, { type: "next", index: 1 }, questions)).toBe(state);
  expect(advanceQuiz(state, { type: "restart" }, questions)).toEqual({
    ...initialQuiz,
    attempt: 1,
  });
});
it("safely handles an empty practice", () => {
  expect(advanceQuiz(initialQuiz, { type: "next", index: 0 }, [])).toBe(
    initialQuiz,
  );
});

it("reports exact mistakes only after completion and resets them on retry", async () => {
  const { quizReport } = await import("./quiz");
  expect(quizReport(initialQuiz, questions)).toBeNull();
  let state = initialQuiz;
  for (let index = 0; index < 2; index++) {
    state = advanceQuiz(state, { type: "select", choice: 0, index }, questions);
    state = advanceQuiz(state, { type: "check", index }, questions);
    state = advanceQuiz(state, { type: "next", index }, questions);
  }
  expect(quizReport(state, questions)).toMatchObject({
    score: 50,
    correct: 1,
    total: 2,
    answers: [
      { index: 0, choice: 0, correct: false },
      { index: 1, choice: 0, correct: true },
    ],
  });
  expect(advanceQuiz(state, { type: "restart" }, questions).responses).toEqual(
    [],
  );
});
