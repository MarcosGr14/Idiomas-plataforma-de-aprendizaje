/** Only one tab may own an account's local pending copy at a time. */
export function holdAccountLock(
  locks: Pick<LockManager, "request">,
  id: string,
  start: () => () => void,
  failed: () => void,
) {
  const abort = new AbortController();
  let release: (() => void) | undefined;
  let stop: (() => void) | undefined;
  void locks
    .request(`idiomas:progress:${id}`, { signal: abort.signal }, async () => {
      if (abort.signal.aborted) return;
      stop = start();
      await new Promise<void>((resolve) => {
        release = resolve;
      });
    })
    .catch(() => {
      if (!abort.signal.aborted) failed();
    });
  return () => {
    abort.abort();
    stop?.();
    release?.();
  };
}
