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
export const dayKey = (date = new Date()) =>
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
export function normalizeProgress(raw: unknown): Progress {
  const base = freshProgress();
  if (!raw || typeof raw !== "object") return base;
  const p = raw as Partial<Progress>;
  return {
    ...base,
    ...p,
    version: 1,
    motion: normalizeMotion(p.motion, p.reducedMotion),
    studied: Array.isArray(p.studied)
      ? p.studied.filter((d) => typeof d === "string")
      : Object.keys(p.activity ?? {}),
    completed:
      p.completed && typeof p.completed === "object" ? p.completed : {},
    reviews: p.reviews && typeof p.reviews === "object" ? p.reviews : {},
    activity: p.activity && typeof p.activity === "object" ? p.activity : {},
    exams: p.exams && typeof p.exams === "object" ? p.exams : {},
    goal: [5, 10, 20].includes(Number(p.goal)) ? Number(p.goal) : 10,
  };
}
export function completeLesson(
  p: Progress,
  id: string,
  score: number,
  wordIds: string[],
  date = new Date(),
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
  date = new Date(),
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
export function streak(p: Progress, date = new Date()) {
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
    return normalizeProgress(JSON.parse(localStorage.getItem(key) || "null"));
  } catch {
    return freshProgress();
  }
}
