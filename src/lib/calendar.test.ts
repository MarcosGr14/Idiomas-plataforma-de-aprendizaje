import { expect, it } from "vitest";
import {
  addDays,
  assessmentKey,
  isoWeek,
  isDayKey,
  validAssessmentKey,
  weekStart,
  periodLabel,
} from "./calendar";
it("uses ISO weeks across year boundaries and validates week 53", () => {
  expect(isoWeek("2021-01-01")).toBe("2020-W53");
  expect(isoWeek("2021-01-04")).toBe("2021-W01");
  expect(isoWeek("2024-12-30")).toBe("2025-W01");
  expect(validAssessmentKey("semanal:2020-W53")).toBe(true);
  expect(validAssessmentKey("semanal:2021-W53")).toBe(false);
  expect(validAssessmentKey("mensual:2026-00")).toBe(false);
});
it("uses calendar days across leap days, DST boundaries and month changes", () => {
  expect(addDays("2024-02-28", 1)).toBe("2024-02-29");
  expect(addDays("2026-03-08", 1)).toBe("2026-03-09");
  expect(addDays("2026-11-01", -1)).toBe("2026-10-31");
  expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  expect(isDayKey("2026-02-29")).toBe(false);
});
it("keeps Monday to Sunday in one weekly period", () => {
  expect(weekStart("2026-11-01")).toBe("2026-10-26");
  expect(assessmentKey("semanal", "2026-10-26")).toBe(
    assessmentKey("semanal", "2026-11-01"),
  );
  expect(assessmentKey("semanal", "2026-11-02")).not.toBe(
    assessmentKey("semanal", "2026-11-01"),
  );
  expect(assessmentKey("mensual", "2026-10-31")).toBe("mensual:2026-10");
});

it("formats saved period labels without throwing on extreme valid years", () => {
  expect(periodLabel("mensual:2026-10")).toBe("octubre de 2026");
  expect(periodLabel("semanal:2026-W44")).toBe("26 oct – 1 nov");
  expect(periodLabel("invalid")).toBe("Período anterior");
  expect(() => periodLabel("semanal:9999-W52")).not.toThrow();
});
