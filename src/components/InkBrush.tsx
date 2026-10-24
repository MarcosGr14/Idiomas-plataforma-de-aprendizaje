import React from "react";
import { brand } from "../design/tokens";
import data from "../design/kanjivg.json";
export type InkPoint = readonly [number, number];
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const noise = (seed: number, i: number) => {
  const x = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
/** Pure SVG geometry: no RAF, timers, DOM sampling or unseeded randomness. */
export function InkBrush({
  points,
  progress = 1,
  width = 10,
  color = brand.colors.ink,
  seed = 7,
  dry = 0.42,
  splashes = 0,
  drips = 0,
  taper = 0.12,
}: {
  points: readonly InkPoint[];
  progress?: number;
  width?: number;
  color?: string;
  seed?: number;
  dry?: number;
  splashes?: number;
  drips?: number;
  taper?: number;
}) {
  const p = clamp(progress);
  if (p === 0 || points.length < 2) return null;
  const position = p * (points.length - 1),
    last = Math.floor(position),
    q = position - last;
  const visible = points
    .slice(0, last + 1)
    .map((x) => [...x] as [number, number]);
  if (q && last < points.length - 1)
    visible.push([
      points[last][0] * (1 - q) + points[last + 1][0] * q,
      points[last][1] * (1 - q) + points[last + 1][1] * q,
    ]);
  if (visible.length < 2) return null;
  const edge = (side: number) =>
    visible.map(([x, y], i) => {
      const before = visible[Math.max(0, i - 1)],
        after = visible[Math.min(visible.length - 1, i + 1)],
        dx = after[0] - before[0],
        dy = after[1] - before[1],
        length = Math.hypot(dx, dy) || 1,
        u = i / (points.length - 1);
      const radius =
        width *
        0.5 *
        (1 - (1 - taper) * Math.pow(u, 2.6)) *
        (0.91 + 0.13 * noise(seed, i * 2 + (side > 0 ? 0 : 1)));
      return [
        x - (dy / length) * radius * side,
        y + (dx / length) * radius * side,
      ];
    });
  const upper = edge(1),
    lower = edge(-1);
  const tipPoint = visible.at(-1)!,
    previous = visible.at(-2)!;
  const dx = tipPoint[0] - previous[0],
    dy = tipPoint[1] - previous[1];
  const distance = Math.hypot(dx, dy) || 1;
  const top = upper.at(-1)!,
    bottom = lower.at(-1)!;
  const radius = Math.hypot(top[0] - bottom[0], top[1] - bottom[1]) * 0.32;
  const bristleTip = Array.from({ length: 11 }, (_, i) => {
    const t = (i + 1) / 12;
    const extension =
      Math.sin(t * Math.PI) * radius * (0.85 + noise(seed, i + 500) * 0.3);
    return [
      top[0] * (1 - t) + bottom[0] * t + (dx / distance) * extension,
      top[1] * (1 - t) + bottom[1] * t + (dy / distance) * extension,
    ];
  });
  const polygon = [...upper, ...bristleTip, ...lower.reverse()]
    .map((x) => x.map((n) => n.toFixed(3)).join(","))
    .join(" ");
  const tip = visible.at(-1)!;
  const dryPaths = Array.from({ length: 3 }, (_, k) =>
    visible
      .filter((_, i) => i / (points.length - 1) > 0.64 + k * 0.055)
      .map(
        ([x, y], i) =>
          `${i ? "L" : "M"}${x.toFixed(3)} ${(y + (k - 1) * width * 0.08).toFixed(3)}`,
      )
      .join(" "),
  );
  // Mask IDs are derived from immutable inputs; stable across arbitrary frame seeks.
  const id = `ink-${seed}-${Math.abs(Math.round(points[0][0] * 17 + points[0][1] * 31))}-${Math.round(width * 100)}`;
  return (
    <g aria-hidden="true">
      <defs>
        <mask
          id={id}
          maskUnits="userSpaceOnUse"
          x={Math.min(...visible.map((p) => p[0])) - width}
          y={Math.min(...visible.map((p) => p[1])) - width}
          width={
            Math.max(...visible.map((p) => p[0])) -
            Math.min(...visible.map((p) => p[0])) +
            width * 2
          }
          height={
            Math.max(...visible.map((p) => p[1])) -
            Math.min(...visible.map((p) => p[1])) +
            width * 2
          }
        >
          <polygon points={polygon} fill="white" />
          {dryPaths.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="black"
              strokeWidth={width * 0.025 * dry * (i + 1)}
            />
          ))}
        </mask>
      </defs>
      <polygon
        points={polygon}
        fill={color}
        mask={dry > 0 ? `url(#${id})` : undefined}
      />
      {Array.from({ length: Math.min(3, splashes) }, (_, i) =>
        p > 0.75 + i * 0.06 ? (
          <ellipse
            key={i}
            cx={tip[0] + width * (0.2 + noise(seed, i) * 0.5)}
            cy={tip[1] + width * (noise(seed + 8, i) - 0.5) * 1.8}
            rx={width * (0.018 + noise(seed + 1, i) * 0.035)}
            ry={width * 0.025}
            fill={color}
          />
        ) : null,
      )}
      {Array.from({ length: Math.min(2, drips) }, (_, i) =>
        p > 0.85 ? (
          <path
            key={i}
            d={`M${visible[0][0] + width * 0.17 * i} ${visible[0][1]}v${width * 0.35 * clamp((p - 0.85) / 0.15)}`}
            stroke={color}
            strokeWidth={width * 0.05}
            strokeLinecap="round"
          />
        ) : null,
      )}
    </g>
  );
}
export const glyphs = data.glyphs;
/** KanjiVG source order is retained. Each path finishes before the next starts. */
export function InkCharacter({
  character,
  progress = 1,
  color = brand.colors.ink,
  seed = 10,
  width = 8,
}: {
  character: keyof typeof glyphs;
  progress?: number;
  color?: string;
  seed?: number;
  width?: number;
}) {
  const strokes = glyphs[character];
  return (
    <svg
      viewBox="0 0 109 109"
      role="img"
      aria-label={character}
      lang="ja"
      style={{ width: "100%", height: "100%", overflow: "visible" }}
    >
      {strokes.map((s, i) => (
        <InkBrush
          key={i}
          points={s.points as [number, number][]}
          progress={clamp(progress * strokes.length - i)}
          width={width}
          color={color}
          seed={seed + i}
          dry={0.6}
        />
      ))}
    </svg>
  );
}

/** Typeface contour, revealed in the source stroke sequence, with a final ink settle. */
export function InkCalligraphy({
  character,
  progress,
  seed = 300,
}: {
  character: keyof typeof glyphs;
  progress: number;
  seed?: number;
}) {
  const id = `calligraphy-${seed}`;
  const strokes = glyphs[character];
  return (
    <svg
      viewBox="0 0 109 109"
      role="img"
      aria-label={character}
      lang="ja"
      style={{ width: "100%", height: "100%", overflow: "visible" }}
    >
      <defs>
        <mask
          id={id}
          maskUnits="userSpaceOnUse"
          x="-10"
          y="-10"
          width="129"
          height="129"
        >
          <rect
            x="-10"
            y="-10"
            width="129"
            height="129"
            fill="white"
            opacity={clamp((progress - 0.96) / 0.04)}
          />
          {strokes.map((s, i) => (
            <InkBrush
              key={i}
              points={s.points as [number, number][]}
              width={24}
              progress={clamp(progress * strokes.length - i)}
              color="white"
              seed={seed + i}
              dry={0.3}
            />
          ))}
        </mask>
      </defs>
      <text
        x="54.5"
        y="94"
        textAnchor="middle"
        fontFamily={brand.fonts.calligraphy}
        fontSize="108"
        fill={brand.colors.ink}
        mask={`url(#${id})`}
      >
        {character}
      </text>
    </svg>
  );
}
