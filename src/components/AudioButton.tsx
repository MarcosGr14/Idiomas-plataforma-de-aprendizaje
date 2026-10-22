import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
export default function AudioButton({
  text,
  slow = false,
}: {
  text: string;
  slow?: boolean;
}) {
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  useEffect(
    () => () => {
      window.speechSynthesis?.cancel();
    },
    [],
  );
  function play() {
    setError("");
    if (!("speechSynthesis" in window)) {
      setError("Este navegador no ofrece audio de voz. Prueba otro navegador.");
      return;
    }
    const voice = window.speechSynthesis
      .getVoices()
      .find((v) => v.lang.startsWith("ja"));
    if (!voice) {
      setError(
        "No hay una voz japonesa disponible en este dispositivo. Instala una voz japonesa o prueba otro navegador.",
      );
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.voice = voice;
    utterance.rate = slow ? 0.65 : 0.85;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => {
      setPlaying(false);
      setError("No se pudo reproducir. Inténtalo de nuevo.");
    };
    setPlaying(true);
    window.speechSynthesis.speak(utterance);
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
