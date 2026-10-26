import fs from "node:fs";
import path from "node:path";
import { format } from "prettier";

const files = fs
  .readdirSync("src", { recursive: true })
  .filter(
    (file) =>
      /\.(tsx|ts)$/.test(file) &&
      !/\.test\./.test(file) &&
      file !== "design/fonts.ts",
  );
const content = fs
  .readdirSync("content")
  .filter((file) => file.endsWith(".json"));
const text =
  files
    .map((file) => fs.readFileSync(path.join("src", file), "utf8"))
    .join("") +
  content
    .map((file) => fs.readFileSync(path.join("content", file), "utf8"))
    .join("");
const points = new Set([...text].map((char) => char.codePointAt(0)));
const source = "node_modules/@fontsource/noto-serif-jp";
const used = new Set();
let output =
  "/* Local OFL subsets selected from production code and course JSON. */\n";
for (const weight of [400, 600]) {
  const css = fs.readFileSync(`${source}/${weight}.css`, "utf8");
  for (const [block] of css.matchAll(/@font-face\s*\{[^}]+\}/g)) {
    const range = block.match(/unicode-range:\s*([^;]+)/)?.[1];
    if (!range) continue;
    const intervals = range.split(",").map((value) =>
      value
        .trim()
        .replace("U+", "")
        .split("-")
        .map((n) => parseInt(n, 16)),
    );
    if (
      !intervals.some(([lo, hi = lo]) =>
        [...points].some((n) => n >= lo && n <= hi),
      )
    )
      continue;
    const font = block.match(/\.\/files\/([^')]+\.woff2)/)?.[1];
    if (!font) continue;
    used.add(font);
    fs.copyFileSync(`${source}/files/${font}`, `public/fonts/${font}`);
    output +=
      block.replace(
        /src:[\s\S]*?;/,
        `src: url('/fonts/${font}') format('woff2');`,
      ) + "\n";
  }
}
const module = `/* Generated from local OFL subsets; shared by app and promo. Run npm run fonts. */\nexport const notoFaces = ${JSON.stringify(output)};\n`;
fs.writeFileSync(
  "src/design/fonts.ts",
  await format(module, { parser: "typescript" }),
);
for (const file of fs.readdirSync("public/fonts")) {
  if (
    file.startsWith("noto-serif-jp-") &&
    file.endsWith(".woff2") &&
    !used.has(file)
  )
    fs.unlinkSync(`public/fonts/${file}`);
}
fs.copyFileSync(`${source}/LICENSE`, "public/fonts/OFL-Noto-Serif-JP.txt");
console.log(`Prepared ${used.size} Noto subsets shared by app and promo.`);
