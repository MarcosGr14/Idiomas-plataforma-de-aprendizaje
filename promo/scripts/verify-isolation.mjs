import {browserPath} from './browser.mjs';
import { chromium } from "playwright";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: await browserPath(),
  headless: true,
  args: ["--no-sandbox"],
});
try {
  const ctx = await browser.newContext({
      viewport: { width: 360, height: 800 },
    }),
    page = await ctx.newPage();
  const url = process.env.PROMO_SITE || "http://localhost:5173";
  await page.goto(`${url}/#/aula`);
  await page.waitForSelector("main");
  assert.equal(
    await page.evaluate(() => typeof window.__IDIOMAS_CAPTURE__),
    "undefined",
  );
  await page.evaluate(() => {
    localStorage.setItem(
      "idiomas:guest",
      '{"sentinel":"preserve-existing-data"}',
    );
    localStorage.setItem("unrelated", "preserve");
  });
  const before = await page.evaluate(() => JSON.stringify({ ...localStorage }));
  await page.goto(`${url}/?capture=1#/aula`);
  await page
    .getByText("Demostración · datos de ejemplo", { exact: true })
    .waitFor({state:"attached"});
  assert.equal(
    await page.evaluate(() => JSON.stringify({ ...localStorage })),
    before,
  );
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.goto(`${url}/?capture=1#/ajustes`);
  await page.waitForSelector("main");
  assert.equal(
    await page.evaluate(() => JSON.stringify({ ...localStorage })),
    before,
  );
  console.log(
    "Verified: normal mode has no bridge; demo preserves existing storage; 360px has no overflow.",
  );
} finally {
  await browser.close();
}
