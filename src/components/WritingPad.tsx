import { useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
export default function WritingPad() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const active = useRef<number | null>(null);
  const [char, setChar] = useState("あ");
  const [drawn, setDrawn] = useState(false);
  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    return [
      ((e.clientX - box.left) * 400) / box.width,
      ((e.clientY - box.top) * 400) / box.height,
    ];
  };
  const clear = () => {
    canvas.current?.getContext("2d")?.clearRect(0, 0, 400, 400);
    setDrawn(false);
  };
  return (
    <section className="writing-panel">
      <div>
        <h2>Del ojo a la mano</h2>
        <p>
          Traza sobre el carácter para familiarizarte con su forma. Esta
          práctica libre no evalúa el orden ni la precisión de los trazos.
        </p>
        <label htmlFor="kana">Carácter</label>
        <select
          id="kana"
          value={char}
          onChange={(e) => {
            setChar(e.target.value);
            clear();
          }}
        >
          {"あいうえおかきくけこ".split("").map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button className="text-button" onClick={clear}>
          <RotateCcw size={16} /> Limpiar
        </button>
        <p className="small">
          También puedes estudiar la forma sin dibujar. Esta actividad no es
          obligatoria para avanzar.
        </p>
      </div>
      <div className="writing-square">
        <span lang="ja" aria-hidden="true">
          {char}
        </span>
        <canvas
          ref={canvas}
          width={400}
          height={400}
          aria-label={`Área de práctica libre para ${char}`}
          onPointerDown={(e) => {
            if (active.current !== null) return;
            active.current = e.pointerId;
            e.currentTarget.setPointerCapture(e.pointerId);
            const c = canvas.current!.getContext("2d")!;
            const [x, y] = point(e);
            c.beginPath();
            c.moveTo(x, y);
            c.strokeStyle = "#c62d27";
            c.lineWidth = 7;
            c.lineCap = "round";
            c.lineJoin = "round";
            setDrawn(true);
          }}
          onPointerMove={(e) => {
            if (active.current !== e.pointerId) return;
            const c = canvas.current!.getContext("2d")!;
            const [x, y] = point(e);
            c.lineTo(x, y);
            c.stroke();
          }}
          onPointerUp={() => (active.current = null)}
          onPointerCancel={() => (active.current = null)}
        />
        <p aria-live="polite">
          {drawn
            ? "Puedes limpiar y volver a intentarlo."
            : "Dibuja con el dedo o el cursor."}
        </p>
      </div>
    </section>
  );
}
