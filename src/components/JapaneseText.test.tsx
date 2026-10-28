import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import JapaneseText from "./JapaneseText";
it("marks Japanese runs without changing Spanish or interpreting HTML", () => {
  expect(
    renderToStaticMarkup(
      <JapaneseText text="いえ significa casa. カタカナ 漢字" />,
    ),
  ).toBe(
    '<span lang="ja">いえ</span> significa casa. <span lang="ja">カタカナ</span> <span lang="ja">漢字</span>',
  );
  expect(renderToStaticMarkup(<JapaneseText text="Casa" />)).toBe("Casa");
  expect(
    renderToStaticMarkup(<JapaneseText text="<script>あ</script>" />),
  ).toBe('&lt;script&gt;<span lang="ja">あ</span>&lt;/script&gt;');
});
