import { spawn } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const base = resolve(dirname(fileURLToPath(import.meta.url)), ".."),
  root = resolve(base, "..");
const url = process.env.PROMO_SITE || "http://localhost:5173";
let server;
const run = (file, args) =>
  new Promise((resolve, reject) => {
    const p = spawn(file, args, {
      cwd: root,
      stdio: "inherit",
      env: process.env,
    });
    p.on("exit", (c) =>
      c === 0 ? resolve() : reject(new Error(`${file} exited ${c}`)),
    );
    p.on("error", reject);
  });
async function alive() {
  try {
    return (await fetch(url)).ok;
  } catch {
    return false;
  }
}
try {
  if (!(await alive())) {
    server = spawn(
      "npm",
      ["run", "dev", "--", "--port", "5173", "--strictPort"],
      { cwd: root, stdio: "inherit" },
    );
    for (let i = 0; i < 60 && !(await alive()); i++)
      await new Promise((r) => setTimeout(r, 500));
    if (!(await alive())) throw new Error("Vite did not start");
  }
  await run(process.execPath, [resolve(base, "scripts/capture.mjs")]);
  await run(process.execPath, [resolve(base, "scripts/render.mjs"), "preview"]);
  // Run previews alone for editorial changes; all reproduces the approved master.
  await run(process.execPath, [
    resolve(base, "scripts/render.mjs"),
    "final",
    ...process.argv.slice(2),
  ]);
} finally {
  server?.kill("SIGTERM");
}
