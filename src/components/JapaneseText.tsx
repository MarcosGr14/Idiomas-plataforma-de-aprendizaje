/** Keep Spanish narration while giving Japanese runs the correct speech language. */
export default function JapaneseText({ text }: { text: string }) {
  return text
    .split(
      /([\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}ー々〆ヵヶ]+)/u,
    )
    .map((part, index) =>
      index % 2 ? (
        <span lang="ja" key={index}>
          {part}
        </span>
      ) : (
        part
      ),
    );
}
