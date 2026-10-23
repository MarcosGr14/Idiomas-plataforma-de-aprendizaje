import type { MotionMode } from "../lib/motion";
export default function MotionSelect({
  value,
  onChange,
  systemReduced = false,
}: {
  value: MotionMode;
  onChange: (value: MotionMode) => void;
  systemReduced?: boolean;
}) {
  return (
    <label className="motion-select">
      Animación{" "}
      <select
        aria-label="Calidad de la animación"
        value={value}
        disabled={systemReduced}
        onChange={(e) => onChange(e.target.value as MotionMode)}
      >
        <option value="full">Completa</option>
        <option value="reduced">Reducida</option>
        <option value="off">Apagada</option>
      </select>
      {systemReduced && (
        <span className="sr-only">
          Apagada por la preferencia de movimiento del sistema
        </span>
      )}
    </label>
  );
}
