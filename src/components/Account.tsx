import { useRef, useState } from "react";
import { ArrowRight, LogOut } from "lucide-react";
import { supabase } from "../lib/supabase";
import { authError, authRedirect } from "../lib/auth";
import { authFeedback } from "../lib/authCallback";

type Mode = "signin" | "signup" | "reset" | "password";
export function Account({ userEmail }: { userEmail?: string }) {
  const [mode, setMode] = useState<Mode>(
    authFeedback.recovery ? "password" : "signin",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const [message, setMessage] = useState(authFeedback.message);
  const [failed, setFailed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const changeMode = (next: Mode) => {
    setMode(next);
    setPassword("");
    setConfirm("");
    setMessage("");
    setFailed(false);
  };
  const run = async (action: "submit" | "resend" | "logout") => {
    if (!supabase || busy.current) return;
    busy.current = true;
    setPending(true);
    setMessage("");
    setFailed(false);
    try {
      let error;
      if (action === "logout") {
        ({ error } = await supabase.auth.signOut({ scope: "local" }));
        if (!error) {
          authFeedback.recovery = false;
          authFeedback.message = "";
          changeMode("signin");
        }
      } else if (action === "resend") {
        ({ error } = await supabase.auth.resend({
          type: "signup",
          email: email.trim(),
          options: { emailRedirectTo: authRedirect(location.origin) },
        }));
        if (!error)
          setMessage(
            "Si la cuenta necesita confirmación, recibirás un enlace. Revisa también correo no deseado.",
          );
      } else if (mode === "reset") {
        ({ error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: authRedirect(location.origin, true),
        }));
        if (!error)
          setMessage(
            "Si existe una cuenta con ese correo, recibirás un enlace. Ábrelo en este mismo navegador para elegir otra contraseña.",
          );
      } else if (mode === "password") {
        if (password !== confirm) {
          setFailed(true);
          setMessage("Las contraseñas no coinciden.");
          return;
        }
        ({ error } = await supabase.auth.updateUser({ password }));
        if (!error) {
          authFeedback.recovery = false;
          authFeedback.message = "";
          changeMode("signin");
          setMessage("Contraseña actualizada.");
        }
      } else if (mode === "signup") {
        const result = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: authRedirect(location.origin) },
        });
        error = result.error;
        if (!error) {
          setPassword("");
          setMessage(
            result.data.session
              ? "Tu cuenta está lista."
              : "Revisa tu correo para confirmar la cuenta. Abre el enlace en este navegador. Si ya tenías cuenta, inicia sesión.",
          );
        }
      } else {
        ({ error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        }));
        if (!error) {
          setPassword("");
          window.location.hash = "/aula";
        }
      }
      if (error) {
        setFailed(true);
        setMessage(authError(error));
      }
    } catch {
      setFailed(true);
      setMessage(authError(null));
    } finally {
      busy.current = false;
      setPending(false);
    }
  };
  const title =
    mode === "password" && userEmail
      ? "Nueva contraseña"
      : userEmail
        ? "Tu cuenta"
        : mode === "reset"
          ? "Recupera tu cuenta"
          : mode === "signup"
            ? "Crea tu cuenta"
            : "Inicia sesión";
  return (
    <>
      <div className="page-title">
        <h1>{title}</h1>
        <p>
          {userEmail
            ? "Tu aprendizaje, guardado en tu cuenta."
            : "Continúa tu japonés desde tus dispositivos."}
        </p>
      </div>
      {!supabase ? (
        <section className="account-form">
          <h2>Las cuentas aún no están activadas</h2>
          <p>
            Puedes aprender y guardar tu progreso en este navegador mientras se
            conecta Supabase.
          </p>
          <a className="primary" href="#/aula">
            Entrar sin cuenta <ArrowRight size={18} />
          </a>
        </section>
      ) : (
        <form
          className="account-form"
          aria-busy={pending}
          onSubmit={(event) => {
            event.preventDefault();
            void run("submit");
          }}
        >
          {userEmail && mode !== "password" ? (
            <>
              <p className="account-email">{userEmail}</p>
              <p className="small">
                El progreso de invitado se mantiene separado del de tu cuenta.
                Cerrar sesión conserva los cambios pendientes en este navegador.
              </p>
              <button
                type="button"
                className="secondary"
                disabled={pending}
                onClick={() => changeMode("password")}
              >
                Cambiar contraseña
              </button>
              <button
                type="button"
                className="text-button"
                disabled={pending}
                onClick={() => void run("logout")}
              >
                <LogOut size={17} />{" "}
                {pending
                  ? "Cerrando sesión…"
                  : "Cerrar sesión en este dispositivo"}
              </button>
            </>
          ) : (
            <>
              {mode !== "password" && (
                <label>
                  Correo electrónico
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={email}
                    disabled={pending}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
              )}
              {mode !== "reset" && (
                <>
                  <label>
                    {mode === "password" ? "Nueva contraseña" : "Contraseña"}
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={mode === "signin" ? undefined : 8}
                      autoComplete={
                        mode === "signin" ? "current-password" : "new-password"
                      }
                      value={password}
                      disabled={pending}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    className="text-button"
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  </button>
                  {mode === "password" && (
                    <label>
                      Repite la contraseña
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        disabled={pending}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                      />
                    </label>
                  )}
                </>
              )}
              {(mode === "signup" || mode === "password") && (
                <p className="small">
                  Usa al menos 8 caracteres.{" "}
                  <a href="#/privacidad">Cómo se guardan tus datos.</a>
                </p>
              )}
              {mode === "signup" && (
                <p className="small">
                  Tu cuenta comienza con su propio progreso. El modo invitado se
                  conserva en este navegador.
                </p>
              )}
              <button
                className="primary"
                disabled={pending || (mode === "password" && !userEmail)}
              >
                {pending
                  ? "Conectando…"
                  : mode === "signup"
                    ? "Crear cuenta"
                    : mode === "reset"
                      ? "Enviar enlace de recuperación"
                      : mode === "password"
                        ? "Guardar contraseña"
                        : "Iniciar sesión"}
                <ArrowRight size={18} />
              </button>
            </>
          )}
          {message && <p role={failed ? "alert" : "status"}>{message}</p>}
          {!userEmail && (
            <div className="account-actions">
              <button
                type="button"
                className="text-button"
                disabled={pending}
                onClick={() =>
                  changeMode(
                    mode === "signup" || mode === "reset" || mode === "password"
                      ? "signin"
                      : "signup",
                  )
                }
              >
                {mode === "signin"
                  ? "Crear una cuenta"
                  : "Volver a iniciar sesión"}
              </button>
              {mode === "signin" && (
                <button
                  type="button"
                  className="text-button"
                  disabled={pending}
                  onClick={() => changeMode("reset")}
                >
                  Olvidé mi contraseña
                </button>
              )}
              {(mode === "signin" || mode === "signup") && (
                <button
                  type="button"
                  className="text-button"
                  disabled={pending}
                  onClick={(e) => {
                    const input =
                      e.currentTarget.form?.querySelector<HTMLInputElement>(
                        'input[type="email"]',
                      );
                    if (input?.reportValidity()) void run("resend");
                  }}
                >
                  Reenviar confirmación
                </button>
              )}
              <a href="#/aula">Seguir sin cuenta</a>
            </div>
          )}
          {userEmail && mode === "password" && (
            <button
              type="button"
              className="text-button"
              disabled={pending}
              onClick={() => {
                authFeedback.recovery = false;
                changeMode("signin");
              }}
            >
              Volver a mi cuenta
            </button>
          )}
        </form>
      )}
    </>
  );
}
