import { lazy, Suspense, useState } from "react";
import { ArrowRight, Pause, Play, X } from "lucide-react";
import type { MotionMode } from "../lib/motion";
import { signs } from "../data/street-signs";
import MotionSelect from "./MotionSelect";
const Street = lazy(() => import("./Street"));
export default function KyotoHero({
  mode,
  onChange,
  systemReduced,
  notify,
}: {
  mode: MotionMode;
  onChange: (mode: MotionMode) => void;
  systemReduced: boolean;
  notify: (message: string) => void;
}) {
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [automatic, setAutomatic] = useState("");
  const choose = (n: number) => {
    setSelected(n);
    setOpen(true);
  };
  const sign = signs[selected ?? 0];
  const change = (next: MotionMode) => {
    setAutomatic("");
    setPaused(false);
    onChange(next);
  };
  return (
    <section className="kyoto-hero" aria-labelledby="kyoto-title">
      <picture className="kyoto-poster">
        <source media="(max-width: 699px)" srcSet="/images/kyoto-mobile.webp" />
        <img
          src="/images/kyoto-desktop.webp"
          alt=""
          fetchPriority="high"
          width="1440"
          height="800"
        />
      </picture>
      {mode !== "off" && (
        <Suspense fallback={null}>
          <Street
            mode={mode}
            paused={paused}
            selected={selected}
            onSelect={choose}
            onDegrade={(next) => {
              setAutomatic(
                next === "off"
                  ? "Escena estática para cuidar el rendimiento."
                  : "Calidad reducida para cuidar el rendimiento.",
              );
              onChange(next);
              notify(
                next === "off"
                  ? "La escena pasó a imagen estática. Puedes cambiarlo en Animación."
                  : "La escena redujo su calidad para mantener la fluidez.",
              );
            }}
          />
        </Suspense>
      )}
      <div className="kyoto-shade" aria-hidden="true" />
      <div className="kyoto-copy">
        <h1 id="kyoto-title">
          Tu viaje empieza
          <br />
          en japonés.
        </h1>
        <p>
          De tu primer <span lang="ja">こんにちは</span> a entender un mundo
          nuevo. Un pequeño paso cada día.
        </p>
        <a className="primary" href="#/diagnostico">
          Hacer examen de nivel <ArrowRight size={19} />
        </a>
        <span className="kyoto-note">
          A tu ritmo. Desde cero. Sin registro para probar.
        </span>
      </div>
      <div className="kyoto-controls">
        <button
          className="kyoto-sign-trigger"
          aria-expanded={open}
          aria-controls="street-signs"
          onClick={() => {
            setSelected(selected ?? 0);
            setOpen(!open);
          }}
        >
          <span lang="ja">本屋</span>
          <span>¿Qué dice este letrero?</span>
        </button>
        <div className="kyoto-motion">
          <button
            className="motion-button"
            disabled={mode === "off"}
            aria-pressed={paused || mode === "off"}
            onClick={() => setPaused(!paused)}
          >
            {paused || mode === "off" ? (
              <Play size={15} />
            ) : (
              <Pause size={15} />
            )}{" "}
            {mode === "off"
              ? "Escena estática"
              : paused
                ? "Reanudar movimiento"
                : "Pausar movimiento"}
          </button>
          <MotionSelect
            value={mode}
            onChange={change}
            systemReduced={systemReduced}
          />
        </div>
      </div>
      {automatic && (
        <p className="kyoto-performance" role="status">
          {automatic}
        </p>
      )}
      {open && (
        <div
          className="kyoto-sign-card"
          id="street-signs"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              document
                .querySelector<HTMLButtonElement>(".kyoto-sign-trigger")
                ?.focus();
            }
          }}
        >
          <div className="sign-card-heading">
            <h2>Lee la calle</h2>
            <button aria-label="Cerrar letreros" onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>
          <div className="sign-options" aria-label="Letreros de la calle">
            {signs.map((s, i) => (
              <button
                key={s.text}
                lang={s.lang}
                aria-pressed={(selected ?? 0) === i}
                onClick={() => choose(i)}
              >
                {s.text}
              </button>
            ))}
          </div>
          <div className="sign-definition" aria-live="polite">
            <span lang={sign.lang}>{sign.text}</span>
            <div>
              <p>{sign.reading}</p>
              <strong>{sign.meaning}</strong>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
