import { it, expect } from "vitest";
import { privatePath, containsCredential } from "./check-publication.mjs";
it("blocks local context, credentials, media caches and source maps", () => {
  for (const path of [
    ".env.local",
    ".env",
    "AGENTS.md",
    ".codex/hooks.json",
    ".codex-project-reporter.json",
    "docs/validation.md",
    "docs/referencias/photo.png",
    "public/images/hero.webp.json",
    "promo/out/video.mp4",
    "promo/public/captures/frame.png",
    "backup.pem",
    "dump.sqlite",
    "assets/main.js.map",
  ])
    expect(privatePath(path), path).toBe(true);
});
it("keeps required code, migrations, licenses and blank configuration templates public", () => {
  for (const path of [
    ".env.example",
    ".github/workflows/quality.yml",
    "src/App.tsx",
    "supabase/migrations/202610240002_progress_least_privilege.sql",
    "docs/DEVELOPMENT.md",
    "docs/THIRD_PARTY_NOTICES.md",
    "public/licenses/KanjiVG-CC-BY-SA-3.0.txt",
    "promo/README.md",
  ])
    expect(privatePath(path), path).toBe(false);
});
it("detects privileged credentials without treating public keys as secrets", () => {
  const jwt = (role) =>
    "eyJhbGciOiJIUzI1NiJ9." +
    Buffer.from(JSON.stringify({ role })).toString("base64url") +
    ".signature";
  expect(containsCredential(jwt("service_role"))).toBe(true);
  expect(containsCredential(jwt("anon"))).toBe(false);
  expect(containsCredential("sb_secret_" + "a".repeat(25))).toBe(true);
  expect(containsCredential("sb_publishable_" + "a".repeat(25))).toBe(false);
  expect(
    containsCredential("postgres" + "://user:password@host/database"),
  ).toBe(true);
  expect(
    containsCredential(
      "-----BEGIN PRIVATE " +
        "KEY-----\n" +
        "a".repeat(64) +
        "\n-----END PRIVATE KEY-----",
    ),
  ).toBe(true);
  expect(
    containsCredential("service_role must never be used in the browser."),
  ).toBe(false);
});
