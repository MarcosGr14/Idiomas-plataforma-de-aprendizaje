import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import {
  readProgress,
  saveProgress,
  normalizeProgress,
  type Progress,
} from "./progress";
export function useProgress() {
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<Progress>(() =>
    readProgress("idiomas:guest"),
  );
  const [ready, setReady] = useState(!supabase);
  const [status, setStatus] = useState(
    supabase ? "Cargando cuenta…" : "Guardado en este dispositivo",
  );
  const key = useRef("idiomas:guest");
  const currentUser = useRef<string | null>(null);
  const changed = useRef(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if ((session?.user?.id ?? null) !== currentUser.current) setReady(false);
      setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    let cancelled = false;
    const id = user?.id ?? null;
    currentUser.current = id;
    key.current = id ? `idiomas:${id}` : "idiomas:guest";
    changed.current = false;
    const local = readProgress(key.current);
    setProgress(local);
    if (!id || !supabase) {
      setReady(true);
      setStatus("Guardado en este dispositivo");
      return;
    }
    setStatus("Cargando progreso…");
    supabase
      .from("learning_progress")
      .select("payload")
      .eq("user_id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setStatus(
            "Sin conexión con el progreso. Cambios guardados solo aquí.",
          );
        } else {
          const payload = data ? normalizeProgress(data.payload) : local;
          setProgress(payload);
          saveProgress(key.current, payload);
          setStatus("Sincronizado con tu cuenta");
        }
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);
  const update = useCallback(
    (value: Progress | ((p: Progress) => Progress)) => {
      if (!ready) return;
      changed.current = true;
      setProgress((p) => (typeof value === "function" ? value(p) : value));
      setRevision((r) => r + 1);
    },
    [ready],
  );
  useEffect(() => {
    if (!ready || !changed.current) return;
    const saved = saveProgress(key.current, progress);
    if (!saved) {
      setStatus(
        "No se pudo guardar. El almacenamiento está lleno o bloqueado.",
      );
      return;
    }
    if (!user || !supabase) {
      setStatus("Guardado en este dispositivo");
      return;
    }
    const id = user.id;
    const client = supabase;
    setStatus("Guardando…");
    const timer = setTimeout(() => {
      client
        .from("learning_progress")
        .upsert({
          user_id: id,
          payload: progress,
          updated_at: new Date().toISOString(),
        })
        .then(({ error }) => {
          if (currentUser.current !== id) return;
          setStatus(
            error
              ? "Guardado aquí. No se pudo sincronizar; reintenta desde Ajustes."
              : "Sincronizado con tu cuenta",
          );
        });
    }, 500);
    return () => clearTimeout(timer);
  }, [progress, ready, user, revision]);
  return {
    user,
    progress,
    update,
    ready,
    status,
    retry: () => {
      changed.current = true;
      setRevision((r) => r + 1);
    },
  };
}
