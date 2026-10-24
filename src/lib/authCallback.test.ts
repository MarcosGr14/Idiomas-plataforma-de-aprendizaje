import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const { exchange } = vi.hoisted(() => ({ exchange: vi.fn() }));
vi.mock("./supabase", () => ({
  supabase: { auth: { exchangeCodeForSession: exchange } },
}));
import { initializeAuth, authFeedback } from "./authCallback";
const replace = vi.fn();
beforeEach(() => {
  exchange.mockReset();
  replace.mockReset();
  authFeedback.message = "";
  authFeedback.recovery = false;
  vi.stubGlobal("history", { replaceState: replace });
});
afterEach(() => vi.unstubAllGlobals());
describe("auth callback bootstrap", () => {
  it("exchanges a code before routing and cleans the URL", async () => {
    vi.stubGlobal("location", {
      href: "https://idiomas.example/?code=private-code&auth=recovery",
    });
    exchange.mockResolvedValue({ error: null });
    await initializeAuth();
    expect(exchange).toHaveBeenCalledWith("private-code");
    expect(authFeedback.recovery).toBe(true);
    expect(String(replace.mock.calls[0][2])).toBe(
      "https://idiomas.example/#/cuenta",
    );
  });
  it("cleans expired fragment links and never displays provider descriptions", async () => {
    vi.stubGlobal("location", {
      href: "https://idiomas.example/#error=access_denied&error_description=private",
    });
    await initializeAuth();
    expect(exchange).not.toHaveBeenCalled();
    expect(authFeedback.message).toContain("vencido");
    expect(authFeedback.message).not.toContain("private");
    expect(String(replace.mock.calls[0][2])).toBe(
      "https://idiomas.example/#/cuenta",
    );
  });
  it("shows actionable feedback if verification fails instead of enabling password update", async () => {
    vi.stubGlobal("location", {
      href: "https://idiomas.example/?code=bad&auth=recovery",
    });
    exchange.mockResolvedValue({ error: { code: "bad_code_verifier" } });
    await initializeAuth();
    expect(authFeedback.recovery).toBe(false);
    expect(authFeedback.message).toContain("otro navegador");
  });
});
