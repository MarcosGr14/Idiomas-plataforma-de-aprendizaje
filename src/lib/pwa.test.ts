import { afterEach, beforeEach, expect, it, vi } from "vitest";
const { register, handlers } = vi.hoisted(() => ({
  register: vi.fn(),
  handlers: new Map<string, () => void>(),
}));
vi.mock("virtual:pwa-register", () => ({ registerSW: register }));
vi.mock("./capture", () => ({ captureEnabled: false }));
beforeEach(() => {
  vi.resetModules();
  handlers.clear();
  register.mockReset();
  register.mockReturnValue(vi.fn(async () => {}));
  vi.stubGlobal("navigator", { onLine: true });
  vi.stubGlobal("window", {
    addEventListener: (type: string, callback: () => void) =>
      handlers.set(type, callback),
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
it("registers once and exposes detected updates without activating them", async () => {
  const { appUpdate } = await import("./pwa");
  expect(register).toHaveBeenCalledTimes(1);
  const options = register.mock.calls[0][0];
  options.onNeedRefresh();
  expect(appUpdate.snapshot().available).toBe(true);
  expect(register.mock.results[0].value).not.toHaveBeenCalled();
});
it("bounds checks to one in flight and preserves the app after network failures", async () => {
  const { checkAppUpdate } = await import("./pwa");
  expect(await checkAppUpdate()).toBe("unavailable");
  let finish: () => void = () => {};
  const update = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  register.mock.calls[0][0].onRegisteredSW("/sw.js", { update });
  const first = checkAppUpdate();
  expect(await checkAppUpdate()).toBe("unavailable");
  expect(update).toHaveBeenCalledTimes(1);
  finish();
  expect(await first).toBe("checked");
  update.mockRejectedValueOnce(Error("offline"));
  expect(await checkAppUpdate()).toBe("unavailable");
  vi.stubGlobal("navigator", { onLine: false });
  expect(await checkAppUpdate()).toBe("offline");
});
it("checks on connectivity recovery and throttles focus checks", async () => {
  await import("./pwa");
  const update = vi.fn(async () => {});
  register.mock.calls[0][0].onRegisteredSW("/sw.js", { update });
  handlers.get("focus")!();
  await new Promise((resolve) => setTimeout(resolve, 0));
  handlers.get("focus")!();
  expect(update).toHaveBeenCalledTimes(1);
  handlers.get("online")!();
  expect(update).toHaveBeenCalledTimes(2);
});

it("lets a stalled check recover instead of leaving the control disabled", async () => {
  vi.useFakeTimers();
  const { checkAppUpdate } = await import("./pwa");
  register.mock.calls[0][0].onRegisteredSW("/sw.js", {
    update: () => new Promise(() => {}),
  });
  const result = checkAppUpdate();
  await vi.advanceTimersByTimeAsync(15000);
  expect(await result).toBe("unavailable");
  register.mock.calls[0][0].onRegisteredSW("/sw.js", {
    update: async () => {},
  });
  expect(await checkAppUpdate()).toBe("checked");
});

it("defers a reload triggered by another tab until this user chooses to update", async () => {
  vi.useFakeTimers();
  const reload = vi.fn();
  vi.stubGlobal("window", { addEventListener: vi.fn(), location: { reload } });
  const { appUpdate } = await import("./pwa");
  register.mock.calls[0][0].onNeedReload();
  expect(reload).not.toHaveBeenCalled();
  expect(appUpdate.snapshot().available).toBe(true);
  await appUpdate.apply(false);
  expect(reload).not.toHaveBeenCalled();
  await appUpdate.apply(true);
  expect(reload).toHaveBeenCalledTimes(1);
});
