import { appNow } from "./capture";
import { normalizeMotion, type MotionMode } from "./motion";
export type Review = { due: string; interval: number; correct: number };
export type Progress = {
  version: 1;
  completed: Record<string, { score: number; date: string }>;
  reviews: Record<string, Review>;
  activity: Record<string, number>;
  studied: string[];
  goal: number;
  placement: number | null;
  romanization: boolean;
  reducedMotion: boolean;
  motion?: MotionMode;
  exams: Record<string, { score: number; total: number; date: string }>;
};
export const dayKey = (date = appNow()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export function freshProgress(): Progress {
  return {
    version: 1,
    completed: {},
    reviews: {},
    activity: {},
    studied: [],
    goal: 10,
    placement: null,
    romanization: true,
    reducedMotion: false,
    exams: {},
  };
}
const MAX_RECORDS = 20000;
const forbiddenKeys = new Set(["__proto__", "constructor", "prototype"]);
function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
function integer(value: unknown, min: number, max: number): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= min &&
    value <= max
  );
}
function dateKey(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
function cleanMap<T>(
  value: unknown,
  parse: (entry: unknown, key: string) => T | undefined,
): Record<string, T> {
  const result: Record<string, T> = {};
  let count = 0;
  for (const [key, entry] of Object.entries(record(value))) {
    if (++count > MAX_RECORDS) break;
    if (
      forbiddenKeys.has(key) ||
      !/^[a-zA-Z0-9_-][a-zA-Z0-9_:-]{0,119}$/.test(key)
    )
      continue;
    const parsed = parse(entry, key);
    if (parsed !== undefined) result[key] = parsed;
  }
  return result;
}
/** Treat browser storage and cloud JSON as untrusted input, keeping valid siblings. */
export function normalizeProgress(raw: unknown): Progress {
  const base = freshProgress();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return base;
  const p = record(raw);
  const activity = cleanMap(p.activity, (value, key) =>
    dateKey(key) && integer(value, 0, 1000000) ? value : undefined,
  );
  const reducedMotion = p.reducedMotion === true;
  return {
    version: 1,
    goal: p.goal === 5 || p.goal === 10 || p.goal === 20 ? p.goal : base.goal,
    placement: integer(p.placement, 0, 100) ? p.placement : null,
    romanization:
      typeof p.romanization === "boolean" ? p.romanization : base.romanization,
    reducedMotion,
    motion: normalizeMotion(p.motion, reducedMotion),
    activity,
    studied: [
      ...new Set(
        Array.isArray(p.studied)
          ? p.studied.slice(0, MAX_RECORDS).filter(dateKey)
          : Object.keys(activity),
      ),
    ],
    completed: cleanMap(p.completed, (value) => {
      const item = record(value);
      return integer(item.score, 0, 100) && dateKey(item.date)
        ? { score: item.score, date: item.date }
        : undefined;
    }),
    reviews: cleanMap(p.reviews, (value) => {
      const item = record(value);
      return dateKey(item.due) &&
        integer(item.interval, 0, 365) &&
        integer(item.correct, 0, 1000000)
        ? { due: item.due, interval: item.interval, correct: item.correct }
        : undefined;
    }),
    exams: cleanMap(p.exams, (value) => {
      const item = record(value);
      return integer(item.score, 0, 100) &&
        integer(item.total, 1, 10000) &&
        dateKey(item.date)
        ? { score: item.score, total: item.total, date: item.date }
        : undefined;
    }),
  };
}
export function completeLesson(
  p: Progress,
  id: string,
  score: number,
  wordIds: string[],
  date = appNow(),
): Progress {
  const key = dayKey(date);
  const first = !p.completed[id];
  const reviews = { ...p.reviews };
  for (const word of wordIds)
    if (!reviews[word]) reviews[word] = { due: key, interval: 0, correct: 0 };
  return {
    ...p,
    completed: {
      ...p.completed,
      [id]: {
        score: Math.max(score, p.completed[id]?.score ?? 0),
        date: p.completed[id]?.date ?? key,
      },
    },
    reviews,
    studied: [...new Set([...p.studied, key])],
    activity: {
      ...p.activity,
      [key]: (p.activity[key] ?? 0) + (first ? 30 : 0),
    },
  };
}
export function reviewWord(
  p: Progress,
  id: string,
  remembered: boolean,
  date = appNow(),
): Progress {
  const old = p.reviews[id] ?? { due: dayKey(date), interval: 0, correct: 0 };
  if (old.due > dayKey(date)) return p;
  const interval = remembered
    ? Math.min(30, old.interval === 0 ? 1 : old.interval * 2)
    : 1;
  const next = new Date(date);
  next.setDate(next.getDate() + interval);
  const today = dayKey(date);
  return {
    ...p,
    studied: [...new Set([...p.studied, today])],
    reviews: {
      ...p.reviews,
      [id]: {
        due: dayKey(next),
        interval,
        correct: remembered ? old.correct + 1 : 0,
      },
    },
    activity: {
      ...p.activity,
      [today]: (p.activity[today] ?? 0) + (remembered ? 5 : 0),
    },
  };
}
export const xp = (p: Progress) =>
  Object.values(p.activity).reduce((a, b) => a + b, 0);
export function streak(p: Progress, date = appNow()) {
  const cursor = new Date(date);
  const days = new Set([
    ...p.studied,
    ...Object.keys(p.activity).filter((k) => p.activity[k] > 0),
  ]);
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let result = 0;
  while (days.has(dayKey(cursor))) {
    result++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return result;
}
export function saveProgress(key: string, p: Progress) {
  try {
    localStorage.setItem(key, JSON.stringify(p));
    return true;
  } catch {
    return false;
  }
}
export function readProgress(key: string) {
  try {
    const raw = localStorage.getItem(key);
    if (raw && raw.length > 1048576) return freshProgress();
    return normalizeProgress(JSON.parse(raw || "null"));
  } catch {
    return freshProgress();
  }
}
