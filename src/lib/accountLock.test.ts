import { expect, it } from "vitest";
import { holdAccountLock } from "./accountLock";
it("keeps a second tab out of the shared pending store until the first releases it", async () => {
  let tail = Promise.resolve();
  const locks = {
    request: (
      _name: string,
      _options: unknown,
      callback: () => Promise<void>,
    ) => {
      const next = tail.then(callback);
      tail = next;
      return next;
    },
  } as unknown as LockManager;
  const owners: string[] = [];
  const first = holdAccountLock(
    locks,
    "alice",
    () => {
      owners.push("first");
      return () => {
        owners.push("closed first");
      };
    },
    () => {},
  );
  const second = holdAccountLock(
    locks,
    "alice",
    () => {
      owners.push("second");
      return () => {};
    },
    () => {},
  );
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(owners).toEqual(["first"]);
  first();
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(owners).toEqual(["first", "closed first", "second"]);
  second();
});
it("does not start a queued tab after it has unmounted", async () => {
  let callback: (() => Promise<void>) | undefined;
  let started = false;
  const locks = {
    request: (_name: string, _options: unknown, cb: () => Promise<void>) => {
      callback = cb;
      return Promise.resolve();
    },
  } as unknown as LockManager;
  const stop = holdAccountLock(
    locks,
    "alice",
    () => {
      started = true;
      return () => {};
    },
    () => {},
  );
  stop();
  await callback!();
  expect(started).toBe(false);
});
