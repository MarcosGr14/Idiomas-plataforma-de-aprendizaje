import { lazy, Suspense, useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Flame,
  GraduationCap,
  Headphones,
  Home,
  Library,
  LogOut,
  Menu,
  Pause,
  Play,
  Settings,
  Volume2,
  X,
  Download,
  Lock,
  PenLine,
  Printer,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { lessons, units, words, placement } from "./data/course";
import {
  completeLesson,
  dayKey,
  reviewWord,
  streak,
  xp,
  type Progress,
} from "./lib/progress";
import { useProgress } from "./lib/useProgress";
import { supabase } from "./lib/supabase";
import AudioButton from "./components/AudioButton";
import Quiz from "./components/Quiz";
import WritingPad from "./components/WritingPad";
const Street = lazy(() => import("./components/Street"));
const go = (route: string) => {
  window.location.hash = route;
  window.scrollTo({ top: 0, behavior: "instant" });
};
function useRoute() {
  const [route, setRoute] = useState(location.hash.slice(1) || "/");
  useEffect(() => {
    const fn = () => setRoute(location.hash.slice(1) || "/");
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  return route;
}
function Brand() {
  return (
    <a className="brand" href="#/" aria-label="Idiomas, inicio">
      <span className="brand-mark" lang="ja">
        文
      </span>
      <span>
        idiomas<span className="brand-dot">.</span>
      </span>
    </a>
  );
}
function App() {
  const route = useRoute();
  const { user, progress, update, ready, status, retry } = useProgress();
  const [menu, setMenu] = useState(false);
  const [notice, setNotice] = useState("");
  const [systemReduced, setSystemReduced] = useState(
    matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [install, setInstall] = useState<any>(null);
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setSystemReduced(media.matches);
    media.addEventListener("change", change);
    const prompt = (e: Event) => {
      e.preventDefault();
      setInstall(e);
    };
    const net = () => setOnline(navigator.onLine);
    window.addEventListener("beforeinstallprompt", prompt);
    window.addEventListener("online", net);
    window.addEventListener("offline", net);
    return () => {
      media.removeEventListener("change", change);
      window.removeEventListener("beforeinstallprompt", prompt);
      window.removeEventListener("online", net);
      window.removeEventListener("offline", net);
    };
  }, []);
  useEffect(() => {
    setMenu(false);
    document.querySelector<HTMLElement>("main")?.focus({ preventScroll: true });
    window.speechSynthesis?.cancel();
  }, [route]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (!menu) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        document
          .querySelector<HTMLButtonElement>(".mobile-bar button")
          ?.focus();
      }
    };
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = old;
      window.removeEventListener("keydown", esc);
    };
  }, [menu]);
  const reduced = progress.reducedMotion || systemReduced;
  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? "reduced" : "full";
  }, [reduced]);
  const installApp = async () => {
    if (install) {
      await install.prompt();
      setInstall(null);
    } else
      setNotice(
        "Para instalar: abre el menú de tu navegador y elige «Instalar aplicación» o «Añadir a pantalla de inicio». En iPhone, usa Compartir en Safari.",
      );
  };
  const lessonIndex = route.startsWith("/leccion/")
    ? lessons.findIndex((l) => l.id === route.split("/")[2])
    : -1;
  const isHome = route === "/";
  const known = words.filter((w) => progress.reviews[w.id]);
  const due = known.filter((w) => progress.reviews[w.id].due <= dayKey());
  const suggestedIndex =
    progress.placement !== null && progress.placement >= 80
      ? 3
      : progress.placement !== null && progress.placement >= 50
        ? 1
        : 0;
  const nextIndex = !progress.completed[lessons[suggestedIndex].id]
    ? suggestedIndex
    : lessons.findIndex((l) => !progress.completed[l.id]);
  const navigation = [
    { path: "/aula", label: "Mi recorrido", icon: Home },
    { path: "/biblioteca", label: "Vocabulario", icon: Library },
    { path: "/repaso", label: "Repasar", icon: RefreshCw },
    { path: "/escritura", label: "Escritura", icon: PenLine },
    { path: "/evaluaciones", label: "Evaluaciones", icon: GraduationCap },
  ];
  return (
    <>
      <a
        className="skip"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
          document.getElementById("main")?.scrollIntoView();
        }}
      >
        Saltar al contenido
      </a>
      {isHome ? (
        <header className="landing-nav">
          <Brand />
          <nav aria-label="Principal">
            <a href="#/aula">El recorrido</a>
            <a href="#/biblioteca">Explorar japonés</a>
          </nav>
          <button
            className="nav-login"
            onClick={() => go(user ? "/ajustes" : "/cuenta")}
          >
            {user ? "Mi cuenta" : "Iniciar sesión"}
            <ArrowUpRight size={17} />
          </button>
        </header>
      ) : (
        <>
          <header className="mobile-bar">
            <Brand />
            <button
              className="icon-button"
              aria-label={menu ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </header>
          <aside className={`sidebar ${menu ? "open" : ""}`}>
            <Brand />
            <div className="language-choice">
              <span className="japan-dot" />
              <div>
                <strong>Japonés</strong>
                <small>Desde el principio</small>
              </div>
              <span lang="ja">日本語</span>
            </div>
            <nav aria-label="Aprendizaje">
              {navigation.map((n) => (
                <a
                  href={`#${n.path}`}
                  key={n.path}
                  className={route === n.path ? "active" : ""}
                  aria-current={route === n.path ? "page" : undefined}
                >
                  <n.icon size={19} />
                  {n.label}
                  {n.path === "/repaso" && due.length > 0 && (
                    <span className="count">{due.length}</span>
                  )}
                </a>
              ))}
            </nav>
            <div className="sidebar-bottom">
              <a href="#/ajustes">
                <Settings size={18} /> Ajustes
              </a>
              <button onClick={installApp}>
                <Download size={18} /> Instalar aplicación
              </button>
              <a href="#/cuenta">
                <UserRound size={18} />
                {user ? "Tu cuenta" : "Guardar en una cuenta"}
              </a>
              <p>{user ? user.email : "Modo local · sin registro"}</p>
              <a className="back-home" href="#/">
                Volver al inicio <ArrowUpRight size={14} />
              </a>
            </div>
          </aside>
        </>
      )}
      <main
        id="main"
        inert={menu || undefined}
        tabIndex={-1}
        className={isHome ? "landing" : "workspace"}
      >
        {!online && (
          <div className="connection-notice" role="status">
            Estás sin conexión. Puedes usar el contenido descargado; el audio
            depende de la voz instalada en tu dispositivo.
          </div>
        )}
        {isHome ? (
          <>
            <section className="hero">
              <div className="hero-heading">
                <h1>
                  Tu viaje empieza
                  <br />
                  en japonés.
                </h1>
                <div className="hero-intro">
                  <p>
                    De tu primer <span lang="ja">こんにちは</span>
                    <br />a entender un mundo nuevo.
                    <br />
                    Un pequeño paso cada día.
                  </p>
                  <button className="primary" onClick={() => go("/aula")}>
                    Empezar a aprender <ArrowRight size={19} />
                  </button>
                  <span className="small">
                    A tu ritmo. Desde cero. Sin registro para probar.
                  </span>
                </div>
              </div>
              <div className="street">
                <Suspense
                  fallback={
                    <div className="street-loading">
                      Preparando tu primera parada…
                    </div>
                  }
                >
                  <Street reduced={reduced} />
                </Suspense>
                <div className="street-caption">
                  <button
                    className="street-translation"
                    onClick={() =>
                      setNotice(
                        "本屋 · hon’ya · librería. En la calle, los caracteres cuentan historias. Pronto podrás leerlas.",
                      )
                    }
                  >
                    <span lang="ja">本屋</span>
                    <span>¿Qué dice este letrero?</span>
                    <ArrowUpRight size={16} />
                  </button>
                  <button
                    className="motion-button"
                    disabled={systemReduced}
                    onClick={() =>
                      update((p) => ({ ...p, reducedMotion: !p.reducedMotion }))
                    }
                    aria-pressed={reduced}
                  >
                    {reduced ? <Play size={15} /> : <Pause size={15} />}{" "}
                    {systemReduced
                      ? "Movimiento reducido del sistema"
                      : reduced
                        ? "Activar movimiento"
                        : "Pausar movimiento"}
                  </button>
                </div>
              </div>
            </section>
            <section className="intro-section">
              <div>
                <span className="large-jp" lang="ja">
                  一歩ずつ。
                </span>
                <p>Paso a paso.</p>
              </div>
              <div>
                <h2>
                  No memorices un idioma.
                  <br />
                  Empieza a entenderlo.
                </h2>
                <p>
                  Escucha sus sonidos. Reconoce sus caracteres. Lee tus primeras
                  palabras. Cada lección conecta lo nuevo con lo que ya sabes.
                </p>
                <a className="text-link" href="#/diagnostico">
                  Ya sé un poco de japonés <ArrowUpRight size={18} />
                </a>
              </div>
            </section>
            <section className="preview-section">
              <div className="section-title">
                <h2>Tu primera parada</h2>
                <span>Unidad piloto · 5 lecciones</span>
              </div>
              {lessons.slice(0, 3).map((l, i) => (
                <button
                  className="preview-row"
                  key={l.id}
                  onClick={() => go(`/leccion/${l.id}`)}
                >
                  <span className="preview-kana" lang="ja">
                    {l.symbol}
                  </span>
                  <span>
                    <strong>{l.title}</strong>
                    <small>{l.subtitle}</small>
                  </span>
                  <span className="preview-time">{l.minutes} min</span>
                  <ArrowUpRight size={24} />
                </button>
              ))}
              <p className="small">
                La primera unidad ya se puede explorar. El resto del recorrido
                está en preparación.
              </p>
            </section>
            <section className="closing">
              <p lang="ja">はじめましょう</p>
              <h2>Hoy, tu primera palabra.</h2>
              <button className="primary light" onClick={() => go("/aula")}>
                Entrar al aula <ArrowRight size={18} />
              </button>
            </section>
            <Footer />
          </>
        ) : !ready ? (
          <div className="loading-state" role="status">
            Preparando tu progreso…
          </div>
        ) : route === "/aula" ? (
          <>
            <PageTitle
              title="Un pequeño paso, cada día."
              description="Tu recorrido de japonés comienza aquí."
            />
            <div className="study-meta">
              <span>
                <span className="japan-dot" /> Japonés inicial
              </span>
              <span>{status}</span>
            </div>
            <section className="study-grid">
              <div className="next-lesson">
                <div className="lesson-copy">
                  <p>
                    {nextIndex < 0
                      ? "Unidad piloto completada"
                      : "Tu siguiente lección"}
                  </p>
                  <h2>
                    {nextIndex < 0
                      ? "Lo aprendido se queda contigo."
                      : lessons[nextIndex].title}
                  </h2>
                  <p>
                    {nextIndex < 0
                      ? "Vuelve a tus palabras y refuerza los conceptos que necesitan un poco más de práctica."
                      : lessons[nextIndex].objective}
                  </p>
                  <button
                    className="primary"
                    onClick={() =>
                      go(
                        nextIndex < 0
                          ? "/repaso"
                          : `/leccion/${lessons[nextIndex].id}`,
                      )
                    }
                  >
                    {nextIndex < 0
                      ? "Ir al repaso"
                      : nextIndex === 0
                        ? "Comenzar mi primera lección"
                        : "Continuar aprendiendo"}
                    <ArrowRight size={18} />
                  </button>
                  <small>
                    {nextIndex < 0
                      ? `${known.length} palabras y expresiones disponibles`
                      : `${lessons[nextIndex].minutes} minutos · lectura y práctica`}
                  </small>
                </div>
                <span className="next-character" lang="ja">
                  {nextIndex < 0 ? "学" : lessons[nextIndex].symbol}
                </span>
              </div>
              <div className="daily-panel">
                <h2>Tu ritmo</h2>
                <div className="metric-row">
                  <span>
                    <Flame size={17} /> Racha actual
                  </span>
                  <strong>
                    {streak(progress)}{" "}
                    <small>{streak(progress) === 1 ? "día" : "días"}</small>
                  </strong>
                </div>
                <div className="metric-row">
                  <span>
                    Experiencia · nivel {Math.floor(xp(progress) / 100) + 1}
                  </span>
                  <strong>
                    {xp(progress)} <small>XP</small>
                  </strong>
                </div>
                <div className="metric-row">
                  <span>Meta diaria</span>
                  <strong>
                    {progress.goal} <small>min</small>
                  </strong>
                </div>
                <div className="week-strip">
                  {Array.from({ length: 7 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - 6 + i);
                    const active =
                      progress.studied.includes(dayKey(date)) ||
                      progress.activity[dayKey(date)] > 0;
                    return (
                      <span
                        key={i}
                        title={dayKey(date)}
                        className={active ? "studied" : ""}
                      >
                        {active ? (
                          <Check size={14} />
                        ) : (
                          date.toLocaleDateString("es", { weekday: "narrow" })
                        )}
                      </span>
                    );
                  })}
                </div>
                <p className="small">
                  {streak(progress) >= 7
                    ? "Siete días de constancia. Has ganado el reconocimiento de esta semana."
                    : "Cada día que completas una lección o haces un repaso cuenta."}
                </p>
              </div>
            </section>
            {progress.placement === null && (
              <section className="diagnostic-callout">
                <div>
                  <h2>¿No empiezas desde cero?</h2>
                  <p>Comprueba qué partes de la unidad piloto ya reconoces.</p>
                </div>
                <button
                  className="secondary"
                  onClick={() => go("/diagnostico")}
                >
                  Hacer diagnóstico <ArrowUpRight size={16} />
                </button>
              </section>
            )}
            <section className="course-section">
              <div className="section-title">
                <h2>Primeros encuentros</h2>
                <span>
                  {Object.keys(progress.completed).length} de {lessons.length}{" "}
                  lecciones
                </span>
              </div>
              <div className="lesson-list">
                {lessons.map((l, i) => (
                  <button
                    className="lesson-row"
                    key={l.id}
                    onClick={() => go(`/leccion/${l.id}`)}
                  >
                    <span
                      className={`lesson-state ${progress.completed[l.id] ? "completed" : ""}`}
                    >
                      {progress.completed[l.id] ? (
                        <Check size={18} />
                      ) : (
                        <BookOpen size={18} />
                      )}
                    </span>
                    <span>
                      <strong>{l.title}</strong>
                      <small>{l.subtitle}</small>
                    </span>
                    <span className="lesson-duration">
                      {progress.completed[l.id]
                        ? `${progress.completed[l.id].score}%`
                        : `${l.minutes} min`}
                    </span>
                    <ChevronRight size={18} />
                  </button>
                ))}
              </div>
            </section>
            <section className="planned-course">
              <h2>Un camino por descubrir</h2>
              <p>
                Estas unidades forman el plan del curso. Aún no contienen
                lecciones disponibles.
              </p>
              {units.slice(1).map((u) => (
                <div className="planned-row" key={u.title}>
                  <span lang="ja">{u.symbol}</span>
                  <strong>{u.title}</strong>
                  <small>En preparación</small>
                  <Lock size={14} />
                </div>
              ))}
            </section>
          </>
        ) : lessonIndex >= 0 ? (
          <LessonScreen
            key={lessons[lessonIndex].id}
            index={lessonIndex}
            progress={progress}
            update={update}
            notify={setNotice}
          />
        ) : route === "/diagnostico" ? (
          <>
            <PageTitle
              title="Encuentra tu comienzo"
              description="Seis preguntas sobre la unidad piloto. No es una certificación ni mide niveles avanzados."
            />
            <Quiz
              key="placement"
              title="Diagnóstico inicial"
              questions={placement}
              onExit={() => go("/aula")}
              onComplete={(score) => {
                update((p) => ({ ...p, placement: score }));
                setNotice(
                  score >= 80
                    ? "Reconoces gran parte del piloto. Puedes repasar sus lecciones y comprobar tu dominio."
                    : "Empieza por las vocales y avanza a tu ritmo. El recorrido está abierto para explorar.",
                );
              }}
            />
          </>
        ) : route === "/biblioteca" ? (
          <Vocabulary progress={progress} />
        ) : route === "/repaso" ? (
          <ReviewScreen key={route} progress={progress} update={update} />
        ) : route === "/escritura" ? (
          <>
            <PageTitle
              title="Haz tuyo cada carácter"
              description="Observa su forma, dibuja y vuelve a intentarlo sin prisa."
            />
            <WritingPad />
          </>
        ) : route === "/evaluaciones" ? (
          <Exams progress={progress} update={update} />
        ) : route === "/ajustes" ? (
          <>
            <PageTitle
              title="A tu manera"
              description="Haz espacio para el japonés en tu día."
            />
            <section className="settings-section">
              <div>
                <h2>Tu tiempo diario</h2>
                <p>
                  Elige un ritmo. Con 5 minutos puedes dividir una lección entre
                  lectura y práctica.
                </p>
              </div>
              <div className="segmented">
                {[5, 10, 20].map((n) => (
                  <button
                    aria-pressed={progress.goal === n}
                    className={progress.goal === n ? "selected" : ""}
                    key={n}
                    onClick={() => update((p) => ({ ...p, goal: n }))}
                  >
                    {n} min
                  </button>
                ))}
              </div>
            </section>
            <section className="settings-section">
              <div>
                <h2>Ayudas de lectura</h2>
                <p>Muestra rōmaji junto al vocabulario japonés.</p>
              </div>
              <button
                role="switch"
                aria-checked={progress.romanization}
                className={`switch ${progress.romanization ? "on" : ""}`}
                onClick={() =>
                  update((p) => ({ ...p, romanization: !p.romanization }))
                }
              >
                <span />
                <span className="sr-only">Mostrar rōmaji</span>
              </button>
            </section>
            <section className="settings-section">
              <div>
                <h2>Movimiento reducido</h2>
                <p>
                  {systemReduced
                    ? "Tu sistema ya solicita movimiento reducido."
                    : "Detiene la animación de la calle y los desplazamientos decorativos."}
                </p>
              </div>
              <button
                role="switch"
                aria-checked={reduced}
                disabled={systemReduced}
                className={`switch ${reduced ? "on" : ""}`}
                onClick={() =>
                  update((p) => ({ ...p, reducedMotion: !p.reducedMotion }))
                }
              >
                <span />
                <span className="sr-only">Reducir movimiento</span>
              </button>
            </section>
            <section className="settings-section">
              <div>
                <h2>Tu progreso</h2>
                <p>
                  {status}.{" "}
                  {user
                    ? "Los datos pertenecen a tu cuenta."
                    : "En modo local se conserva en este navegador. Borrar sus datos elimina este progreso."}
                </p>
              </div>
              <button
                className="secondary"
                onClick={() => {
                  if (user) retry();
                  else go("/cuenta");
                }}
              >
                {user ? "Reintentar sincronización" : "Conectar una cuenta"}
              </button>
            </section>
            <section className="settings-section">
              <div>
                <h2>Lleva tus datos contigo</h2>
                <p>Descarga una copia de tu progreso en formato JSON.</p>
              </div>
              <button
                className="secondary"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(progress, null, 2)], {
                    type: "application/json",
                  });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = "idiomas-progreso.json";
                  a.click();
                  URL.revokeObjectURL(a.href);
                }}
              >
                <Download size={16} /> Exportar progreso
              </button>
            </section>
            <section className="settings-section">
              <div>
                <h2>Instalar Idiomas</h2>
                <p>Abre tu aula desde la pantalla de inicio.</p>
              </div>
              <button className="secondary" onClick={installApp}>
                Instalar aplicación <ArrowUpRight size={16} />
              </button>
            </section>
            <p className="small">
              El audio de esta versión usa la voz japonesa de tu dispositivo. La
              calidad y la disponibilidad dependen de tu navegador. No se usa el
              micrófono.
            </p>
            <Footer />
          </>
        ) : route === "/cuenta" ? (
          <Account userEmail={user?.email} notify={setNotice} />
        ) : route === "/privacidad" || route === "/creditos" ? (
          <InfoPage credits={route === "/creditos"} />
        ) : (
          <>
            <PageTitle
              title="Esta página no está aquí"
              description="Puedes volver a tu recorrido y continuar aprendiendo."
            />
            <button className="primary" onClick={() => go("/aula")}>
              Volver al aula
            </button>
          </>
        )}
      </main>
      {notice && (
        <div className="toast" role="status">
          <p>{notice}</p>
          <button
            className="icon-button"
            aria-label="Cerrar aviso"
            onClick={() => setNotice("")}
          >
            <X size={18} />
          </button>
        </div>
      )}
    </>
  );
}
function PageTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="page-title">
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}
function Footer() {
  const github = import.meta.env.VITE_AUTHOR_GITHUB_URL;
  return (
    <footer className="footer">
      <Brand />
      <p>Hecho por Marcos. Un idioma abre un mundo.</p>
      <nav aria-label="Pie de página">
        <a href="#/aula">Aprender</a>
        <a href="#/privacidad">Privacidad</a>
        <a href="#/creditos">Créditos</a>
        {github && (
          <a href={github} target="_blank" rel="noreferrer">
            GitHub <ArrowUpRight size={13} />
          </a>
        )}
      </nav>
      <small>
        © {new Date().getFullYear()} Marcos · Idiomas. Versión piloto.
      </small>
    </footer>
  );
}
function LessonScreen({
  index,
  progress,
  update,
  notify,
}: {
  index: number;
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
  notify: (s: string) => void;
}) {
  const [practice, setPractice] = useState(false);
  const lesson = lessons[index];
  const vocab = words.filter((w) => w.lesson === index);
  if (practice)
    return (
      <>
        <PageTitle
          title={lesson.title}
          description="Recuerda los ejemplos. Equivocarse también forma parte del aprendizaje."
        />
        <Quiz
          questions={lesson.questions}
          onExit={() => go("/aula")}
          onComplete={(score) => {
            if (score >= 60) {
              update((p) =>
                completeLesson(
                  p,
                  lesson.id,
                  score,
                  vocab.map((w) => w.id),
                ),
              );
              notify(
                progress.completed[lesson.id]
                  ? "Práctica terminada. Conservamos tu mejor resultado."
                  : "Lección completada: +30 XP. Tus palabras ya están en el repaso.",
              );
            } else
              notify(
                "Para completar la lección necesitas al menos 3 de 5 respuestas correctas. Repasa los ejemplos y vuelve a intentarlo.",
              );
          }}
        />
      </>
    );
  return (
    <>
      <a className="text-link back-link" href="#/aula">
        ← Volver al recorrido
      </a>
      <PageTitle
        title={lesson.title}
        description={`${lesson.subtitle} · ${lesson.minutes} minutos`}
      />
      <article className="lesson-article">
        <div className="lesson-introduction">
          <span lang="ja">{lesson.symbol}</span>
          <div>
            <h2>Lo que vas a aprender</h2>
            <p>{lesson.objective}</p>
          </div>
        </div>
        <div className="lesson-prose">
          {lesson.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <h2>Escucha y reconoce</h2>
        <p className="small">
          Audio de tu dispositivo. Necesitas una voz japonesa instalada.
        </p>
        <div className="word-examples">
          {vocab.map((w) => (
            <div className="word-example" key={w.id}>
              <div>
                <span className="word-jp" lang="ja">
                  {w.jp}
                </span>
                {progress.romanization && <small>{w.reading}</small>}
                <strong>{w.es}</strong>
                <p>{w.note}</p>
              </div>
              <div className="audio-pair">
                <AudioButton text={w.jp} />
                <AudioButton text={w.jp} slow />
              </div>
            </div>
          ))}
        </div>
        <div className="lesson-action">
          <p>Cinco preguntas para conectar lo que acabas de aprender.</p>
          <button
            className="primary"
            onClick={() => {
              setPractice(true);
              window.scrollTo(0, 0);
            }}
          >
            Empezar la práctica <ArrowRight size={18} />
          </button>
        </div>
      </article>
    </>
  );
}
function Vocabulary({ progress }: { progress: Progress }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Todas");
  const available = words.filter(
    (w) => progress.reviews[w.id] || w.lesson === 0,
  );
  const filtered = available.filter(
    (w) =>
      (filter === "Todas" || w.category === filter) &&
      `${w.jp} ${w.es} ${w.reading}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        title="Palabras que se quedan"
        description="Tu biblioteca crece con cada lección. Las cinco vocales están abiertas desde el comienzo."
      />
      <div className="library-toolbar">
        <label className="search-label">
          <span className="sr-only">Buscar vocabulario</span>
          <input
            type="search"
            placeholder="Busca en español, japonés o rōmaji"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          <span className="sr-only">Categoría</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            {["Todas", ...new Set(available.map((w) => w.category))].map(
              (c) => (
                <option key={c}>{c}</option>
              ),
            )}
          </select>
        </label>
      </div>
      <p className="small">
        {filtered.length} entradas · {Object.keys(progress.reviews).length}{" "}
        incorporadas al repaso
      </p>
      <div className="vocabulary-list">
        {filtered.map((w) => (
          <div className="vocabulary-row" key={w.id}>
            <div>
              <span lang="ja">{w.jp}</span>
              {progress.romanization && <small>{w.reading}</small>}
            </div>
            <div>
              <strong>{w.es}</strong>
              <p>{w.note}</p>
            </div>
            <AudioButton text={w.jp} />
          </div>
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <h2>No encontramos esa palabra</h2>
          <p>Prueba otra escritura o cambia la categoría.</p>
          <button
            className="secondary"
            onClick={() => {
              setQuery("");
              setFilter("Todas");
            }}
          >
            Ver todas
          </button>
        </div>
      )}
    </>
  );
}
function ReviewScreen({
  progress,
  update,
}: {
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
}) {
  const [reveal, setReveal] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const due = words.filter((w) => progress.reviews[w.id]?.due <= dayKey());
  const word = due[0];
  return (
    <>
      <PageTitle
        title="Un poco de repaso"
        description="Recuerda antes de mirar. Espaciar las prácticas te ayuda a volver a lo aprendido."
      />
      {word ? (
        <section className="review-card">
          <div className="quiz-top">
            <span>{due.length} pendientes hoy</span>
            <span>{sessionCount} repasadas</span>
          </div>
          <span className="review-jp" lang="ja">
            {word.jp}
          </span>
          <AudioButton text={word.jp} />
          {reveal ? (
            <>
              <h2>{word.es}</h2>
              {progress.romanization && <p>{word.reading}</p>}
              <p>{word.note}</p>
              <div className="review-actions">
                <button
                  className="secondary"
                  onClick={() => {
                    update((p) => reviewWord(p, word.id, false));
                    setReveal(false);
                    setSessionCount((s) => s + 1);
                  }}
                >
                  Necesito repasarla
                </button>
                <button
                  className="primary"
                  onClick={() => {
                    update((p) => reviewWord(p, word.id, true));
                    setReveal(false);
                    setSessionCount((s) => s + 1);
                  }}
                >
                  La recordé <Check size={18} />
                </button>
              </div>
            </>
          ) : (
            <>
              <p>¿Qué sonido o significado recuerdas?</p>
              <button className="primary" onClick={() => setReveal(true)}>
                Mostrar respuesta
              </button>
            </>
          )}
        </section>
      ) : (
        <div className="empty-state">
          <span className="empty-kana" lang="ja">
            休
          </span>
          <h2>{sessionCount ? "Por hoy, lo tienes." : "Todo a su tiempo."}</h2>
          <p>
            {Object.keys(progress.reviews).length
              ? "No tienes palabras pendientes para hoy. Vuelve mañana o continúa una lección."
              : "Completa una lección para incorporar tus primeras palabras al repaso."}
          </p>
          <button className="primary" onClick={() => go("/aula")}>
            Volver a las lecciones <ArrowRight size={18} />
          </button>
        </div>
      )}
    </>
  );
}
function Exams({
  progress,
  update,
}: {
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
}) {
  const [mode, setMode] = useState<string | null>(null);
  const [answers, setAnswers] = useState(false);
  const completed = lessons.filter((l) => progress.completed[l.id]);
  const questions = completed.flatMap((l) => l.questions);
  const selected =
    mode === "semanal" ? questions.filter((_, i) => i % 2 === 0) : questions;
  const period =
    mode === "semanal"
      ? `${new Date().getFullYear()}-w${Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 604800000)}`
      : dayKey().slice(0, 7);
  return (
    <>
      <PageTitle
        title="Mira cuánto has aprendido"
        description="Evalúa únicamente el contenido que ya has completado. El resultado no equivale a un nivel oficial."
      />
      {mode && questions.length ? (
        <Quiz
          key={mode}
          title={`Evaluación ${mode}`}
          questions={selected}
          onExit={() => setMode(null)}
          onComplete={(score) =>
            update((p) => {
              const key = `${mode}:${period}`;
              const reward = p.exams[key] ? 0 : 50;
              return {
                ...p,
                studied: [...new Set([...p.studied, dayKey()])],
                exams: {
                  ...p.exams,
                  [key]: { score, total: selected.length, date: dayKey() },
                },
                activity: {
                  ...p.activity,
                  [dayKey()]: (p.activity[dayKey()] ?? 0) + reward,
                },
              };
            })
          }
        />
      ) : (
        <>
          <div className="exam-options">
            <section>
              <h2>Revisión semanal</h2>
              <p>
                Una selección breve de los conceptos de tus lecciones
                completadas.
              </p>
              <button
                className="primary"
                disabled={!questions.length}
                onClick={() => setMode("semanal")}
              >
                Comenzar revisión <ArrowRight size={16} />
              </button>
            </section>
            <section>
              <h2>Balance mensual</h2>
              <p>
                Reúne todo lo que has estudiado hasta ahora en una evaluación
                acumulativa.
              </p>
              <button
                className="secondary"
                disabled={!questions.length}
                onClick={() => setMode("mensual")}
              >
                Comenzar evaluación <ArrowRight size={16} />
              </button>
            </section>
          </div>
          {!questions.length && (
            <p className="feedback">
              Completa tu primera lección para habilitar las evaluaciones.
            </p>
          )}
          <section className="export-panel">
            <h2>También en papel</h2>
            <p>
              Genera una hoja de práctica con las preguntas de tus lecciones
              completadas. En la ventana de impresión, elige «Guardar como PDF».
            </p>
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
              disabled={!questions.length}
              onClick={() => window.print()}
            >
              <Printer size={17} /> Imprimir o guardar PDF
            </button>
          </section>
          {Object.entries(progress.exams).length > 0 && (
            <section>
              <h2>Tus resultados</h2>
              {Object.entries(progress.exams).map(([k, v]) => (
                <p key={k}>
                  {k.startsWith("semanal")
                    ? "Revisión semanal"
                    : "Balance mensual"}{" "}
                  · {v.date} · {v.score}%
                </p>
              ))}
            </section>
          )}
        </>
      )}
      <div className="print-sheet">
        <h1>Idiomas · Práctica de japonés</h1>
        <p>Fecha: {dayKey()} · Nombre: ____________________</p>
        {questions.map((q, i) => (
          <section key={i}>
            <h2>
              {i + 1}. {q.prompt}
            </h2>
            {q.jp && <p lang="ja">{q.jp}</p>}
            {q.options.map((o, j) => (
              <p key={o}>
                ○ {o}
                {answers && j === q.correct ? " (correcta)" : ""}
              </p>
            ))}
            {answers && <p>{q.explanation}</p>}
          </section>
        ))}
      </div>
    </>
  );
}
function Account({
  userEmail,
  notify,
}: {
  userEmail?: string;
  notify: (s: string) => void;
}) {
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setPending(true);
    setMessage("");
    try {
      const { error } = signup
        ? await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: location.origin },
          })
        : await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else if (signup)
        setMessage(
          "Revisa tu correo para confirmar la cuenta. Si ya existía, puedes iniciar sesión.",
        );
      else go("/aula");
    } catch {
      setMessage(
        "No se pudo conectar. Comprueba tu conexión e inténtalo otra vez.",
      );
    } finally {
      setPending(false);
    }
  };
  return (
    <>
      <PageTitle
        title={
          userEmail
            ? "Tu cuenta"
            : signup
              ? "Tu aprendizaje, contigo"
              : "Qué bueno verte"
        }
        description={
          userEmail
            ? "Accede a tu progreso desde tus dispositivos."
            : "Puedes explorar las lecciones sin registrarte."
        }
      />
      {userEmail ? (
        <section className="account-form">
          <p>{userEmail}</p>
          <p className="small">
            El progreso del modo local se mantiene separado del de tu cuenta.
          </p>
          <button
            className="secondary"
            onClick={async () => {
              const { error } = await supabase!.auth.signOut();
              if (error)
                notify("No se pudo cerrar sesión. Inténtalo de nuevo.");
              else go("/");
            }}
          >
            <LogOut size={17} /> Cerrar sesión
          </button>
        </section>
      ) : !supabase ? (
        <section className="account-form">
          <h2>Las cuentas aún no están activadas</h2>
          <p>
            Esta instalación funciona en modo local. Puedes aprender y guardar
            tu progreso en este navegador mientras se conecta Supabase.
          </p>
          <button className="primary" onClick={() => go("/aula")}>
            Entrar sin cuenta <ArrowRight size={18} />
          </button>
        </section>
      ) : (
        <form className="account-form" onSubmit={submit}>
          <label>
            Correo electrónico
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              required
              minLength={8}
              autoComplete={signup ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {signup && (
            <p className="small">
              Usa al menos 8 caracteres.{" "}
              <a href="#/privacidad">Consulta cómo se guardan tus datos.</a>
            </p>
          )}
          <button className="primary" disabled={pending}>
            {pending
              ? "Conectando…"
              : signup
                ? "Crear cuenta"
                : "Iniciar sesión"}
            <ArrowRight size={18} />
          </button>
          {message && <p role="status">{message}</p>}
          <button
            className="text-button"
            type="button"
            onClick={() => {
              setSignup(!signup);
              setMessage("");
            }}
          >
            {signup ? "Ya tengo cuenta" : "Quiero crear una cuenta"}
          </button>
        </form>
      )}
    </>
  );
}
function InfoPage({ credits }: { credits: boolean }) {
  return (
    <>
      <PageTitle
        title={credits ? "Hecho con cuidado" : "Tus datos, con claridad"}
        description={
          credits
            ? "Créditos y alcance de la versión piloto."
            : "Información de funcionamiento de esta instalación de desarrollo."
        }
      />
      <article className="legal-copy">
        {credits ? (
          <>
            <h2>Autoría</h2>
            <p>
              Proyecto de Marcos. Escena tridimensional y ejercicios originales
              creados para esta plataforma. El contenido piloto está pendiente
              de revisión lingüística externa.
            </p>
            <h2>Herramientas y tipografía</h2>
            <p>
              React, Vite, Three.js, Lucide y Supabase. Manrope y Noto Serif JP
              se distribuyen bajo SIL Open Font License; sus licencias acompañan
              los paquetes del proyecto.
            </p>
            <h2>Aprendizaje</h2>
            <p>
              La estructura toma como referencia objetivos comunicativos
              iniciales. No hay afiliación con The Japan Foundation ni
              certificación JLPT.
            </p>
            <p>
              <a
                href="https://www.irodori.jpf.go.jp/en/resources.html"
                target="_blank"
                rel="noreferrer"
              >
                Recursos de Irodori, The Japan Foundation{" "}
                <ArrowUpRight size={14} />
              </a>
            </p>
            <h2>Audio</h2>
            <p>
              Se utiliza la síntesis de voz disponible en el navegador, con voz
              japonesa. No son grabaciones revisadas por un docente y no se
              solicita el micrófono.
            </p>
          </>
        ) : (
          <>
            <h2>Modo local</h2>
            <p>
              Lecciones completadas, repasos, preferencias y resultados se
              guardan en el almacenamiento de este navegador. No se solicita
              nombre ni correo para probar el curso. Si borras los datos del
              sitio, se pierde ese progreso.
            </p>
            <h2>Cuenta y sincronización</h2>
            <p>
              Cuando se activa Supabase, el correo y la autenticación se
              gestionan allí, y el progreso se guarda asociado a la cuenta. No
              usamos el progreso local como progreso de una cuenta sin una
              importación expresa.
            </p>
            <h2>Audio y conexión</h2>
            <p>
              No se graba tu voz. Según el dispositivo, la síntesis de voz puede
              usar un servicio remoto del proveedor del navegador o del sistema.
            </p>
            <h2>Antes del lanzamiento público</h2>
            <p>
              Esta información describe el piloto; no sustituye la política
              legal final. Falta definir contacto del responsable, plazos de
              conservación, proceso de eliminación de cuenta y condiciones de
              uso antes de abrir el registro al público.
            </p>
          </>
        )}
      </article>
      <Footer />
    </>
  );
}
export default App;
