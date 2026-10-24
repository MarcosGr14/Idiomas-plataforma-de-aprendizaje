import { motion } from "../../src/design/tokens.ts";
import { browserPath } from "./browser.mjs";
import { bundle } from "@remotion/bundler";
import {
  selectComposition,
  renderMedia,
  renderStill,
} from "@remotion/renderer";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, writeFile, access, rename } from "node:fs/promises";
import { execFileSync } from "node:child_process";
const base = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const mode = process.argv[2] || "preview";
const browserExecutable = await browserPath();
const out = resolve(base, "out");
await mkdir(out, { recursive: true });
const serveUrl = await bundle({
  entryPoint: resolve(base, "src/index.tsx"),
  publicDir: resolve(base, "public"),
  outDir: resolve(base, ".bundle"),
});
const inputProps = { publicUrl: process.env.PROMO_URL || "" };
const common = {
  serveUrl,
  browserExecutable,
  inputProps,
  chromiumOptions: { gl: process.env.PROMO_GL || "angle" },
  timeoutInMilliseconds: 120000,
  onBrowserLog: (log) => {
    if (log.type === "error") console.error(log.text);
  },
};
const selected = process.env.PROMO_SCENES?.split(",").map(Number);
const durations = motion.sceneDurations;
const exists = async (p) => {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
};
async function video(id, file, frameRange, scale = 1) {
  if ((await exists(file)) && !process.env.PROMO_RERENDER) {
    console.log(`Reuse ${file}`);
    return;
  }
  const composition = await selectComposition({ ...common, id });
  let last = -1;
  await renderMedia({
    ...common,
    composition,
    codec: "h264",
    muted: true,
    outputLocation: file + ".part.mp4",
    frameRange,
    scale,
    concurrency: mode === "preview" ? 4 : 2,
    offthreadVideoThreads: 2,
    crf: mode === "preview" ? 25 : 18,
    x264Preset: mode === "preview" ? "veryfast" : "fast",
    onProgress: ({ progress }) => {
      const p = Math.floor(progress * 10);
      if (p !== last) {
        last = p;
        console.log(`${id} ${frameRange?.[0] || 0}: ${p * 10}%`);
      }
    },
  });
  await rename(file + ".part.mp4", file);
}
if (mode === "preview") {
  const dir = resolve(out, "previews");
  await mkdir(dir, { recursive: true });
  for (const orientation of ["Landscape", "Vertical"]) {
    let from = 0;
    const clips = [];
    for (let i = 0; i < durations.length; i++) {
      if (selected && !selected.includes(i + 1)) {
        from += durations[i];
        continue;
      }
      const file = resolve(dir, `${orientation.toLowerCase()}-${i + 1}.mp4`);
      await video(`Preview${orientation}`, file, [
        from,
        from + durations[i] - 1,
      ]);
      clips.push(file);
      from += durations[i];
    }
    if (selected) continue;
    const list = resolve(base, ".cache", `${orientation}.txt`);
    await writeFile(
      list,
      clips
        .map(
          (p, i) =>
            `file '${p.replaceAll("'", "'\\''")}'\nduration ${durations[i] / motion.fps}`,
        )
        .join("\n"),
    );
    execFileSync("ffmpeg", [
      "-v",
      "error",
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      list,
      "-an",
      "-c:v",
      "copy",
      "-movflags",
      "+faststart",
      resolve(
        out,
        `promo-preview-${orientation === "Landscape" ? "16x9" : "9x16"}-480p.mp4`,
      ),
    ]);
  }
} else if (mode === "qhd") {
  const dir = resolve(out, "qhd-scenes");
  await mkdir(dir, { recursive: true });
  let from = 0;
  const clips = [];
  for (let i = 0; i < durations.length; i++) {
    const file = resolve(dir, `scene-${i + 1}.mp4`);
    await video("PromoLandscape", file, [from, from + durations[i] - 1], 4 / 3);
    clips.push(
      `file '${file.replaceAll("'", "'\\''")}'\nduration ${durations[i] / motion.fps}`,
    );
    from += durations[i];
  }
  const list = resolve(dir, "concat.txt");
  await writeFile(list, clips.join("\n"));
  execFileSync("ffmpeg", [
    "-v",
    "error",
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    list,
    "-an",
    "-c:v",
    "copy",
    "-movflags",
    "+faststart",
    resolve(out, "promo-16x9-1440p.mp4"),
  ]);
} else if (mode === "final") {
  await video("PromoLandscape", resolve(out, "promo-16x9-1080p.mp4"));
  await video("PromoVertical", resolve(out, "promo-9x16.mp4"));
  if (process.argv.includes("--4k"))
    await video(
      "PromoLandscape",
      resolve(out, "promo-16x9-4k.mp4"),
      undefined,
      2,
    );
} else if (mode !== "stills") {
  throw new Error("Use preview, qhd, final or stills");
}
if (!selected && mode !== "qhd")
  for (const orientation of ["Landscape", "Vertical"]) {
    const composition = await selectComposition({
      ...common,
      id: `Promo${orientation}`,
    });
    const frames =
      mode === "stills"
        ? process.env.PROMO_FRAMES?.split(",").map(Number) || [
            80, 210, 390, 570, 780, 960, 1130,
          ]
        : [1130];
    for (let i = 0; i < frames.length; i++)
      await renderStill({
        ...common,
        composition,
        frame: frames[i],
        output: resolve(
          out,
          mode === "stills"
            ? `${orientation.toLowerCase()}-${process.env.PROMO_FRAMES ? `frame-${frames[i]}` : i + 1}.png`
            : orientation === "Landscape"
              ? "poster.png"
              : "poster-vertical.png",
        ),
      });
  }
console.log(`Completed ${mode}`);
