import { freshProgress, normalizeProgress, type Progress } from "./progress";
export type RemoteProgress = { payload: Progress; revision: number };
export type StoredProgress = RemoteProgress & { pending: boolean };
export type SyncState = {
  progress: Progress;
  status: string;
  conflict: boolean;
};
export type ProgressRemote = {
  read: () => Promise<RemoteProgress | null>;
  write: (payload: Progress, revision: number) => Promise<number | null>;
};
export const accountKey = (id: string) => `idiomas:account:${id}`;

/** One serialized writer per mounted account; server CAS guards other tabs/devices. */
export class ProgressSync {
  private value: StoredProgress;
  private active = true;
  private running = false;
  private sequence = 0;
  private conflict = false;
  private storageFailed = false;
  constructor(
    private id: string,
    private storage: Pick<Storage, "getItem" | "setItem">,
    private remote: ProgressRemote,
    private notify: (state: SyncState) => void,
  ) {
    let raw: Partial<StoredProgress> | null = null;
    let legacy: string | null = null;
    try {
      raw = JSON.parse(storage.getItem(accountKey(id)) || "null");
      legacy = storage.getItem(`idiomas:${id}`);
    } catch {
      /* A blocked store must not prevent cloud reads. */
    }
    let payload = freshProgress();
    try {
      payload = normalizeProgress(
        raw?.payload ?? (legacy ? JSON.parse(legacy) : null),
      );
    } catch {
      /* Keep a usable empty account. */
    }
    this.value = {
      payload,
      revision:
        Number.isSafeInteger(raw?.revision) && raw!.revision! >= 0
          ? raw!.revision!
          : 0,
      pending: raw?.pending === true || (!raw && !!legacy),
    };
  }
  private publish(status: string) {
    if (this.active)
      this.notify({
        progress: this.value.payload,
        status: this.storageFailed
          ? `${status} No se pudo guardar la copia en este navegador.`
          : status,
        conflict: this.conflict,
      });
  }
  private persist() {
    try {
      this.storage.setItem(accountKey(this.id), JSON.stringify(this.value));
      this.storageFailed = false;
    } catch {
      this.storageFailed = true;
    }
  }
  update(fn: (p: Progress) => Progress) {
    this.value = {
      ...this.value,
      payload: fn(this.value.payload),
      pending: true,
    };
    this.sequence++;
    this.persist();
    this.publish(
      this.conflict
        ? "Hay otra versión en tu cuenta. Elige cuál conservar desde Ajustes."
        : "Guardando progreso…",
    );
  }
  dispose() {
    this.active = false;
  }
  async sync() {
    if (!this.active || this.running || this.conflict) return;
    this.running = true;
    try {
      if (!this.value.pending) {
        const sequence = this.sequence;
        const server = await this.remote.read();
        if (!this.active) return;
        // An edit made while loading is based on the old revision; never replace it.
        if (this.sequence === sequence) {
          this.value = {
            payload: server
              ? normalizeProgress(server.payload)
              : this.value.payload,
            revision: server?.revision ?? 0,
            pending: false,
          };
          this.persist();
        }
      }
      while (this.active && this.value.pending) {
        const sequence = this.sequence;
        const revision = await this.remote.write(
          this.value.payload,
          this.value.revision,
        );
        if (!this.active) return;
        if (revision === null) {
          this.conflict = true;
          this.publish(
            "Hay otra versión en tu cuenta. Elige cuál conservar desde Ajustes.",
          );
          return;
        }
        this.value = {
          ...this.value,
          revision,
          pending: sequence !== this.sequence,
        };
        this.persist();
      }
      this.publish("Sincronizado con tu cuenta");
    } catch {
      this.publish(
        this.value.pending
          ? "Cambios pendientes de sincronizar. Reintenta desde Ajustes al recuperar la conexión."
          : "No se pudo cargar tu progreso. Reintenta desde Ajustes.",
      );
    } finally {
      this.running = false;
    }
  }
  async resolve(choice: "local" | "remote") {
    if (!this.active || this.running) return;
    this.running = true;
    const sequence = this.sequence;
    try {
      const server = await this.remote.read();
      if (!this.active) return;
      if (sequence !== this.sequence) {
        this.publish(
          "El progreso cambió mientras elegías. Vuelve a elegir la versión.",
        );
        return;
      }
      // Preserve both candidates before either explicit replacement. Abort if backup fails.
      this.storage.setItem(
        `${accountKey(this.id)}:backup`,
        JSON.stringify({ local: this.value, remote: server }),
      );
      this.value = {
        payload:
          choice === "remote"
            ? normalizeProgress(server?.payload ?? freshProgress())
            : this.value.payload,
        revision: server?.revision ?? 0,
        pending: choice === "local",
      };
      this.conflict = false;
      this.persist();
      this.publish(
        choice === "local"
          ? "Guardando la versión de este dispositivo…"
          : "Sincronizado con tu cuenta",
      );
    } catch {
      this.publish(
        "No se pudo resolver. Conservamos tu progreso; comprueba la conexión y el almacenamiento.",
      );
    } finally {
      this.running = false;
    }
    if (!this.conflict) await this.sync();
  }
}
