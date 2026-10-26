import data from "./hiragana-strokes.json";
import type { Point } from "../lib/writing";
export const hiraganaGlyphs = Object.fromEntries(
  Object.entries(data.glyphs).map(([character, strokes]) => [
    character,
    strokes.map((stroke) => ({
      ...stroke,
      points: stroke.points.map(([x, y]): Point => [x, y]),
    })),
  ]),
);
