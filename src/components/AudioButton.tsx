import { useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import { words } from "../data/course";
let current: HTMLAudioElement | null = null;
export default function AudioButton({
  text,
  slow = false,
}: {
  text: string;
  slow?: boolean;
}) {
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  const own = useRef<HTMLAudioElement | null>(null);
  useEffect(
    () => () => {
      own.current?.pause();
      if (current === own.current) current = null;
    },
    [],
  );
  async function play() {
    setError("");
    const word = words.find((w) => w.jp === text);
    if (!word) {
      setError("Este audio aún no está disponible.");
      return;
    }
    current?.pause();
    const audio = new Audio(`/audio/${word.id}.mp3`);
    own.current = audio;
    current = audio;
    audio.playbackRate = slow ? 0.75 : 1;
    audio.onended = () => setPlaying(false);
    audio.onpause = () => setPlaying(false);
    audio.onerror = () => {
      setPlaying(false);
      setError(
        "No se pudo cargar el audio. Comprueba tu conexión e inténtalo otra vez.",
      );
    };
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
      setError("No se pudo reproducir el audio. Vuelve a pulsar Escuchar.");
    }
  }
  return (
    <span className="audio-wrap">
      <button
        type="button"
        className="audio-button"
        aria-label={`${slow ? "Escuchar lento" : "Escuchar"}: ${text}`}
        onClick={play}
      >
        <Volume2 size={18} />
        {playing ? "Reproduciendo…" : slow ? "Lento" : "Escuchar"}
      </button>
      {error && (
        <span role="status" className="audio-error">
          {error}
        </span>
      )}
    </span>
  );
}
