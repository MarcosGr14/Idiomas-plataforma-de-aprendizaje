import { chromium } from "playwright";
import { mkdir, readFile, writeFile, cp, rm, access } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
const base = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(base, "..");
const url = process.env.PROMO_SITE || "http://localhost:5173";
const out = resolve(base, "public/captures");
const executablePath = process.env.CHROME_PATH || "/opt/brave.com/brave/brave";
const FPS = 30;
const only = process.env.PROMO_ONLY?.split(",");
await mkdir(out, { recursive: true });
await mkdir(resolve(base, ".cache"), { recursive: true });
await cp(resolve(root, "public/fonts"), resolve(base, "public/fonts"), {
  recursive: true,
});
await cp(
  resolve(
    root,
    "node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2",
  ),
  resolve(base, "public/fonts/manrope.woff2"),
);
await writeFile(
  resolve(base, "src/fontFaces.ts"),
  "export const fontFaces=" +
    JSON.stringify(await readFile(resolve(root, "src/fonts.css"), "utf8")) +
    ";\n",
);
const course = JSON.parse(
  await readFile(resolve(root, "content/japanese-pilot.json"), "utf8"),
);
const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: [
    "--no-sandbox",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--autoplay-policy=no-user-gesture-required",
  ],
});
const errors = [];
const contexts = [];
async function makePage(mobile) {
  const ctx = await browser.newContext({
    viewport: mobile
      ? { width: 390, height: 844 }
      : { width: 1440, height: 900 },
    deviceScaleFactor: mobile ? 2 : 1,
    timezoneId: "America/Panama",
    locale: "es-ES",
    reducedMotion: "no-preference",
  });
  contexts.push(ctx);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/*", (route) =>
    new URL(route.request().url()).origin === new URL(url).origin ||
    route.request().url().startsWith("data:")
      ? route.continue()
      : route.abort(),
  );
  return page;
}
const desktop = await makePage(false),
  mobile = await makePage(true);
async function visit(page, path = "/") {
  await page.goto(`${url}/?capture=1#${path}`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => !!window.__IDIOMAS_CAPTURE__);
  await page.evaluate(() => document.fonts.ready);
  if (path === "/")
    await page.waitForFunction(
      () => window.__IDIOMAS_CAPTURE__.rendererCount === 1,
      {},
      { timeout: 90000 },
    );
}
async function clock(page, time, opts = {}) {
  await page.evaluate(
    ({ time, ...rest }) => {
      window.__IDIOMAS_CAPTURE__.setFrame({ time, ...rest });
      for (const a of document.getAnimations()) {
        a.pause();
        a.currentTime = time * 1000;
      }
    },
    { time, ...opts },
  );
}
const smooth = (t) => t * t * (3 - 2 * t);
const hash = (b) => createHash("sha256").update(b).digest("hex");
await visit(desktop);
await clock(desktop, 2);
const first = await desktop.locator(".kyoto-canvas").screenshot();
await clock(desktop, 3);
const different = await desktop.locator(".kyoto-canvas").screenshot();
await clock(desktop, 2);
const repeat = await desktop.locator(".kyoto-canvas").screenshot();
if (hash(first) !== hash(repeat) || hash(first) === hash(different))
  throw new Error("Capture clock is not deterministic");
if ((await desktop.evaluate(() => localStorage.length)) !== 0)
  throw new Error("Capture wrote to localStorage");
await writeFile(
  resolve(base, "out/capture-verification.json"),
  JSON.stringify(
    {
      sameTimeIdentical: true,
      differentTimesDiffer: true,
      localStorageUntouched: true,
      date: "2026-10-23",
      demoXP: 200,
      demoStreak: 7,
    },
    null,
    2,
  ),
);
console.log("Verified deterministic clock and isolated storage");
async function clip(
  name,
  page,
  duration,
  path,
  setup = async () => {},
  step = async () => {},
  selector = null,
) {
  if (only && !only.includes(name)) return;
  const target = resolve(out, `${name}.mp4`);
  try {
    await access(target);
    if (!process.env.PROMO_RECAPTURE) {
      console.log(`Reuse ${name}`);
      return;
    }
  } catch {}
  await visit(page, path);
  await setup(page);
  const folder = resolve(base, ".cache", name);
  await mkdir(folder, { recursive: true });
  const n = Math.round(duration * FPS);
  console.log(`Capture ${name}: ${n} frames`);
  for (let frame = 0; frame < n; frame++) {
    const t = frame / FPS,
      p = frame / Math.max(1, n - 1);
    await step(page, frame, t, p);
    await clock(page, t, {
      pointerX: Math.sin(p * Math.PI * 2) * 0.65,
      pointerY: Math.sin(p * Math.PI) * 0.15,
      scroll: p * 0.65,
    });
    const shot = selector ? page.locator(selector) : page;
    const file = resolve(folder, `${String(frame).padStart(5, "0")}.png`);
    if (selector) {
      const data = await page
        .locator(selector + " canvas")
        .evaluate((c) => c.toDataURL("image/png"));
      await writeFile(file, Buffer.from(data.split(",")[1], "base64"));
    } else await shot.screenshot({ path: file, animations: "allow" });
    if (frame === Math.floor(n / 2))
      await cp(file, resolve(out, `${name}.png`));
    if (frame % 60 === 0) console.log(`${name} ${frame}/${n}`);
  }
  execFileSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-framerate",
      String(FPS),
      "-i",
      resolve(folder, "%05d.png"),
      "-c:v",
      "libx264",
      "-crf",
      "17",
      "-preset",
      "fast",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      target,
    ],
    { stdio: "inherit" },
  );
  await rm(folder, { recursive: true, force: true });
}
try {
  await clip(
    "hero-desktop",
    desktop,
    5,
    "/",
    async (p) => {},
    async () => {},
    ".kyoto-canvas",
  );
  await clip(
    "hero-mobile",
    mobile,
    5,
    "/",
    async (p) => {},
    async () => {},
    ".kyoto-canvas",
  );
  for (const [name, page] of [
    ["desktop", desktop],
    ["mobile", mobile],
  ]) {
    await clip(
      `home-${name}`,
      page,
      3,
      "/",
      async () => {},
      async (p, f, t, v) =>
        p.evaluate((y) => window.scrollTo(0, y), smooth(v) * 280),
    );
    await clip(
      `diagnostic-${name}`,
      page,
      3,
      "/diagnostico",
      async () => {},
      async (p, f) => {
        if (f === 25)
          await p.locator(".answer").nth(course.placement[0].correct).click();
        if (f === 45)
          await p
            .getByRole("button", { name: "Comprobar", exact: true })
            .click();
      },
    );
    await clip(
      `progress-${name}`,
      page,
      3,
      "/aula",
      async () => {},
      async () => {},
    );
    await clip(
      `library-${name}`,
      page,
      3,
      "/biblioteca",
      async () => {},
      async (p, f, t, v) =>
        p.evaluate((y) => window.scrollTo(0, y), smooth(v) * 220),
    );
  }
  await clip(
    "lesson-mobile",
    mobile,
    2,
    `/leccion/${course.lessons[3].id}`,
    async () => {},
    async (p, f, t, v) =>
      p.evaluate((y) => window.scrollTo(0, y), smooth(v) * 190),
  );
  let points, box;
  await clip(
    "writing-mobile",
    mobile,
    4,
    "/escritura",
    async (p) => {
      await p.locator("#kana").selectOption("い");
      await p.locator(".writing-square").scrollIntoViewIfNeeded();
      box = await p.locator(".writing-square canvas").boundingBox();
      points = [
        [
          [0.32, 0.22],
          [0.29, 0.35],
          [0.28, 0.5],
          [0.3, 0.65],
          [0.36, 0.72],
          [0.42, 0.62],
        ],
        [
          [0.62, 0.26],
          [0.67, 0.32],
          [0.71, 0.43],
          [0.73, 0.56],
        ],
      ];
    },
    async (p, f) => {
      const starts = [15, 65];
      for (let s = 0; s < 2; s++) {
        const j = f - starts[s];
        if (j < 0 || j > 35) continue;
        const line = points[s];
        const v = (j / 35) * (line.length - 1),
          a = Math.min(line.length - 2, Math.floor(v)),
          q = v - a;
        const x = line[a][0] * (1 - q) + line[a + 1][0] * q,
          y = line[a][1] * (1 - q) + line[a + 1][1] * q;
        await p.mouse.move(box.x + x * box.width, box.y + y * box.height);
        if (j === 0) await p.mouse.down();
        if (j === 35) await p.mouse.up();
      }
    },
  );
  await clip(
    "audio-mobile",
    mobile,
    2,
    `/leccion/${course.lessons[3].id}`,
    async (p) => {
      await p.locator(".word-example").first().scrollIntoViewIfNeeded();
    },
    async (p, f) => {
      if (f === 15)
        await p
          .getByRole("button", {
            name: `Escuchar: ${course.words.find((w) => w.lesson === 3).jp}`,
            exact: true,
          })
          .click();
    },
  );
  await clip(
    "modes-mobile",
    mobile,
    5,
    "/",
    async (p) => {
      await p.locator(".kyoto-controls").scrollIntoViewIfNeeded();
    },
    async (p, f) => {
      if (f === 50)
        await p
          .getByLabel("Calidad de la animación")
          .first()
          .selectOption("reduced");
      if (f === 100)
        await p
          .getByLabel("Calidad de la animación")
          .first()
          .selectOption("off");
    },
  );
  await visit(desktop);
  await clock(desktop, 2);
  await desktop.screenshot({ path: resolve(out, "home-still.png") });
  await visit(mobile, "/aula");
  await mobile.screenshot({ path: resolve(out, "mobile-still.png") });
  const storage = await desktop.evaluate(() => localStorage.length);
  if (storage !== 0) throw new Error("Unexpected storage mutation");
  if (errors.length) throw new Error(errors.join("\n"));
  await writeFile(
    resolve(out, "manifest.json"),
    JSON.stringify(
      {
        fps: FPS,
        desktop: { width: 1440, height: 900, scale: 1 },
        mobile: { width: 390, height: 844, scale: 2 },
        seed: "idiomas-demo-v1",
        date: "2026-10-23",
        capturedFrom: url,
        music: null,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
console.log("All captures complete");
