import { appNow } from "./capture";
export const dayKey = (date = appNow()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export function isDayKey(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
/** Calendar arithmetic on date-only values, independent of daylight saving time. */
export function addDays(day: string, amount: number) {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().split("T")[0];
}
export function weekStart(day: string) {
  const date = new Date(`${day}T12:00:00Z`);
  return addDays(day, -((date.getUTCDay() + 6) % 7));
}
export function isoWeek(day: string) {
  const thursday = new Date(`${day}T12:00:00Z`);
  thursday.setUTCDate(thursday.getUTCDate() + 4 - (thursday.getUTCDay() || 7));
  const year = thursday.getUTCFullYear();
  const first = new Date(`${String(year).padStart(4, "0")}-01-01T12:00:00Z`);
  const week = Math.ceil(
    ((thursday.getTime() - first.getTime()) / 86400000 + 1) / 7,
  );
  return `${String(year).padStart(4, "0")}-W${String(week).padStart(2, "0")}`;
}
export type AssessmentMode = "semanal" | "mensual";
export const assessmentKey = (mode: AssessmentMode, day: string) =>
  `${mode}:${mode === "semanal" ? isoWeek(day) : day.slice(0, 7)}`;
export function validAssessmentKey(key: string) {
  if (/^mensual:\d{4}-(0[1-9]|1[0-2])$/.test(key)) return true;
  const match = /^semanal:(\d{4})-W(\d{2})$/.exec(key);
  return (
    !!match &&
    +match[2] >= 1 &&
    +match[2] <= +isoWeek(`${match[1]}-12-28`).slice(-2)
  );
}
export function formatDay(
  day: string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" },
) {
  return new Intl.DateTimeFormat("es", { ...options, timeZone: "UTC" }).format(
    new Date(`${day}T12:00:00Z`),
  );
}
export function periodLabel(key: string) {
  if (!validAssessmentKey(key)) return "Período anterior";
  const [mode, period] = key.split(":");
  if (mode === "mensual")
    return formatDay(`${period}-01`, { month: "long", year: "numeric" });
  const [year, week] = period.split("-W");
  const start = addDays(weekStart(`${year}-01-04`), (+week - 1) * 7);
  return `${formatDay(start)} – ${formatDay(addDays(start, 6))}`;
}
