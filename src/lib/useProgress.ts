import { captureEnabled } from "./capture";
import { createDemoProgress } from "./demo";
import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import {
  readProgress,
  saveProgress,
  normalizeProgress,
  type Progress,
} from "./progress";
import { holdAccountLock } from "./accountLock";
import { ProgressSync } from "./progressSync";

export function useProgress() {
  const [user, setUser] = useState<User | null>(
    captureEnabled
      ? {
          id: "demo-capture",
          email: "demo@idiomas.example",
          app_metadata: {},
          user_metadata: { name: "Estudiante demo" },
          aud: "demo",
          created_at: "2026-10-23T17:00:00Z",
        }
      : null,
  );
  const [progress, setProgress] = useState<Progress>(() =>
    captureEnabled ? createDemoProgress() : readProgress("idiomas:guest"),
  );
  const progressRef = useRef(progress);
  const [authReady, setAuthReady] = useState(!supabase);
  const [ready, setReady] = useState(!supabase);
  const [status, setStatus] = useState(
    captureEnabled
      ? "Demostración · datos de ejemplo"
      : supabase
        ? "Cargando cuenta…"
        : "Guardado en este dispositivo",
  );
  const [reloadSafe, setReloadSafe] = useState(true);
  const [conflict, setConflict] = useState(false);
  const controller = useRef<ProgressSync | null>(null);
  const activeId = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const id = session?.user?.id ?? null;
      if (id !== activeId.current) {
        controller.current?.dispose();
        controller.current = null;
        setReady(false);
      }
      setUser(session?.user ?? null);
      setAuthReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (captureEnabled || !authReady) return;
    const id = user?.id ?? null;
    activeId.current = id;
    setConflict(false);
    if (!id || !supabase) {
      const local = readProgress("idiomas:guest");
      progressRef.current = local;
      setProgress(local);
      setReloadSafe(true);
      setReady(true);
      setStatus("Guardado en este dispositivo");
      return;
    }
    const client = supabase;
    let active = true;
    setReady(false);
    setStatus(
      "Si tienes esta cuenta abierta en otra pestaña, ciérrala para continuar aquí.",
    );
    if (!navigator.locks) {
      setStatus(
        "Para guardar tu cuenta de forma segura, abre la web por HTTPS en un navegador actualizado.",
      );
      return;
    }
    const unlock = holdAccountLock(
      navigator.locks,
      id,
      () => {
        // Access storage lazily: some privacy settings throw even on window.localStorage.
        const storage = {
          getItem: (key: string) => localStorage.getItem(key),
          setItem: (key: string, value: string) =>
            localStorage.setItem(key, value),
        };
        const sync = new ProgressSync(
          id,
          storage,
          {
            read: async () => {
              const { data, error } = await client
                .from("learning_progress")
                .select("payload,revision")
                .eq("user_id", id)
                .maybeSingle();
              if (error) throw error;
              return data
                ? {
                    payload: normalizeProgress(data.payload),
                    revision: data.revision,
                  }
                : null;
            },
            write: async (payload, revision) => {
              const { data, error } = await client.rpc(
                "save_learning_progress",
                {
                  expected_revision: revision,
                  new_payload: payload,
                },
              );
              if (error) throw error;
              return typeof data === "number" ? data : null;
            },
          },
          (state) => {
            if (active) {
              progressRef.current = state.progress;
              setProgress(state.progress);
              setStatus(state.status);
              setConflict(state.conflict);
              setReloadSafe(state.reloadSafe);
            }
          },
        );
        controller.current = sync;
        setStatus("Cargando progreso…");
        void sync.sync().finally(() => {
          if (active) setReady(true);
        });
        const refresh = () => {
          if (document.visibilityState === "visible") void sync.sync();
        };
        window.addEventListener("online", refresh);
        window.addEventListener("focus", refresh);
        document.addEventListener("visibilitychange", refresh);
        return () => {
          active = false;
          sync.dispose();
          controller.current = null;
          if (timer.current) clearTimeout(timer.current);
          window.removeEventListener("online", refresh);
          window.removeEventListener("focus", refresh);
          document.removeEventListener("visibilitychange", refresh);
        };
      },
      () =>
        setStatus(
          "No se pudo abrir el progreso. Recarga la página para intentarlo de nuevo.",
        ),
    );
    return () => {
      active = false;
      unlock();
    };
  }, [user?.id, authReady]);
  const update = useCallback(
    (value: Progress | ((p: Progress) => Progress)) => {
      if (!ready) return;
      const fn = typeof value === "function" ? value : () => value;
      if (captureEnabled) {
        const next = fn(progressRef.current);
        progressRef.current = next;
        setProgress(next);
        return;
      }
      const sync = controller.current;
      if (user && !sync) return;
      if (sync) {
        sync.update(fn);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => void sync.sync(), 500);
      } else {
        const next = fn(progressRef.current);
        progressRef.current = next;
        setProgress(next);
        const saved = saveProgress("idiomas:guest", next);
        setReloadSafe(saved);
        setStatus(
          saved
            ? "Guardado en este dispositivo"
            : "No se pudo guardar. El almacenamiento está lleno o bloqueado.",
        );
      }
    },
    [ready, user],
  );
  return {
    user,
    progress,
    update,
    ready,
    status,
    conflict,
    reloadSafe,
    retry: () => void controller.current?.sync(),
    resolveSync: (choice: "local" | "remote") =>
      void controller.current?.resolve(choice),
  };
}
