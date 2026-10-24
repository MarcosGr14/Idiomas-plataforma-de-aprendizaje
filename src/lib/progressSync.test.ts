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
