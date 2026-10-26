import { useEffect, useReducer, useRef } from "react";
import { advanceQuiz, initialQuiz } from "../lib/quiz";
import AudioButton from "./AudioButton";
import { ArrowRight, Check, RotateCcw } from "lucide-react";
import type { Question } from "../data/course";
export default function Quiz({
  questions,
  onComplete,
  title = "Ponte a prueba",
  onExit,
}: {
  questions: Question[];
  onComplete: (score: number) => void;
  title?: string;
  onExit: () => void;
}) {
  const [state, dispatch] = useReducer(
    (state: typeof initialQuiz, action: Parameters<typeof advanceQuiz>[1]) =>
      advanceQuiz(state, action, questions),
    initialQuiz,
  );
  const { index, choice, checked, score, done, attempt } = state;
  const delivered = useRef(-1);
  useEffect(() => {
    if (done && delivered.current !== attempt) {
      delivered.current = attempt;
      onComplete(Math.round((score / questions.length) * 100));
    }
  }, [done, attempt, score, questions.length, onComplete]);
  const q = questions[index];
  if (!q)
    return (
      <section className="empty-state">
        <h2>Práctica no disponible</h2>
        <p>Vuelve al recorrido y elige otra lección.</p>
        <button className="secondary" onClick={onExit}>
          Volver al recorrido
        </button>
      </section>
    );
  if (done)
    return (
      <div className="quiz-result">
        <span className="result-symbol" lang="ja">
          よくできました
        </span>
        <h2>Un paso más.</h2>
        <p>
          Acertaste {score} de {questions.length} preguntas.{" "}
          {score === questions.length
            ? "Has reconocido todos los conceptos de esta práctica."
            : "Vuelve a los ejemplos y presta atención a las explicaciones de tus errores."}
        </p>
        <button className="primary" onClick={onExit}>
          Volver al recorrido <ArrowRight size={18} />
        </button>
        <button
          className="text-button"
          onClick={() => dispatch({ type: "restart" })}
        >
          <RotateCcw size={16} /> Practicar otra vez
        </button>
      </div>
    );
  return (
    <section className="quiz">
      <div className="quiz-top">
        <h2>{title}</h2>
        <span>
          Pregunta {index + 1} de {questions.length}
        </span>
      </div>
      <progress
        aria-label="Avance de la práctica"
        max={questions.length}
        value={index}
      />
      {q.jp && (
        <p className="quiz-character" lang="ja">
          {q.jp}
        </p>
      )}
      {q.listening && (
        <div className="listening-question">
          <AudioButton text={q.listening} />
          <details>
            <summary>Ver el carácter</summary>
            <p lang="ja">{q.listening}</p>
          </details>
        </div>
      )}
      <fieldset>
        <legend>{q.prompt}</legend>
        <div className="answer-grid">
          {q.options.map((option, i) => (
            <button
              type="button"
              key={option}
              disabled={checked}
              className={`answer ${choice === i ? "selected" : ""} ${checked && i === q.correct ? "correct" : ""} ${checked && choice === i && choice !== q.correct ? "incorrect" : ""}`}
              aria-pressed={choice === i}
              onClick={() => dispatch({ type: "select", choice: i, index })}
            >
              <span>{option}</span>
              {checked && i === q.correct && <Check size={20} />}
            </button>
          ))}
        </div>
      </fieldset>
      {checked && (
        <div
          className={`feedback ${choice === q.correct ? "positive" : ""}`}
          role="status"
        >
          <strong>
            {choice === q.correct ? "Correcto." : "Vamos a repasarlo."}
          </strong>
          <p>{q.explanation}</p>
        </div>
      )}
      <div className="quiz-bottom">
        <button className="text-button" onClick={onExit}>
          Salir de la práctica
        </button>
        <button
          className="primary"
          disabled={choice === null}
          onClick={() => dispatch({ type: checked ? "next" : "check", index })}
        >
          {checked
            ? index + 1 === questions.length
              ? "Ver resultado"
              : "Siguiente"
            : "Comprobar"}
          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}
