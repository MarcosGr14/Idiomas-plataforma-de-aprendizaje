import { expect, it } from "vitest";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { notoFaces } from "./fonts";
import { words, lessons } from "../data/course";
it("references only existing self-hosted font files", () => {
  const urls = [...notoFaces.matchAll(/url\(['"]([^'"]+)['"]\)/g)].map(
    (match) => match[1],
  );
  expect(urls.length).toBeGreaterThan(0);
  for (const url of urls) {
    expect(url).toMatch(/^\/fonts\/noto-serif-jp-[\w-]+\.woff2$/);
    expect(
      existsSync(fileURLToPath(new URL(`../../public${url}`, import.meta.url))),
      url,
    ).toBe(true);
  }
});
it("covers the course Japanese characters at both weights", () => {
  const characters = new Set(
    [
      ...words.map((w) => w.jp).join(""),
      ...lessons.map((l) => l.symbol).join(""),
    ].filter((c) => /[\u3040-\u30ff\u4e00-\u9fff]/u.test(c)),
  );
  for (const weight of [400, 600]) {
    const intervals = [...notoFaces.matchAll(/@font-face\s*\{[^}]+\}/g)]
      .map((match) => match[0])
      .filter((block) => new RegExp(`font-weight:\\s*${weight};`).test(block))
      .flatMap((block) =>
        block
          .match(/unicode-range:\s*([^;]+)/)![1]
          .split(",")
          .map((range) =>
            range
              .trim()
              .replace("U+", "")
              .split("-")
              .map((n) => parseInt(n, 16)),
          ),
      );
    for (const char of characters) {
      const code = char.codePointAt(0)!;
      expect(
        intervals.some(([lo, hi = lo]) => code >= lo && code <= hi),
        `${char} @${weight}`,
      ).toBe(true);
    }
  }
});
