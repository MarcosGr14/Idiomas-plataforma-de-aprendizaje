import { afterEach, expect, it, vi } from "vitest";
import { AppUpdate } from "./appUpdate";
afterEach(() => vi.useRealTimers());
it("never activates without a detected update or a safely stored progress copy", async () => {
  const activate = vi.fn(async () => {}),
    update = new AppUpdate(activate);
  await update.apply(true);
  expect(activate).not.toHaveBeenCalled();
  update.ready();
  await update.apply(false);
  expect(activate).not.toHaveBeenCalled();
  expect(update.snapshot().error).toContain("copia segura");
});
it("deduplicates activation, allows dismissal and recovers from stalled activation", async () => {
  vi.useFakeTimers();
  const activate = vi.fn(async () => {}),
    update = new AppUpdate(activate);
  update.ready();
  update.dismiss();
  expect(update.snapshot().dismissed).toBe(true);
  await update.apply(true);
  await update.apply(true);
  expect(activate).toHaveBeenCalledTimes(1);
  expect(update.snapshot().busy).toBe(true);
  vi.advanceTimersByTime(15000);
  expect(update.snapshot().busy).toBe(false);
  expect(update.snapshot().error).toContain("No se pudo");
});
it("recovers from activation errors and notifies only active subscribers", async () => {
  const activate = vi
      .fn()
      .mockRejectedValueOnce(Error("offline"))
      .mockResolvedValue(undefined),
    update = new AppUpdate(activate),
    listener = vi.fn();
  const stop = update.subscribe(listener);
  update.ready();
  await update.apply(true);
  expect(update.snapshot().busy).toBe(false);
  expect(listener).toHaveBeenCalled();
  stop();
  listener.mockClear();
  update.dismiss();
  expect(listener).not.toHaveBeenCalled();
});
