export type MotionMode = "full" | "reduced" | "off";
export type DeviceHints = {
  reduce?: boolean;
  saveData?: boolean;
  memory?: number;
  cores?: number;
  webgl?: boolean;
};
export function normalizeMotion(
  value: unknown,
  legacy = false,
): MotionMode | undefined {
  return value === "full" || value === "reduced" || value === "off"
    ? value
    : legacy
      ? "reduced"
      : undefined;
}
export function resolveMotion(
  preference: MotionMode | undefined,
  hints: DeviceHints,
): MotionMode {
  if (hints.webgl === false || hints.reduce) return "off";
  if (preference) return preference;
  return hints.saveData ||
    (hints.memory !== undefined && hints.memory <= 4) ||
    (hints.cores !== undefined && hints.cores <= 4)
    ? "reduced"
    : "full";
}
export function downgradeMotion(
  mode: MotionMode,
  fps: number,
  samples: number,
): MotionMode {
  if (samples < 90 || fps >= 28) return mode;
  return mode === "full" ? "reduced" : "off";
}
