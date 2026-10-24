import { supabase } from "./supabase";
import { authError, callbackIntent } from "./auth";
export const authFeedback = { message: "", recovery: false };

/** Run before HashRouter: PKCE query parameters must never become app routes. */
export async function initializeAuth() {
  if (!supabase) return;
  const url = new URL(location.href);
  const intent = callbackIntent(url);
  if (!intent.code && !intent.error) return;
  try {
    if (intent.error) {
      authFeedback.message =
        "El enlace no es válido o ha vencido. Solicita uno nuevo.";
    } else {
      const { error } = await supabase.auth.exchangeCodeForSession(
        intent.code!,
      );
      authFeedback.message = error
        ? authError(error)
        : intent.recovery
          ? "Elige tu nueva contraseña."
          : "Correo confirmado. Tu cuenta está lista.";
      authFeedback.recovery = !error && intent.recovery;
    }
  } catch {
    authFeedback.message =
      "No se pudo verificar el enlace. Solicita uno nuevo desde tu cuenta.";
  } finally {
    for (const param of [
      "code",
      "auth",
      "error",
      "error_code",
      "error_description",
    ])
      url.searchParams.delete(param);
    url.hash = "/cuenta";
    history.replaceState(null, "", url);
  }
}
