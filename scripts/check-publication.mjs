import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const publicDocs = new Set([
  "docs/README.md",
  "docs/DEVELOPMENT.md",
  "docs/THIRD_PARTY_NOTICES.md",
]);
const privateNames = new Set([
  "AGENTS.md",
  "PRODUCT.md",
  "DESIGN.md",
  "promo/DESIGN.md",
  "promo/STORYBOARD.md",
]);
export function privatePath(path) {
  const value = path.replaceAll("\\", "/");
  if (value === ".env.example") return false;
  return (
    privateNames.has(value) ||
    /(^|\/)(?:\.env(?:\.[^/]+)?|\.codex[^/]*|\.impeccable|\.taste-skill|\.agents|\.venv|node_modules|dist|\.wrangler|\.supabase)(?:\/|$)/.test(
      value,
    ) ||
    /\.(?:pem|key|p12|pfx|sqlite3?|db|dump|bak|log|map)$/i.test(value) ||
    (/^docs\//.test(value) && !publicDocs.has(value)) ||
    /^public\/images\/.*\.webp\.json$/.test(value) ||
    /^promo\/(?:out|\.bundle|\.cache|public\/(?:captures|fonts|audio))\//.test(
      value,
    )
  );
}
export function containsCredential(text) {
  if (
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]{40,}-----END/.test(
      text,
    ) ||
    /\b(?:sb_secret_[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk_live_[A-Za-z0-9]{16,})/.test(
      text,
    ) ||
    /postgres(?:ql)?:\/\/[^\s:@]+:[^\s@]+@/.test(text)
  )
    return true;
  for (const token of text.matchAll(
    /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
  )) {
    try {
      const payload = JSON.parse(
        Buffer.from(token[0].split(".")[1], "base64url").toString(),
      );
      if (payload.role === "service_role") return true;
    } catch {
      /* Not a JWT; never print a candidate credential. */
    }
  }
  return false;
}
function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}
export function checkPublication(root = process.cwd()) {
  const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: root })
    .toString()
    .split("\0")
    .filter(Boolean);
  const issues = [];
  const inspect = (path, label) => {
    if (
      /\.(?:[cm]?[jt]sx?|jsonc?|md|sql|html|css|svg|ya?ml|toml)$/.test(path) ||
      /(^|\/)\.env/.test(path)
    ) {
      if (statSync(resolve(root, path)).size > 2000000) {
        issues.push(`${label}: text file too large for the publication check`);
        return;
      }
      if (containsCredential(readFileSync(resolve(root, path), "utf8")))
        issues.push(`${label}: credential pattern detected`);
    }
  };
  for (const path of tracked) {
    if (privatePath(path))
      issues.push(`${path}: internal or sensitive path is tracked`);
    inspect(path, path);
  }
  const dist = resolve(root, "dist");
  for (const file of walk(dist)) {
    const path = relative(dist, file).split(sep).join("/");
    if (
      privatePath(path) ||
      /(^|\/)(?:src|content|supabase|scripts|promo|docs)\//.test(path) ||
      /(?:\.webp\.json|\.md)$/.test(path)
    )
      issues.push(`dist/${path}: unexpected public artifact`);
    inspect(relative(root, file), `dist/${path}`);
  }
  return issues;
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const issues = checkPublication();
    if (issues.length) {
      console.error(issues.join("\n"));
      process.exitCode = 1;
    } else
      console.log(
        "Publication check passed: no blocked tracked paths or common credential patterns in source/build.",
      );
  } catch {
    console.error(
      "Publication check could not run. Build dist/ first and run from the Git repository root.",
    );
    process.exitCode = 1;
  }
}
