import { useState, useSyncExternalStore } from "react";
import { appUpdate, checkAppUpdate } from "../lib/pwa";
export default function AppUpdateNotice({
  safe,
  settings = false,
}: {
  safe: boolean;
  settings?: boolean;
}) {
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");
  const check = async () => {
    setChecking(true);
    const result = await checkAppUpdate();
    setMessage(
      result === "checked"
        ? "Comprobación terminada. Si hay una versión nueva, aparecerá aquí."
        : result === "offline"
          ? "Conéctate a Internet para buscar actualizaciones."
          : "No se pudo comprobar todavía. Vuelve a intentarlo en un momento.",
    );
    setChecking(false);
  };
  const state = useSyncExternalStore(appUpdate.subscribe, appUpdate.snapshot);
  if (settings)
    return (
      <section className="settings-section">
        <div>
          <h2>Actualizaciones</h2>
          <p>
            {state.available
              ? "Hay una versión nueva disponible."
              : "La aplicación comprueba las versiones nuevas al abrirla y al volver a conectarse."}{" "}
            Termina tu práctica antes de actualizar: se recargará la página.
          </p>
          {(state.error || message) && (
            <p role="status">{state.error || message}</p>
          )}
        </div>
        <button
          className="secondary"
          disabled={state.busy || checking}
          onClick={() =>
            state.available ? void appUpdate.apply(safe) : void check()
          }
        >
          {checking
            ? "Comprobando…"
            : state.busy
              ? "Actualizando…"
              : state.available
                ? "Actualizar aplicación"
                : "Buscar actualizaciones"}
        </button>
      </section>
    );
  if (!state.available || state.dismissed) return null;
  return (
    <section className="app-update" aria-label="Actualización disponible">
      <div role="status">
        <strong>Hay una nueva versión de Idiomas.</strong>
        <p>Termina tu práctica antes de actualizar. Se recargará la página.</p>
        {state.error && <p>{state.error}</p>}
      </div>
      <div className="app-update-actions">
        <button
          className="primary"
          disabled={state.busy || checking}
          onClick={() => void appUpdate.apply(safe)}
        >
          {state.busy ? "Actualizando…" : "Actualizar ahora"}
        </button>
        <button
          className="text-button"
          disabled={state.busy || checking}
          onClick={appUpdate.dismiss}
        >
          Más tarde
        </button>
      </div>
    </section>
  );
}
