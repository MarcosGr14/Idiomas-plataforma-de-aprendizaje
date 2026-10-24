import { describe, it, expect } from "vitest";
import { authError, authRedirect, callbackIntent } from "./auth";
describe("auth links and messages", () => {
  it("uses query callbacks without conflicting with HashRouter", () => {
    expect(authRedirect("https://idiomas.example", true)).toBe(
      "https://idiomas.example/?auth=recovery",
    );
    expect(
      callbackIntent(
        new URL("https://idiomas.example/?auth=recovery&code=example"),
      ),
    ).toEqual({ code: "example", recovery: true, error: false });
    expect(
      callbackIntent(new URL("https://idiomas.example/#/cuenta")).code,
    ).toBeNull();
  });
  it("recognizes expired callbacks without rendering their raw descriptions", () => {
    expect(
      callbackIntent(
        new URL(
          "https://idiomas.example/?error=access_denied&error_description=private",
        ),
      ).error,
    ).toBe(true);
    expect(authError({ code: "invalid_credentials" })).toContain(
      "correo o la contraseña",
    );
    expect(authError({ code: "email_not_confirmed" })).toContain("Confirma");
    expect(authError({ code: "bad_code_verifier" })).toContain(
      "otro navegador",
    );
    expect(authError({ code: "private server failure" })).not.toContain(
      "private",
    );
  });
});
it("accepts Supabase errors in the URL fragment", () => {
  expect(
    callbackIntent(
      new URL(
        "https://idiomas.example/#error=access_denied&error_code=otp_expired",
      ),
    ).error,
  ).toBe(true);
});
