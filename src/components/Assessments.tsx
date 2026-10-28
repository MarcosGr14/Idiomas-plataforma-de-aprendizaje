import { useState } from "react";
import { ArrowRight, Printer, Check } from "lucide-react";
import Quiz from "./Quiz";
import JapaneseText from "./JapaneseText";
import {
  assessmentPlan,
  questionPool,
  type AssessmentQuestion,
} from "../lib/assessments";
import {
  dayKey,
  periodLabel,
  formatDay,
  type AssessmentMode,
} from "../lib/calendar";
import { recordAssessment, XP_RULES, type Progress } from "../lib/progress";
import { captureEnabled } from "../lib/capture";

type Session = ReturnType<typeof assessmentPlan> & {
  id: string;
  practice?: boolean;
};
const titles = { semanal: "Revisión semanal", mensual: "Balance mensual" };
export default function Assessments({
  progress,
  update,
}: {
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [answers, setAnswers] = useState(false);
  const [printMode, setPrintMode] = useState<AssessmentMode>("semanal");
  const pool = questionPool(progress);
  const printable = assessmentPlan(progress, printMode);
  const history = Object.entries(progress.exams)
    .sort(
      (a, b) => b[1].date.localeCompare(a[1].date) || b[0].localeCompare(a[0]),
    )
    .slice(0, 12);
  const start = (mode: AssessmentMode) => {
    const plan = assessmentPlan(progress, mode);
    if (!plan.questions.length) return;
    setSession({
      ...plan,
      id: captureEnabled ? `demo-${mode}` : crypto.randomUUID(),
    });
  };
  const practiceMistakes = (ids: readonly string[]) => {
    const questions = ids
      .map((id) => pool.find((q) => q.id === id))
      .filter((q): q is AssessmentQuestion => !!q);
    if (!questions.length) return;
    setSession({
      ...assessmentPlan(progress, "semanal"),
      questions,
      id: "mistakes",
      practice: true,
    });
  };
  const heading = (
    <div className="page-title">
      <h1>Comprueba lo aprendido</h1>
      <p>
        Evalúa tus lecciones completadas. Conservamos tu mejor resultado de cada
        período.
      </p>
    </div>
  );
  if (session)
    return (
      <>
        {heading}
        <p className="assessment-context">
          {session.practice
            ? "Repaso de errores · sin XP adicional"
            : `${titles[session.mode]} · ${periodLabel(session.period)} · ${session.questions.length} preguntas`}
        </p>
        <Quiz
          key={session.id}
          questions={session.questions}
          title={session.practice ? "Repasa tus errores" : titles[session.mode]}
          exitLabel="Volver a evaluaciones"
          restartLabel={
            session.practice ? "Practicar otra vez" : "Repetir evaluación"
          }
          onExit={() => setSession(null)}
          onComplete={(_, report) => {
            if (session.practice) return;
            update((p) =>
              recordAssessment(p, {
                mode: session.mode,
                period: session.period,
                score: report.score,
                total: report.total,
                attemptId: `${session.id}_${report.attempt}`,
                mistakes: report.answers
                  .filter((a) => !a.correct)
                  .map((a) => session.questions[a.index].id),
              }),
            );
          }}
          resultSummary={(report) => {
            const missed = report.answers.filter((a) => !a.correct);
            return (
              <>
                <h2>
                  {report.score >= XP_RULES.pass
                    ? "Una base más firme."
                    : "Vamos a reforzarlo."}
                </h2>
                <p className="assessment-score">{report.score}%</p>
                <p>
                  {report.correct} de {report.total} respuestas correctas.
                </p>
                {!session.practice && (
                  <p>
                    {progress.exams[session.period]?.rewarded
                      ? "La bonificación de este período ya está registrada. Repetir no suma más XP."
                      : `Alcanza ${XP_RULES.pass}% para recibir la bonificación del período.`}
                  </p>
                )}
                {missed.length > 0 && (
                  <details className="mistake-details">
                    <summary>
                      Revisar {missed.length}{" "}
                      {missed.length === 1 ? "error" : "errores"}
                    </summary>
                    <ol>
                      {missed.map((answer) => {
                        const q = session.questions[answer.index];
                        return (
                          <li key={q.id}>
                            <p>
                              <strong>
                                <JapaneseText text={q.prompt} />
                              </strong>
                            </p>
                            {(q.jp || q.listening) && (
                              <p lang="ja">{q.jp || q.listening}</p>
                            )}
                            <p>
                              Elegiste:{" "}
                              <JapaneseText text={q.options[answer.choice]} />.
                              Respuesta:{" "}
                              <JapaneseText text={q.options[q.correct]} />.
                            </p>
                            <p>
                              <JapaneseText text={q.explanation} />
                            </p>
                            <a
                              className="text-link"
                              href={`#/leccion/${q.lessonId}`}
                            >
                              Volver a {q.lessonTitle}
                            </a>
                          </li>
                        );
                      })}
                    </ol>
                  </details>
                )}
              </>
            );
          }}
        />
      </>
    );
  return (
    <>
      {heading}
      <div className="exam-options">
        {(["semanal", "mensual"] as const).map((mode) => {
          const plan = assessmentPlan(progress, mode),
            result = progress.exams[plan.period],
            reward =
              mode === "semanal" ? XP_RULES.weeklyExam : XP_RULES.monthlyExam;
          return (
            <section key={mode}>
              <h2>{titles[mode]}</h2>
              <p>{periodLabel(plan.period)}</p>
              <p>
                {plan.questions.length
                  ? `${plan.questions.length} preguntas de tus lecciones completadas, repartidas entre los temas estudiados.`
                  : "Completa una lección para empezar."}
              </p>
              <p>
                Alcanza {XP_RULES.pass}%: +{reward} XP, una vez por{" "}
                {mode === "semanal" ? "semana" : "mes"}.
              </p>
              {result && (
                <p className="assessment-saved">
                  <Check size={16} /> Mejor resultado: {result.score}%
                  {result.rewarded ? " · XP registrados" : ""}
                </p>
              )}
              <button
                className={mode === "semanal" ? "primary" : "secondary"}
                disabled={!plan.questions.length}
                onClick={() => start(mode)}
              >
                {result ? "Volver a practicar" : "Comenzar evaluación"}
                <ArrowRight size={16} />
              </button>
            </section>
          );
        })}
      </div>
      {!pool.length && (
        <p className="feedback">
          Tu primera evaluación se abre al completar una lección.{" "}
          <a className="text-link" href="#/aula">
            Ir al recorrido
          </a>
        </p>
      )}
      {history.length > 0 && (
        <section className="assessment-history">
          <h2>Tus resultados</h2>
          <ul>
            {history.map(([key, result]) => {
              const mistakes = (result.mistakes ?? []).filter((id) =>
                pool.some((q) => q.id === id),
              );
              return (
                <li key={key}>
                  <div>
                    <h3>
                      {
                        titles[
                          key.startsWith("semanal:") ? "semanal" : "mensual"
                        ]
                      }
                    </h3>
                    <p>
                      {periodLabel(key)} · Último intento:{" "}
                      {formatDay(result.date)}
                    </p>
                    <p>
                      Mejor: <strong>{result.score}%</strong> · Último:{" "}
                      {result.lastScore ?? result.score}% ·{" "}
                      {result.attempts ?? 1}{" "}
                      {(result.attempts ?? 1) === 1 ? "intento" : "intentos"}
                    </p>
                  </div>
                  {mistakes.length > 0 && (
                    <button
                      className="secondary"
                      onClick={() => practiceMistakes(mistakes)}
                    >
                      Repasar {mistakes.length}{" "}
                      {mistakes.length === 1 ? "error" : "errores"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
      <section className="export-panel">
        <h2>También en papel</h2>
        <p>
          Descarga una práctica del período con «Guardar como PDF» en el diálogo
          de impresión.
        </p>
        <label className="print-mode">
          Tipo de práctica
          <select
            value={printMode}
            onChange={(e) => setPrintMode(e.target.value as AssessmentMode)}
          >
            <option value="semanal">Revisión semanal</option>
            <option value="mensual">Balance mensual</option>
          </select>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={answers}
            onChange={(e) => setAnswers(e.target.checked)}
          />{" "}
          Incluir soluciones
        </label>
        <button
          className="secondary"
          disabled={!printable.questions.length}
          onClick={() => window.print()}
        >
          <Printer size={17} /> Imprimir o guardar PDF
        </button>
      </section>
      <details className="assessment-rules">
        <summary>Cómo se guardan tus evaluaciones</summary>
        <p>
          Semanas de lunes a domingo y meses de calendario, según la fecha de tu
          dispositivo. La selección y el período se fijan al comenzar; no
          cambian durante la evaluación.
        </p>
        <p>
          Repetir conserva el mejor porcentaje. Puedes volver a intentarlo hasta
          superar el {XP_RULES.pass}%; los XP se conceden una sola vez por
          período. Los resultados anteriores mantienen los XP que ya recibieron.
          Estos resultados no certifican un nivel oficial.
        </p>
      </details>
      <div className="print-sheet">
        <h1>Idiomas · Práctica de japonés</h1>
        <p>
          {titles[printMode]} · {periodLabel(printable.period)}
        </p>
        <p>Fecha: {dayKey()} · Nombre: ____________________</p>
        {printable.questions.map((q, i) => (
          <section key={q.id}>
            <h2>
              {i + 1}.{" "}
              {q.listening ? (
                "Lee el carácter y elige su sonido."
              ) : (
                <JapaneseText text={q.prompt} />
              )}
            </h2>
            {(q.jp || q.listening) && <p lang="ja">{q.jp || q.listening}</p>}
            {q.options.map((option, j) => (
              <p key={option}>
                ○ <JapaneseText text={option} />
                {answers && j === q.correct ? " (correcta)" : ""}
              </p>
            ))}
            {answers && (
              <p>
                <JapaneseText text={q.explanation} />
              </p>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
