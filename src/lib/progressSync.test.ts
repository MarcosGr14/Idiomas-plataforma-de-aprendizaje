import { describe, it, expect } from "vitest";
import {
  ProgressSync,
  accountKey,
  type RemoteProgress,
  type SyncState,
} from "./progressSync";
import { freshProgress, completeLesson, xp } from "./progress";
const store = () => {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
};
function setup() {
  let row: RemoteProgress | null = null;
  let offline = false;
  const remote = {
    read: async () => {
      if (offline) throw Error("offline");
      return row;
    },
    write: async (payload: RemoteProgress["payload"], revision: number) => {
      if (offline) throw Error("offline");
      if (revision !== (row?.revision ?? 0)) return null;
      row = { payload, revision: revision + 1 };
      return row.revision;
    },
  };
  return {
    remote,
    row: () => row,
    offline: (value: boolean) => {
      offline = value;
    },
  };
}
describe("account progress synchronization", () => {
  it("normalizes malformed cloud fields before exposing progress", async () => {
    let state: SyncState | undefined;
    const sync = new ProgressSync(
      "alice",
      store(),
      {
        read: async () => ({
          payload: {
            ...freshProgress(),
            reviews: { bad: null },
            activity: { "2026-10-26": "oops" },
          } as unknown as RemoteProgress["payload"],
          revision: 1,
        }),
        write: async () => 2,
      },
      (s) => {
        state = s;
      },
    );
    await sync.sync();
    expect(state?.progress.reviews).toEqual({});
    expect(xp(state!.progress)).toBe(0);
  });
  it("does not send a corrupt negative revision to the server", async () => {
    const storage = store();
    storage.setItem(
      accountKey("alice"),
      JSON.stringify({
        payload: freshProgress(),
        revision: -10,
        pending: true,
      }),
    );
    let sent: number | undefined;
    const sync = new ProgressSync(
      "alice",
      storage,
      {
        read: async () => null,
        write: async (_, revision) => {
          sent = revision;
          return 1;
        },
      },
      () => {},
    );
    await sync.sync();
    expect(sent).toBe(0);
  });

  it("keeps guest and different accounts isolated", async () => {
    const storage = store();
    const { remote } = setup();
    storage.setItem(
      "idiomas:guest",
      JSON.stringify({ ...freshProgress(), goal: 20 }),
    );
    let state: SyncState | undefined;
    const sync = new ProgressSync("alice", storage, remote, (s) => {
      state = s;
    });
    await sync.sync();
    expect(state?.progress.goal).toBe(10);
    sync.update((p) => ({ ...p, goal: 5 }));
    await sync.sync();
    expect(storage.getItem(accountKey("bob"))).toBeNull();
    expect(JSON.parse(storage.getItem("idiomas:guest")!).goal).toBe(20);
  });
  it("persists offline changes across logout/reload and retries them", async () => {
    const storage = store();
    const server = setup();
    const first = new ProgressSync("alice", storage, server.remote, () => {});
    await first.sync();
    server.offline(true);
    first.update((p) =>
      completeLesson(p, "first", 100, [], new Date(2026, 9, 24)),
    );
    await first.sync();
    first.dispose();
    expect(JSON.parse(storage.getItem(accountKey("alice"))!).pending).toBe(
      true,
    );
    server.offline(false);
    const second = new ProgressSync("alice", storage, server.remote, () => {});
    await second.sync();
    expect(xp(server.row()!.payload)).toBe(30);
    expect(JSON.parse(storage.getItem(accountKey("alice"))!).pending).toBe(
      false,
    );
  });
  it("never overwrites another device silently; explicit choice saves both backups", async () => {
    const server = setup();
    const one = store(),
      two = store();
    let state: SyncState | undefined;
    const a = new ProgressSync("alice", one, server.remote, () => {});
    const b = new ProgressSync("alice", two, server.remote, (s) => {
      state = s;
    });
    await a.sync();
    await b.sync();
    a.update((p) => ({ ...p, goal: 20 }));
    await a.sync();
    b.update((p) => ({ ...p, goal: 5 }));
    await b.sync();
    expect(state?.conflict).toBe(true);
    expect(server.row()!.payload.goal).toBe(20);
    await b.resolve("local");
    expect(server.row()!.payload.goal).toBe(5);
    const backup = JSON.parse(two.getItem(`${accountKey("alice")}:backup`)!);
    expect(backup.remote.payload.goal).toBe(20);
    expect(backup.local.payload.goal).toBe(5);
  });
  it("can use the cloud version without combining XP", async () => {
    const server = setup();
    const storage = store();
    const a = new ProgressSync("alice", store(), server.remote, () => {});
    let state: SyncState | undefined;
    const b = new ProgressSync("alice", storage, server.remote, (s) => {
      state = s;
    });
    await a.sync();
    await b.sync();
    const lesson = (p: ReturnType<typeof freshProgress>) =>
      completeLesson(p, "same", 100, []);
    a.update(lesson);
    b.update(lesson);
    await a.sync();
    await b.sync();
    await b.resolve("remote");
    expect(state?.conflict).toBe(false);
    expect(xp(state!.progress)).toBe(30);
  });
  it("serializes edits arriving while a request is in flight", async () => {
    const server = setup();
    let release: (() => void) | undefined;
    const remote = {
      ...server.remote,
      write: async (p: RemoteProgress["payload"], revision: number) => {
        if (revision === 0)
          await new Promise<void>((resolve) => {
            release = resolve;
          });
        return server.remote.write(p, revision);
      },
    };
    const sync = new ProgressSync("alice", store(), remote, () => {});
    await sync.sync();
    sync.update((p) => ({ ...p, goal: 5 }));
    const saving = sync.sync();
    sync.update((p) => ({ ...p, goal: 20 }));
    release!();
    await saving;
    expect(server.row()!.payload.goal).toBe(20);
    expect(server.row()!.revision).toBe(2);
  });
  it("ignores late responses after changing account", async () => {
    let release: ((value: RemoteProgress | null) => void) | undefined;
    let notifications = 0;
    const sync = new ProgressSync(
      "alice",
      store(),
      {
        read: () =>
          new Promise((resolve) => {
            release = resolve;
          }),
        write: async () => 1,
      },
      () => {
        notifications++;
      },
    );
    const loading = sync.sync();
    sync.dispose();
    release!({ payload: freshProgress(), revision: 1 });
    await loading;
    expect(notifications).toBe(0);
  });
  it("does not overwrite existing cloud progress after a failed initial read", async () => {
    const server = setup();
    await server.remote.write({ ...freshProgress(), goal: 20 }, 0);
    server.offline(true);
    const sync = new ProgressSync("alice", store(), server.remote, () => {});
    await sync.sync();
    sync.update((p) => ({ ...p, goal: 5 }));
    server.offline(false);
    await sync.sync();
    expect(server.row()!.payload.goal).toBe(20);
  });
  it("still saves remotely when browser storage is blocked, with an honest status", async () => {
    const server = setup();
    let state: SyncState | undefined;
    const sync = new ProgressSync(
      "alice",
      {
        getItem: () => {
          throw Error();
        },
        setItem: () => {
          throw Error();
        },
      },
      server.remote,
      (s) => {
        state = s;
      },
    );
    await sync.sync();
    sync.update((p) => ({ ...p, goal: 20 }));
    await sync.sync();
    expect(server.row()!.payload.goal).toBe(20);
    expect(state?.status).toContain("No se pudo guardar la copia");
  });
});

it("preserves assessment rewards and retry protection through account sync and reload", async () => {
  const { recordAssessment } = await import("./progress");
  const storage = store(),
    server = setup();
  const attempt = {
    mode: "semanal" as const,
    period: "semanal:2026-W44",
    score: 80,
    total: 10,
    attemptId: "saved-attempt",
    mistakes: ["vocales:0"],
  };
  const first = new ProgressSync("alice", storage, server.remote, () => {});
  await first.sync();
  first.update((p) => recordAssessment(p, attempt, new Date(2026, 9, 27, 12)));
  await first.sync();
  let latest: SyncState | undefined;
  const second = new ProgressSync("alice", storage, server.remote, (s) => {
    latest = s;
  });
  await second.sync();
  expect(latest?.progress.exams[attempt.period]).toMatchObject({
    score: 80,
    rewarded: true,
    mistakes: ["vocales:0"],
  });
  second.update((p) => recordAssessment(p, attempt, new Date(2026, 9, 27, 12)));
  await second.sync();
  expect(xp(latest!.progress)).toBe(50);
  expect(latest?.progress.exams[attempt.period].attempts).toBe(1);
});

it("retains local progress when remote revisions are malformed", async () => {
  for (const revision of [-1, 0, NaN, 1.5, Number.MAX_SAFE_INTEGER + 1, "1"]) {
    const storage = store();
    storage.setItem(
      accountKey("alice"),
      JSON.stringify({
        payload: { ...freshProgress(), goal: 20 },
        revision: 1,
        pending: false,
      }),
    );
    let state: SyncState | undefined;
    const write = async () => {
      throw Error("must not write");
    };
    const sync = new ProgressSync(
      "alice",
      storage,
      {
        read: async () =>
          ({ payload: freshProgress(), revision }) as RemoteProgress,
        write,
      },
      (s) => {
        state = s;
      },
    );
    await sync.sync();
    expect(state?.progress.goal).toBe(20);
    expect(state?.status).toContain("No se pudo cargar");
  }
});
it("does not acknowledge invalid write revisions and protects unsaved changes from reload", async () => {
  for (const revision of [-1, 0, NaN, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    let state: SyncState | undefined;
    const sync = new ProgressSync(
      "alice",
      {
        getItem: () => null,
        setItem: () => {
          throw Error("full");
        },
      },
      { read: async () => null, write: async () => revision },
      (s) => {
        state = s;
      },
    );
    await sync.sync();
    sync.update((p) => ({ ...p, goal: 20 }));
    expect(state?.reloadSafe).toBe(false);
    await sync.sync();
    expect(state?.progress.goal).toBe(20);
    expect(state?.reloadSafe).toBe(false);
    expect(state?.status).toContain("pendientes");
  }
});
it("permits reload once progress has reached the cloud even with blocked local storage", async () => {
  let state: SyncState | undefined;
  const server = setup();
  const sync = new ProgressSync(
    "alice",
    {
      getItem: () => null,
      setItem: () => {
        throw Error("blocked");
      },
    },
    server.remote,
    (s) => {
      state = s;
    },
  );
  await sync.sync();
  sync.update((p) => ({ ...p, goal: 20 }));
  expect(state?.reloadSafe).toBe(false);
  await sync.sync();
  expect(state?.reloadSafe).toBe(true);
});

it("ignores delayed edits after the account controller has been disposed", async () => {
  const storage = store(),
    server = setup();
  const sync = new ProgressSync("alice", storage, server.remote, () => {});
  await sync.sync();
  const before = storage.getItem(accountKey("alice"));
  sync.dispose();
  let called = false;
  sync.update((p) => {
    called = true;
    return { ...p, goal: 20 };
  });
  expect(called).toBe(false);
  expect(storage.getItem(accountKey("alice"))).toBe(before);
  expect(server.row()).toBeNull();
});
