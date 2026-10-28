import { ArrowRight, Check } from "lucide-react";
import { lessons, words } from "../data/course";
import { dayKey, addDays, formatDay } from "../lib/calendar";
import {
  levelInfo,
  streak,
  longestStreak,
  studiedDays,
  XP_RULES,
  type Progress,
} from "../lib/progress";

export default function ProgressScreen({ progress }: { progress: Progress }) {
  const level = levelInfo(progress),
    currentStreak = streak(progress),
    days = studiedDays(progress),
    today = dayKey();
  const completed = lessons.filter((lesson) => progress.completed[lesson.id]);
  const learned = words.filter((word) => progress.reviews[word.id]);
  const rewards = Object.entries(progress.rewards)
    .sort((a, b) => b[1].date.localeCompare(a[1].date))
    .slice(0, 8);
  const milestones = [
    {
      title: "El primer paso",
      description: "Completar tu primera lección.",
      earned: completed.length > 0,
    },
    {
      title: "Una semana contigo",
      description: "Estudiar siete días seguidos.",
      earned: longestStreak(progress) >= 7,
    },
    {
      title: "Lo aprendido se queda",
      description: "Superar una evaluación con al menos 60%.",
      earned: Object.values(progress.exams).some(
        (result) => result.score >= XP_RULES.pass,
      ),
    },
    {
      title: "Todo el recorrido inicial",
      description: `Completar las ${lessons.length} lecciones disponibles.`,
      earned: completed.length === lessons.length,
    },
  ];
  return (
    <>
      <div className="page-title">
        <h1>Cada día cuenta</h1>
        <p>
          Tu japonés avanza con práctica. Aquí puedes ver lo que ya has
          construido.
        </p>
      </div>
      <section className="progress-overview" aria-labelledby="level-heading">
        <div className="level-heading">
          <h2 id="level-heading">Nivel {level.level}</h2>
          <strong>{level.total.toLocaleString("es")} XP en total</strong>
        </div>
        <progress
          aria-label={`Avance al nivel ${level.level + 1}`}
          max={XP_RULES.level}
          value={level.current}
        />
        <p>
          {level.remaining} XP para el nivel {level.level + 1}. Cada nivel reúne{" "}
          {XP_RULES.level} XP de práctica.
        </p>
        <a className="text-link" href="#/aula">
          Seguir aprendiendo <ArrowRight size={15} />
        </a>
        <dl className="progress-counts">
          <div>
            <dt>Lecciones completadas</dt>
            <dd>
              {completed.length} <small>de {lessons.length}</small>
            </dd>
          </div>
          <div>
            <dt>Palabras aprendidas</dt>
            <dd>
              {learned.length} <small>de {words.length}</small>
            </dd>
          </div>
          <div>
            <dt>Racha actual</dt>
            <dd>
              {currentStreak}{" "}
              <small>{currentStreak === 1 ? "día" : "días"}</small>
            </dd>
          </div>
          <div>
            <dt>Tu mejor racha</dt>
            <dd>
              {longestStreak(progress)} <small>días</small>
            </dd>
          </div>
        </dl>
      </section>
      <section className="study-calendar">
        <h2>Tus últimas dos semanas</h2>
        <p>
          Un día cuenta al completar una lección, un repaso programado o una
          evaluación. {XP_RULES.streakWeek} XP extra por cada siete días
          seguidos.
        </p>
        <ol>
          {Array.from({ length: 14 }, (_, i) => {
            const date = addDays(today, i - 13),
              active = days.has(date);
            return (
              <li
                key={date}
                className={active ? "active" : ""}
                aria-label={`${formatDay(date)}: ${active ? "estudiaste" : "sin actividad"}${date === today ? ", hoy" : ""}`}
              >
                <span>
                  {new Date(`${date}T12:00:00Z`).toLocaleDateString("es", {
                    weekday: "narrow",
                    timeZone: "UTC",
                  })}
                </span>
                <span className="calendar-day">
                  {active ? (
                    <Check size={18} aria-hidden="true" />
                  ) : (
                    Number(date.slice(-2))
                  )}
                </span>
                <small>
                  {date === today
                    ? "hoy"
                    : active
                      ? Number(date.slice(-2))
                      : "\u00a0"}
                </small>
              </li>
            );
          })}
        </ol>
      </section>
      <section className="progress-milestones">
        <h2>Pequeños hitos, progreso real</h2>
        <ul>
          {milestones.map((item) => (
            <li key={item.title} className={item.earned ? "earned" : ""}>
              <span
                className="milestone-status"
                aria-label={item.earned ? "Conseguido" : "Pendiente"}
              >
                {item.earned ? (
                  <Check size={19} aria-hidden="true" />
                ) : (
                  <span aria-hidden="true">—</span>
                )}
              </span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <span className="milestone-label">
                {item.earned ? "Conseguido" : "Pendiente"}
              </span>
            </li>
          ))}
        </ul>
      </section>
      {rewards.length > 0 && (
        <section className="reward-history">
          <h2>Constancia que suma</h2>
          <ul>
            {rewards.map(([key, reward]) => (
              <li key={key}>
                <span>
                  Bonificación por siete días · {formatDay(reward.date)}
                </span>
                <strong>+{reward.xp} XP</strong>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="progress-next">
        <div>
          <h2>
            {completed.length
              ? "Sigue a tu ritmo"
              : "Tu primer paso empieza aquí"}
          </h2>
          <p>
            {completed.length
              ? "Vuelve a tu recorrido o comprueba cuánto recuerdas."
              : "Completa una lección y empezarás a ver tu avance en este espacio."}
          </p>
        </div>
        <a
          className="primary"
          href={completed.length ? "#/evaluaciones" : "#/aula"}
        >
          {completed.length ? "Ir a evaluaciones" : "Comenzar una lección"}
          <ArrowRight size={17} />
        </a>
      </div>
      <details className="assessment-rules">
        <summary>Qué significan tus XP y niveles</summary>
        <p>
          Una lección nueva suma {XP_RULES.lesson} XP y recordar una palabra en
          su repaso programado suma {XP_RULES.review} XP. Superar la evaluación
          semanal suma {XP_RULES.weeklyExam} XP; la mensual,{" "}
          {XP_RULES.monthlyExam} XP. Las bonificaciones no se duplican al
          repetir.
        </p>
        <p>
          Los niveles reflejan tu actividad personal; no equivalen a una
          certificación de idioma. Las rachas usan la fecha de tu dispositivo.
          No hace falta obtener XP para que una práctica completada cuente como
          día de estudio.
        </p>
      </details>
    </>
  );
}
