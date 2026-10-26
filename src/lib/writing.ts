export type Point = readonly [number, number];
const distance = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]);
export function pathLength(points: readonly Point[]) {
  return points.slice(1).reduce((sum, p, i) => sum + distance(points[i], p), 0);
}
/** Equal arc-length samples make the check independent of pointer event frequency. */
export function resample(points: readonly Point[], count = 32): Point[] {
  if (points.length < 2 || count < 2) return [];
  const cumulative = [0];
  for (let i = 1; i < points.length; i++)
    cumulative.push(cumulative[i - 1] + distance(points[i - 1], points[i]));
  const length = cumulative.at(-1)!;
  if (!length) return [];
  let segment = 1;
  return Array.from({ length: count }, (_, i) => {
    const target = (i / (count - 1)) * length;
    while (segment < points.length - 1 && cumulative[segment] < target)
      segment++;
    const fraction =
      (target - cumulative[segment - 1]) /
      (cumulative[segment] - cumulative[segment - 1] || 1);
    return [
      points[segment - 1][0] +
        (points[segment][0] - points[segment - 1][0]) * fraction,
      points[segment - 1][1] +
        (points[segment][1] - points[segment - 1][1]) * fraction,
    ] as Point;
  });
}
export type StrokeCheck = "accepted" | "invalid" | "start" | "end" | "shape";
/** Assistance in a 109×109 square, not handwriting recognition or certification. */
export function checkStroke(
  drawn: readonly Point[],
  expected: readonly Point[],
): StrokeCheck {
  if (
    drawn.length < 2 ||
    drawn.length > 2048 ||
    expected.length < 2 ||
    drawn.some(
      (p) =>
        p.length !== 2 ||
        p.some((n) => !Number.isFinite(n) || n < -5 || n > 114),
    )
  )
    return "invalid";
  if (distance(drawn[0], expected[0]) > 13) return "start";
  if (distance(drawn.at(-1)!, expected.at(-1)!) > 16) return "end";
  const ratio = pathLength(drawn) / pathLength(expected);
  if (!Number.isFinite(ratio) || ratio < 0.55 || ratio > 1.8) return "shape";
  const a = resample(drawn),
    b = resample(expected);
  if (!a.length || !b.length) return "invalid";
  const errors = a.map((p, i) => distance(p, b[i]));
  return errors.reduce((sum, n) => sum + n, 0) / errors.length <= 9 &&
    errors.filter((n) => n <= 14).length / errors.length >= 0.8
    ? "accepted"
    : "shape";
}
