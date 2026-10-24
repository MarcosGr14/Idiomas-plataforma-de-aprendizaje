import { useRef, useState } from "react";
import { ArrowRight, LogOut, Eye, EyeOff } from "lucide-react";
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
    <section className="auth-shell" aria-labelledby="account-title">
      <header className="auth-heading">
        <h1 id="account-title">{title}</h1>
        <p>
          {userEmail
            ? "Gestiona tu acceso y continúa aprendiendo."
            : mode === "reset"
              ? "Te enviaremos un enlace para recuperar el acceso."
              : mode === "signup"
                ? "Guarda tu progreso y aprende a tu ritmo."
                : "Retoma tu japonés donde lo dejaste."}
        </p>
      </header>
      {!supabase ? (
        <div className="account-form">
          <p>Las cuentas aún no están activadas en esta instalación.</p>
          <a className="primary" href="#/aula">
            Entrar sin cuenta <ArrowRight size={18} />
          </a>
        </div>
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
              <div className="account-identity">
                <span>Sesión iniciada como</span>
                <p className="account-email">{userEmail}</p>
              </div>
              <a className="primary" href="#/aula">
                Volver a mi recorrido <ArrowRight size={18} />
              </a>
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
                className="secondary account-logout"
                disabled={pending}
                onClick={() => void run("logout")}
              >
                <LogOut size={18} />
                {pending ? "Cerrando sesión…" : "Cerrar sesión"}
              </button>
              <p className="auth-help">
                Se cerrará solo en este dispositivo. Los cambios pendientes se
                conservan en este navegador.
              </p>
            </>
          ) : (
            <>
              {mode !== "password" && (
                <label htmlFor="account-email">
                  Correo electrónico
                  <input
                    id="account-email"
                    type="email"
                    required
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="tu@correo.com"
                    value={email}
                    disabled={pending}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
              )}
              {mode !== "reset" && (
                <div className="auth-password-group">
                  <label htmlFor="account-password">
                    {mode === "password" ? "Nueva contraseña" : "Contraseña"}
                  </label>
                  <div className="auth-password">
                    <input
                      id="account-password"
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
                    <button
                      type="button"
                      aria-label={
                        showPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>
                  {mode === "signin" ? (
                    <button
                      type="button"
                      className="auth-link auth-forgot"
                      disabled={pending}
                      onClick={() => changeMode("reset")}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  ) : (
                    <p className="auth-help">Al menos 8 caracteres.</p>
                  )}
                  {mode === "password" && (
                    <label htmlFor="account-confirm">
                      Repite la contraseña
                      <input
                        id="account-confirm"
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
                </div>
              )}
              {message && (
                <p className="auth-message" role={failed ? "alert" : "status"}>
                  {message}
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
                      ? "Enviar enlace"
                      : mode === "password"
                        ? "Guardar contraseña"
                        : "Iniciar sesión"}
                <ArrowRight size={18} />
              </button>
              {mode === "signup" && (
                <p className="auth-help">
                  Tu cuenta tendrá su propio progreso; el de invitado se
                  conserva aquí.{" "}
                  <a href="#/privacidad">Consulta la privacidad.</a>
                </p>
              )}
            </>
          )}
          {userEmail && mode !== "password" && message && (
            <p className="auth-message" role={failed ? "alert" : "status"}>
              {message}
            </p>
          )}
          {!userEmail && (
            <div className="auth-secondary">
              <p>
                {mode === "signin"
                  ? "¿Aún no tienes cuenta?"
                  : mode === "signup"
                    ? "¿Ya tienes cuenta?"
                    : "¿Recordaste tu contraseña?"}{" "}
                <button
                  type="button"
                  className="auth-link"
                  disabled={pending}
                  onClick={() =>
                    changeMode(mode === "signin" ? "signup" : "signin")
                  }
                >
                  {mode === "signin" ? "Crear cuenta" : "Iniciar sesión"}
                </button>
              </p>
              {(mode === "signin" || mode === "signup") && (
                <details className="auth-confirmation">
                  <summary>¿No recibiste la confirmación?</summary>
                  <p className="auth-help">
                    Escribe tu correo arriba y revisa también la carpeta de
                    correo no deseado.
                  </p>
                  <button
                    type="button"
                    className="auth-link"
                    disabled={pending}
                    onClick={(e) => {
                      const input =
                        e.currentTarget.form?.querySelector<HTMLInputElement>(
                          'input[type="email"]',
                        );
                      if (input?.reportValidity()) void run("resend");
                    }}
                  >
                    Reenviar enlace
                  </button>
                </details>
              )}
              <a className="auth-guest" href="#/aula">
                Continuar sin cuenta <ArrowRight size={16} />
              </a>
            </div>
          )}
          {userEmail && mode === "password" && (
            <button
              type="button"
              className="auth-link"
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
    </section>
  );
}
