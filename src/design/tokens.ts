/** Brand authority shared by the web and all promotional compositions. */
export const brand = {
  colors: {
    paper: "#FBF8F3",
    ink: "#14110F",
    red: "#C8102E",
    muted: "#64685e",
    night: "#151715",
    white: "#ffffff",
    amber: "#efbd3a",
    orange: "#d74b30",
    inactive: "#b0aaa2",
    bezel: "#262a29",
    metal: "#aab0ad",
    foot: "#989f9a",
    camera: "#080b0a",
    shadow: "#14110F26",
    introMuted: "#b7b8ae",
  },
  fonts: {
    body: "Manrope Variable",
    japanese: "Noto Serif JP",
    calligraphy: "Yuji Boku",
  },
} as const;
export const motion = {
  fps: 30,
  intro: 105,
  wipe: 22,
  underline: 11,
  words: 14,
  wordStagger: 2,
  enter: { damping: 21, stiffness: 155, mass: 0.85 },
  seal: { damping: 11, stiffness: 190, mass: 0.8 },
  ease: [0.16, 1, 0.3, 1],
  heading: {
    landscape: { x: 110, y: 75, width: 1500 },
    vertical: { x: 80, y: 110, width: 920 },
  },
  sceneDurations: [105, 165, 180, 240, 180, 150, 180],
} as const;
