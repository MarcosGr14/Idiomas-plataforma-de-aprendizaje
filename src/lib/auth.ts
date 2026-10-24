/** Safe UI messages: never print raw provider responses or callback tokens. */
export function authError(error: { code?: string } | null | undefined): string {
  switch (error?.code) {
    case "invalid_credentials":
      return "El correo o la contraseña no son correctos.";
    case "email_not_confirmed":
      return "Confirma tu correo antes de entrar. Puedes reenviar el enlace aquí.";
    case "weak_password":
      return "Elige una contraseña más segura, con al menos 8 caracteres.";
    case "same_password":
      return "Usa una contraseña diferente a la anterior.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Se han hecho varios intentos. Espera unos minutos y vuelve a probar.";
    case "otp_expired":
    case "flow_state_expired":
    case "flow_state_not_found":
    case "bad_code_verifier":
      return "El enlace venció o se abrió en otro navegador. Solicita uno nuevo y ábrelo donde lo pediste.";
    default:
      return "No se pudo completar. Comprueba tu conexión e inténtalo otra vez.";
  }
}
export function authRedirect(origin: string, recovery = false): string {
  const url = new URL(origin);
  url.search = recovery ? "?auth=recovery" : "?auth=confirm";
  url.hash = "";
  return url.href;
}
export function callbackIntent(url: URL) {
  return {
    code: url.searchParams.get("code"),
    recovery: url.searchParams.get("auth") === "recovery",
    error:
      url.searchParams.has("error") ||
      new URLSearchParams(url.hash.slice(1)).has("error"),
  };
}
