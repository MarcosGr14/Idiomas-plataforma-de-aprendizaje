export type UpdateState = {
  available: boolean;
  busy: boolean;
  error: string;
  dismissed: boolean;
};
/** An explicit reload only: repeated clicks and failed activation never discard a draft. */
export class AppUpdate {
  private state: UpdateState = {
    available: false,
    busy: false,
    error: "",
    dismissed: false,
  };
  private listeners = new Set<() => void>();
  private timer: ReturnType<typeof setTimeout> | undefined;
  constructor(private activate: () => Promise<void>) {}
  snapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private set(value: Partial<UpdateState>) {
    this.state = { ...this.state, ...value };
    this.listeners.forEach((listener) => listener());
  }
  ready = () => this.set({ available: true, dismissed: false, error: "" });
  dismiss = () => this.set({ dismissed: true });
  async apply(allowed: boolean) {
    if (!this.state.available || this.state.busy) return;
    if (!allowed) {
      this.set({
        error:
          "El progreso todavía no tiene una copia segura. Reintenta el guardado antes de actualizar.",
        dismissed: false,
      });
      return;
    }
    this.set({ busy: true, error: "", dismissed: false });
    this.timer = setTimeout(() => this.failed(), 15000);
    try {
      await this.activate();
    } catch {
      this.failed();
    }
  }
  private failed() {
    clearTimeout(this.timer);
    this.set({
      busy: false,
      error:
        "No se pudo aplicar la actualización. Tu progreso sigue aquí; vuelve a intentarlo.",
    });
  }
}
