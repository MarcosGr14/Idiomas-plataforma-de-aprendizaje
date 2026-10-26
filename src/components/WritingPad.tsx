import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Square } from "lucide-react";
import { hiraganaGlyphs } from "../data/writing";
import { InkBrush } from "./InkBrush";
import { checkStroke, type Point } from "../lib/writing";
import type { MotionMode } from "../lib/motion";
import { captureEnabled } from "../lib/capture";
type Character = keyof typeof hiraganaGlyphs;
const characters = Object.keys(hiraganaGlyphs) as Character[];
const feedback = {
  invalid: "Haz un trazo continuo siguiendo la guía.",
  start: "Empieza en el punto rojo del trazo indicado.",
  end: "Continúa hasta el final de la guía antes de levantar el dedo.",
  shape: "Acércate a la guía y sigue la dirección desde el punto rojo.",
};
export default function WritingPad({
  motion = "off",
}: {
  motion?: MotionMode;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const active = useRef<number | null>(null);
  const points = useRef<Point[]>([]);
  const [char, setChar] = useState<Character>("あ");
  const [accepted, setAccepted] = useState(0);
  const [message, setMessage] = useState("");
  const [playing, setPlaying] = useState(false);
  const [shown, setShown] = useState(0);
  const strokes = hiraganaGlyphs[char];
  const complete = accepted === strokes.length;
  const clearCanvas = () =>
    canvas.current?.getContext("2d")?.clearRect(0, 0, 436, 436);
  const reset = () => {
    active.current = null;
    points.current = [];
    clearCanvas();
    setAccepted(0);
    setMessage("");
    setShown(0);
    setPlaying(false);
  };
  useEffect(() => {
    if (!playing) return;
    if (motion !== "full" || captureEnabled) {
      setShown(strokes.length);
      setPlaying(false);
      return;
    }
    let frame = 0,
      start: number | undefined,
      previous = 0;
    const stop = () => {
      if (document.hidden) {
        setPlaying(false);
        cancelAnimationFrame(frame);
      }
    };
    const tick = (now: number) => {
      start ??= now;
      if (now - previous >= 32) {
        const progress = Math.min(strokes.length, (now - start) / 850);
        setShown(progress);
        previous = now;
        if (progress === strokes.length) {
          setPlaying(false);
          return;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    document.addEventListener("visibilitychange", stop);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", stop);
    };
  }, [playing, motion, strokes]);
  const point = (event: React.PointerEvent<HTMLCanvasElement>): Point => {
    const box = event.currentTarget.getBoundingClientRect();
    return [
      ((event.clientX - box.left) * 109) / box.width,
      ((event.clientY - box.top) * 109) / box.height,
    ];
  };
  const finish = (
    event: React.PointerEvent<HTMLCanvasElement>,
    cancelled = false,
  ) => {
    if (active.current !== event.pointerId) return;
    if (!cancelled) points.current.push(point(event));
    active.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    clearCanvas();
    if (cancelled) {
      points.current = [];
      return;
    }
    const result = checkStroke(points.current, strokes[accepted].points);
    points.current = [];
    if (result === "accepted") {
      const next = accepted + 1;
      setAccepted(next);
      setMessage(
        next === strokes.length
          ? "Carácter completado. Puedes repetirlo o elegir otro."
          : `Bien. Continúa con el trazo ${next + 1}.`,
      );
    } else setMessage(feedback[result]);
  };
  return (
    <section className="writing-panel">
      <div>
        <h2>Trazo a trazo</h2>
        <p>
          Observa el orden y sigue la guía desde el punto rojo. Levanta el dedo
          al terminar cada trazo.
        </p>
        <label htmlFor="kana">Hiragana</label>
        <select
          id="kana"
          value={char}
          lang="ja"
          onChange={(e) => {
            reset();
            setChar(e.target.value as Character);
          }}
        >
          {characters.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <div className="writing-actions">
          <button
            className="secondary"
            onClick={() => {
              reset();
              setPlaying(true);
            }}
          >
            <Play size={16} /> Ver trazos
          </button>
          {playing && (
            <button className="text-button" onClick={() => setPlaying(false)}>
              <Square size={16} /> Detener
            </button>
          )}
          <button className="text-button" onClick={reset}>
            <RotateCcw size={16} /> Repetir
          </button>
        </div>
        <p>
          Trazo {Math.min(accepted + 1, strokes.length)} de {strokes.length}
          {complete ? " · Completado" : ""}
        </p>
      </div>
      <div>
        <div className="writing-square guided-writing">
          <svg
            viewBox="0 0 109 109"
            role="img"
            aria-label={`Orden de escritura de ${char}: ${strokes.length} trazos`}
            lang="ja"
          >
            <path d="M54.5 0V109M0 54.5H109" className="writing-grid" />
            {strokes.map((stroke, i) => (
              <g key={i}>
                <path
                  d={stroke.d}
                  className={`stroke-guide ${i === accepted && !complete ? "current-stroke" : ""}`}
                />
                {i < accepted && (
                  <InkBrush
                    points={stroke.points}
                    width={3}
                    color="var(--ink)"
                    seed={i + 9}
                    dry={0.1}
                  />
                )}
                {shown > i && (
                  <InkBrush
                    points={stroke.points}
                    progress={Math.min(1, shown - i)}
                    width={3}
                    color="var(--red)"
                    seed={i + 9}
                    dry={0.1}
                  />
                )}
                <text
                  x={stroke.points[0][0] - 5}
                  y={stroke.points[0][1] - 5}
                  className="stroke-number"
                >
                  {i + 1}
                </text>
              </g>
            ))}
            {!complete && (
              <circle
                cx={strokes[accepted].points[0][0]}
                cy={strokes[accepted].points[0][1]}
                r="2"
                className="stroke-start"
              />
            )}
          </svg>
          <canvas
            ref={canvas}
            width={436}
            height={436}
            aria-label={`Área para trazar ${char}; comienza en el punto rojo`}
            onPointerDown={(event) => {
              if (
                active.current !== null ||
                playing ||
                complete ||
                event.button !== 0
              )
                return;
              setShown(0);
              setMessage("");
              active.current = event.pointerId;
              event.currentTarget.setPointerCapture(event.pointerId);
              const p = point(event);
              points.current = [p];
              const context = event.currentTarget.getContext("2d");
              if (!context) {
                active.current = null;
                return;
              }
              context.beginPath();
              context.moveTo(p[0] * 4, p[1] * 4);
              context.strokeStyle = getComputedStyle(event.currentTarget).color;
              context.lineWidth = 10;
              context.lineCap = "round";
              context.lineJoin = "round";
            }}
            onPointerMove={(event) => {
              if (
                active.current !== event.pointerId ||
                points.current.length >= 2047
              )
                return;
              const p = point(event),
                last = points.current.at(-1)!;
              if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 0.6) return;
              points.current.push(p);
              const context = event.currentTarget.getContext("2d");
              context?.lineTo(p[0] * 4, p[1] * 4);
              context?.stroke();
            }}
            onPointerUp={(event) => finish(event)}
            onPointerCancel={(event) => finish(event, true)}
            onLostPointerCapture={(event) => finish(event, true)}
          />
        </div>
        <p className="writing-status" role="status">
          {message ||
            (playing
              ? "Observa la dirección de cada trazo."
              : "Dibuja con el dedo o el cursor, o usa la demostración.")}
        </p>
      </div>
      <div className="writing-help">
        <p className="writing-note">
          Guía orientativa de orden, dirección y recorrido. No certifica
          caligrafía. Puedes estudiar los trazos numerados sin dibujar; esta
          práctica es opcional y no otorga XP.
        </p>
        <p className="writing-credit">
          Trazos de <a href="https://kanjivg.tagaini.net/">KanjiVG</a> ·{" "}
          <a href="/licenses/KanjiVG-CC-BY-SA-3.0.txt">CC BY-SA 3.0</a>
        </p>
      </div>
    </section>
  );
}
