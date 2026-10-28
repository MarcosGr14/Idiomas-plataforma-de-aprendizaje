import { appNow } from "./capture";
import {
  dayKey,
  isDayKey as dateKey,
  addDays,
  assessmentKey,
  validAssessmentKey,
  type AssessmentMode,
} from "./calendar";
export { dayKey } from "./calendar";
export const XP_RULES = {
  lesson: 30,
  review: 5,
  weeklyExam: 50,
  monthlyExam: 100,
  streakWeek: 50,
  level: 100,
  pass: 60,
} as const;
export type ExamResult = {
  score: number;
  total: number;
  date: string;
  rewarded?: boolean;
  attempts?: number;
  lastScore?: number;
  lastAttemptId?: string;
  mistakes?: string[];
};
export type StreakReward = { date: string; xp: 50 };
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
  exams: Record<string, ExamResult>;
  rewards: Record<string, StreakReward>;
};
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
    rewards: {},
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
    exams: normalizeExams(p.exams),
    rewards: cleanMap(p.rewards, (value, key) => {
      const item = record(value),
        match = /^racha:(\d{4}-\d{2}-\d{2}):(\d+)$/.exec(key);
      if (
        !match ||
        !dateKey(match[1]) ||
        !integer(+match[2], 1, 3000) ||
        !dateKey(item.date) ||
        item.xp !== XP_RULES.streakWeek
      )
        return;
      return { date: item.date, xp: XP_RULES.streakWeek };
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
  if (
    !integer(score, XP_RULES.pass, 100) ||
    forbiddenKeys.has(id) ||
    !/^[a-zA-Z0-9_-]{1,120}$/.test(id) ||
    !dateKey(dayKey(date))
  )
    return p;
  const key = dayKey(date);
  const first = !p.completed[id];
  const reviews = { ...p.reviews };
  for (const word of wordIds)
    if (
      !forbiddenKeys.has(word) &&
      /^[a-zA-Z0-9_-]{1,120}$/.test(word) &&
      !reviews[word]
    )
      reviews[word] = { due: key, interval: 0, correct: 0 };
  return awardStreakReward(
    {
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
        [key]: (p.activity[key] ?? 0) + (first ? XP_RULES.lesson : 0),
      },
    },
    date,
  );
}
export function reviewWord(
  p: Progress,
  id: string,
  remembered: boolean,
  date = appNow(),
): Progress {
  const old = p.reviews[id];
  if (!old || forbiddenKeys.has(id) || !dateKey(dayKey(date))) return p;
  if (old.due > dayKey(date)) return p;
  const interval = remembered
    ? Math.min(30, old.interval === 0 ? 1 : old.interval * 2)
    : 1;
  const next = new Date(date);
  next.setDate(next.getDate() + interval);
  const today = dayKey(date);
  return awardStreakReward(
    {
      ...p,
      studied: [...new Set([...p.studied, today])],
      reviews: {
        ...p.reviews,
        [id]: {
          due: dayKey(next),
          interval,
          correct: remembered ? Math.min(1000000, old.correct + 1) : 0,
        },
      },
      activity: {
        ...p.activity,
        [today]: (p.activity[today] ?? 0) + (remembered ? XP_RULES.review : 0),
      },
    },
    date,
  );
}
export const xp = (p: Progress) =>
  Object.values(p.activity).reduce((a, b) => a + b, 0);
export function studiedDays(p: Progress) {
  return new Set([
    ...p.studied,
    ...Object.keys(p.activity).filter((key) => p.activity[key] > 0),
  ]);
}
export function streak(p: Progress, date = appNow()) {
  const days = studiedDays(p);
  let day = dayKey(date),
    count = 0;
  if (!days.has(day)) day = addDays(day, -1);
  while (days.has(day)) {
    count++;
    day = addDays(day, -1);
  }
  return count;
}
export function longestStreak(p: Progress, date = appNow()) {
  const days = [...studiedDays(p)].filter((day) => day <= dayKey(date)).sort();
  let previous = "",
    count = 0,
    best = 0;
  for (const day of days) {
    count = previous && addDays(previous, 1) === day ? count + 1 : 1;
    previous = day;
    best = Math.max(best, count);
  }
  return best;
}
export function levelInfo(p: Progress) {
  const total = xp(p),
    current = total % XP_RULES.level;
  return {
    total,
    level: Math.floor(total / XP_RULES.level) + 1,
    current,
    remaining: XP_RULES.level - current,
  };
}
export function awardStreakReward(p: Progress, date = appNow()): Progress {
  const today = dayKey(date);
  if (!studiedDays(p).has(today)) return p;
  const count = streak(p, date),
    cycle = Math.floor(count / 7);
  if (!cycle) return p;
  const start = addDays(today, 1 - count),
    key = `racha:${start}:${cycle}`;
  if (p.rewards[key]) return p;
  return {
    ...p,
    rewards: { ...p.rewards, [key]: { date: today, xp: XP_RULES.streakWeek } },
    activity: {
      ...p.activity,
      [today]: (p.activity[today] ?? 0) + XP_RULES.streakWeek,
    },
  };
}
function normalizeExams(raw: unknown) {
  const rows = cleanMap<ExamResult>(raw, (value) => {
    const item = record(value);
    if (
      !integer(item.score, 0, 100) ||
      !integer(item.total, 1, 10000) ||
      !dateKey(item.date)
    )
      return;
    return {
      score: item.score,
      total: item.total,
      date: item.date,
      // Old evaluations always received XP, even on failure: never pay again.
      rewarded: typeof item.rewarded === "boolean" ? item.rewarded : true,
      attempts: integer(item.attempts, 1, 1000000) ? item.attempts : 1,
      lastScore: integer(item.lastScore, 0, 100) ? item.lastScore : item.score,
      lastAttemptId:
        typeof item.lastAttemptId === "string" &&
        /^[a-zA-Z0-9_-]{1,80}$/.test(item.lastAttemptId)
          ? item.lastAttemptId
          : undefined,
      mistakes: Array.isArray(item.mistakes)
        ? [
            ...new Set(
              item.mistakes
                .slice(0, 80)
                .filter(
                  (id): id is string =>
                    typeof id === "string" &&
                    /^[a-zA-Z0-9_-]+:\d{1,2}$/.test(id),
                ),
            ),
          ]
        : [],
    };
  });
  const result: Record<string, ExamResult> = {};
  for (const [stored, row] of Object.entries(rows)) {
    const key = /^semanal:\d{4}-w\d{1,2}$/.test(stored)
      ? assessmentKey("semanal", row.date)
      : stored;
    if (!validAssessmentKey(key)) continue;
    const old = result[key];
    if (!old) result[key] = row;
    else {
      const latest = row.date >= old.date ? row : old;
      const best = row.score >= old.score ? row : old;
      result[key] = {
        ...latest,
        score: best.score,
        total: best.total,
        rewarded: !!(row.rewarded || old.rewarded),
        attempts: Math.min(1000000, (row.attempts ?? 1) + (old.attempts ?? 1)),
      };
    }
  }
  return result;
}
export function recordAssessment(
  p: Progress,
  input: {
    mode: AssessmentMode;
    period: string;
    score: number;
    total: number;
    attemptId: string;
    mistakes: string[];
  },
  date = appNow(),
): Progress {
  const { mode, period, score, total, attemptId } = input;
  if (
    !validAssessmentKey(period) ||
    !period.startsWith(mode + ":") ||
    !integer(score, 0, 100) ||
    !integer(total, 1, 80) ||
    !/^[a-zA-Z0-9_-]{1,80}$/.test(attemptId) ||
    !dateKey(dayKey(date))
  )
    return p;
  const old = p.exams[period];
  if (old?.lastAttemptId === attemptId) return p;
  const alreadyPaid = !!old && old.rewarded !== false;
  const reward =
    !alreadyPaid && score >= XP_RULES.pass
      ? mode === "semanal"
        ? XP_RULES.weeklyExam
        : XP_RULES.monthlyExam
      : 0;
  const today = dayKey(date),
    best = !old || score >= old.score;
  return awardStreakReward(
    {
      ...p,
      studied: [...new Set([...p.studied, today])],
      exams: {
        ...p.exams,
        [period]: {
          score: Math.max(score, old?.score ?? 0),
          total: best ? total : old.total,
          date: today,
          rewarded: alreadyPaid || reward > 0,
          attempts: Math.min(1000000, (old?.attempts ?? 0) + 1),
          lastScore: score,
          lastAttemptId: attemptId,
          mistakes: [
            ...new Set(
              input.mistakes.filter((id) =>
                /^[a-zA-Z0-9_-]+:\d{1,2}$/.test(id),
              ),
            ),
          ].slice(0, 80),
        },
      },
      activity: { ...p.activity, [today]: (p.activity[today] ?? 0) + reward },
    },
    date,
  );
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
