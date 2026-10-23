/** Opt-in capture clock. Ordinary visits neither expose the bridge nor change time. */
export const captureEnabled =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("capture") === "1";
export const CAPTURE_DATE = "2026-10-23T12:00:00-05:00";
export const appNow = () =>
  captureEnabled ? new Date(CAPTURE_DATE) : new Date();
export type CaptureFrame = {
  time: number;
  pointerX: number;
  pointerY: number;
  scroll: number;
};
export function normalizeCaptureFrame(
  frame: Partial<CaptureFrame>,
): CaptureFrame {
  const finite = (n: number | undefined) => (Number.isFinite(n) ? n! : 0);
  const clamp = (n: number, min: number, max: number) =>
    Math.min(max, Math.max(min, n));
  return {
    time: Math.max(0, finite(frame.time)),
    pointerX: clamp(finite(frame.pointerX), -1, 1),
    pointerY: clamp(finite(frame.pointerY), -1, 1),
    scroll: clamp(finite(frame.scroll), 0, 1),
  };
}
let current = normalizeCaptureFrame({});
const renderers = new Set<(frame: CaptureFrame) => void>();
export function registerCaptureRenderer(render: (frame: CaptureFrame) => void) {
  if (!captureEnabled) return () => {};
  renderers.add(render);
  render(current);
  return () => {
    renderers.delete(render);
  };
}
declare global {
  interface Window {
    __IDIOMAS_CAPTURE__?: {
      setFrame: (frame: Partial<CaptureFrame>) => void;
      readonly rendererCount: number;
      readonly frame: CaptureFrame;
    };
  }
}
if (captureEnabled) {
  document.documentElement.dataset.capture = "true";
  window.__IDIOMAS_CAPTURE__ = {
    setFrame(frame) {
      current = normalizeCaptureFrame(frame);
      renderers.forEach((render) => render(current));
    },
    get rendererCount() {
      return renderers.size;
    },
    get frame() {
      return { ...current };
    },
  };
}
