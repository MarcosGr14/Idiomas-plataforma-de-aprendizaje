import { useState } from "react";
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
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = questions[index];
  const finish = () => {
    const nextScore = score + (choice === q.correct ? 1 : 0);
    setScore(nextScore);
    if (index + 1 === questions.length) {
      setDone(true);
      onComplete(Math.round((nextScore / questions.length) * 100));
    } else {
      setIndex(index + 1);
      setChoice(null);
      setChecked(false);
    }
  };
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
          onClick={() => {
            setIndex(0);
            setScore(0);
            setChoice(null);
            setChecked(false);
            setDone(false);
          }}
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
              onClick={() => setChoice(i)}
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
          onClick={() => (checked ? finish() : setChecked(true))}
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
