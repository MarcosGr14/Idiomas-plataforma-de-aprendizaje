// Derived KanjiVG geometry, CC BY-SA 3.0. No browser or remote input at runtime.
import {readFileSync, writeFileSync} from 'node:fs';
import {svgPathProperties} from 'svg-path-properties';
const source = JSON.parse(readFileSync('content/kanjivg/hiragana-source.json', 'utf8'));
const glyphs = {};
for (const char of source.characters) {
  const code = char.codePointAt(0).toString(16).padStart(5,'0');
  const xml = readFileSync(`content/kanjivg/${code}.svg`, 'utf8');
  glyphs[char] = [...xml.matchAll(/<path\b[^>]*id="[^"]+-s\d+"[^>]*d="([^"]+)"/g)].map(([,d]) => {
    const path = new svgPathProperties(d), length = path.getTotalLength();
    const count = Math.max(12, Math.ceil(length / 2));
    return {d, points:Array.from({length:count+1}, (_,i) => {
      const p = path.getPointAtLength(i/count*length);
      return [Number(p.x.toFixed(2)),Number(p.y.toFixed(2))];
    })};
  });
  if (!glyphs[char].length) throw new Error(`Missing strokes: ${char}`);
}
writeFileSync('src/data/hiragana-strokes.json',JSON.stringify({attribution:'KanjiVG, Ulrich Apel and contributors, CC BY-SA 3.0; resampled at 2 SVG units, order and direction retained.',source:source.commit,glyphs})+'\n');
console.log(`Prepared ${Object.keys(glyphs).length} hiragana glyphs`);
