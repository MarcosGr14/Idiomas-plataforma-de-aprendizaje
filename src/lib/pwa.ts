import { registerSW } from "virtual:pwa-register";
import { AppUpdate } from "./appUpdate";
import { captureEnabled } from "./capture";
let activate: () => Promise<void> = async () => {};
export const appUpdate = new AppUpdate(() => activate());
let registration: ServiceWorkerRegistration | undefined;
let lastCheck = 0;
let checking = false;
let reloadRequired = false;
export async function checkAppUpdate() {
  if (!navigator.onLine) return "offline";
  if (!registration || checking) return "unavailable";
  checking = true;
  lastCheck = Date.now();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      registration.update(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("Update check timed out")),
          15000,
        );
      }),
    ]);
    return "checked";
  } catch {
    return "unavailable";
  } finally {
    clearTimeout(timer);
    checking = false;
  }
}
if (!captureEnabled) {
  const updateWorker = registerSW({
    onNeedReload() {
      reloadRequired = true;
      if (appUpdate.snapshot().busy) window.location.reload();
      else appUpdate.ready();
    },
    immediate: true,
    onNeedRefresh: appUpdate.ready,
    onRegisteredSW(_url, value) {
      registration = value;
    },
    onRegisterError() {
      /* Registration is optional: local and cloud learning still work. */
    },
  });
  activate = async () => {
    if (reloadRequired) window.location.reload();
    else await updateWorker();
  };
  window.addEventListener("focus", () => {
    if (Date.now() - lastCheck >= 30 * 60 * 1000) void checkAppUpdate();
  });
  window.addEventListener("online", () => void checkAppUpdate());
}
