import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Sequence,
  OffthreadVideo,
  Img,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
  delayRender,
  continueRender,
  Freeze,
  Easing,
  cancelRender,
} from "remotion";
import "./style.css";
import { brand, motion } from "../../src/design/tokens";
import { BrandStyles, BrandSeal } from "../../src/components/brand/BrandStyles";
import {
  InkBrush,
  InkCharacter,
  InkCalligraphy,
} from "../../src/components/InkBrush";
import { maplePoints } from "../../src/design/maple";
export const scenes = [...motion.sceneDurations];
const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};
function Words({ children, delay = 8 }: { children: string; delay?: number }) {
  const f = useCurrentFrame();
  return (
    <>
      {children.split(" ").map((w, i) => (
        <span className="word" key={i}>
          <span
            style={{
              transform: `translateY(${interpolate(f, [delay + i * motion.wordStagger, delay + i * motion.wordStagger + motion.words], [110, 0], { ...clamp, easing: Easing.bezier(...motion.ease) })}%)`,
            }}
          >
            {w}&nbsp;
          </span>
        </span>
      ))}
    </>
  );
}
function Media({ name, still = false }: { name: string; still?: boolean }) {
  const f = useCurrentFrame();
  const length =
    name.startsWith("hero") || name.startsWith("modes")
      ? 150
      : name.startsWith("writing")
        ? 120
        : name.startsWith("lesson") || name.startsWith("audio")
          ? 60
          : 90;
  return still ? (
    <Img
      src={staticFile(`captures/${name}.png`)}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  ) : (
    <Freeze frame={Math.min(f, length - 1)}>
      <OffthreadVideo
        muted
        src={staticFile(`captures/${name}.mp4`)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </Freeze>
  );
}
function Device({
  type,
  name,
  still = false,
  width,
  style = {},
}: {
  type: "phone" | "laptop" | "desktop";
  name: string;
  still?: boolean;
  width: number;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`device ${type}`} style={{ width, ...style }}>
      <div className="bezel">
        <div className="screen">
          <Media name={name} still={still} />
        </div>
        <div className="camera" />
      </div>
      {type === "laptop" ? (
        <div className="base" />
      ) : type === "desktop" ? (
        <>
          <div className="neck" />
          <div className="foot" />
        </>
      ) : null}
    </div>
  );
}
function Scene({
  id,
  vertical,
  publicUrl,
}: {
  id: number;
  vertical: boolean;
  publicUrl?: string;
}) {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  const v = vertical;
  const enter = spring({
    frame: f,
    fps,
    config: motion.enter,
  });
  const deviceStyle = {
    transform: `translateY(${(1 - enter) * 135}px) scale(${0.88 + enter * 0.12}) rotate(${(1 - enter) * (id % 2 ? 3 : -3)}deg)`,
  };
  const position =
    motion.heading[
      id === 1
        ? v
          ? "heroVertical"
          : "heroLandscape"
        : !v && (id === 3 || id === 5)
          ? "aside"
          : v
            ? "vertical"
            : "landscape"
    ];
  const heading = (text: string, sub?: string) => (
    <div
      className="heading"
      style={{ left: position.x, top: position.y, width: position.width }}
    >
      <h1>
        <Words>{text.substring(0, text.lastIndexOf(" "))}</Words>{" "}
        <span className="keyword">
          <Words delay={16}>{text.substring(text.lastIndexOf(" ") + 1)}</Words>
          <svg viewBox="0 0 300 24" preserveAspectRatio="none">
            <InkBrush
              points={[
                [4, 13],
                [60, 10],
                [130, 12],
                [205, 9],
                [292, 14],
              ]}
              progress={interpolate(
                f,
                [25, 25 + motion.underline],
                [0, 1],
                clamp,
              )}
              width={12}
              color={brand.colors.red}
              seed={40 + id}
              dry={0.8}
            />
          </svg>
        </span>
      </h1>
      {sub && (
        <p style={{ opacity: interpolate(f, [24, 40], [0, 1], clamp) }}>
          {sub}
        </p>
      )}
    </div>
  );
  return (
    <AbsoluteFill className={`scene scene-${id} ${v ? "vertical" : ""}`}>
      {id === 0 && (
        <>
          <div
            className="brush-intro"
            style={{ transform: `scale(${1 + f * 0.00045})` }}
          >
            {(["日", "本", "語"] as const).map((c, i) => (
              <div className="brush-character" key={c}>
                <InkCalligraphy
                  character={c}
                  seed={300 + i * 30}
                  progress={interpolate(
                    f,
                    [[0, 18, 36][i], [18, 36, 78][i]],
                    [0, 1],
                    clamp,
                  )}
                />
              </div>
            ))}
          </div>
          <div className="intro-seal">
            <Stamp frame={f - 66} size={v ? 130 : 145} />
          </div>
          <div className="intro-line">
            <svg viewBox="0 0 1000 50" preserveAspectRatio="none">
              <InkBrush
                points={[
                  [0, 22],
                  [180, 16],
                  [380, 24],
                  [650, 17],
                  [990, 24],
                ]}
                progress={interpolate(f, [65, 82], [0, 1], clamp)}
                color={brand.colors.red}
                width={22}
                seed={901}
                splashes={2}
                dry={0.8}
              />
            </svg>
          </div>
        </>
      )}
      {id === 1 && (
        <>
          <AbsoluteFill
            style={{ transform: `scale(${1.02 + (f / 187) * 0.095})` }}
          >
            <Media name={v ? "hero-mobile" : "hero-desktop"} />
          </AbsoluteFill>
          <div className="hero-scrim" />
          {heading("Un mundo nuevo. Empieza en japonés.")}
        </>
      )}
      {id === 2 && (
        <>
          {heading(
            "Encuentra tu punto de partida.",
            "Un diagnóstico. Tu propio camino.",
          )}
          <div className="main-device" style={deviceStyle}>
            {v ? (
              <>
                <Sequence durationInFrames={90}>
                  <Device type="phone" name="home-mobile" width={650} />
                </Sequence>
                <Sequence from={90}>
                  <Device type="phone" name="diagnostic-mobile" width={650} />
                </Sequence>
              </>
            ) : (
              <>
                <Sequence durationInFrames={90}>
                  <Device type="laptop" name="home-desktop" width={1140} />
                </Sequence>
                <Sequence from={90}>
                  <Device
                    type="laptop"
                    name="diagnostic-desktop"
                    width={1140}
                  />
                </Sequence>
              </>
            )}
          </div>
        </>
      )}
      {id === 3 && (
        <>
          {heading(
            "Escucha. Lee. Escribe.",
            "Una lección. Muchas formas de aprender.",
          )}
          <div className="main-device" style={deviceStyle}>
            <Sequence durationInFrames={60}>
              <Device type="phone" name="lesson-mobile" width={v ? 610 : 390} />
            </Sequence>
            <Sequence from={60} durationInFrames={120}>
              <Device
                type="phone"
                name="writing-mobile"
                width={v ? 610 : 390}
              />
            </Sequence>
            <Sequence from={180}>
              <Device type="phone" name="audio-mobile" width={v ? 610 : 390} />
            </Sequence>
          </div>
          {!v && (
            <div className="lesson-aside">
              <div className="ink-kana">
                <InkCharacter
                  character="い"
                  progress={interpolate(f, [62, 108], [0, 1], clamp)}
                  color={brand.colors.red}
                  width={9}
                  seed={700}
                />
              </div>
              <p>
                {f < 60
                  ? "Pequeñas lecciones."
                  : f < 180
                    ? "Practica a mano."
                    : "Escucha la pronunciación."}
              </p>
              {f >= 180 && (
                <div className="wave">
                  {Array.from({ length: 15 }, (_, i) => (
                    <i
                      key={i}
                      style={{
                        height: 14 + Math.abs(Math.sin(f * 0.2 + i * 0.6)) * 55,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
      {id === 4 && (
        <>
          {heading(
            "Cada día cuenta.",
            "Tu progreso. Tus palabras. Tu constancia.",
          )}
          <div className="main-device" style={deviceStyle}>
            {v ? (
              <>
                <Sequence durationInFrames={90}>
                  <Device type="phone" name="progress-mobile" width={620} />
                </Sequence>
                <Sequence from={90}>
                  <Device type="phone" name="library-mobile" width={620} />
                </Sequence>
              </>
            ) : (
              <>
                <Sequence durationInFrames={90}>
                  <Device type="desktop" name="progress-desktop" width={1050} />
                </Sequence>
                <Sequence from={90}>
                  <Device type="desktop" name="library-desktop" width={1050} />
                </Sequence>
              </>
            )}
          </div>
          <p className="demo">Datos de demostración</p>
        </>
      )}
      {id === 5 && (
        <>
          {heading("A tu ritmo.", "Movimiento completo, reducido o apagado.")}
          <div className="main-device" style={deviceStyle}>
            <Device type="phone" name="modes-mobile" width={v ? 600 : 370} />
          </div>
          {!v && (
            <div className="mode-copy">
              {["Completo", "Reducido", "Apagado"].map((s, i) => (
                <div
                  key={s}
                  style={{
                    color:
                      Math.floor(f / 50) === i
                        ? brand.colors.red
                        : brand.colors.inactive,
                    transform: `translateX(${Math.floor(f / 50) === i ? 12 : 0}px)`,
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {id === 6 && (
        <>
          <div className="closing">
            <div className="brand">
              <Stamp frame={f - 5} size={v ? 100 : 75} /> Idiomas.
            </div>
            <h1>
              <Words>Tu viaje empieza en japonés.</Words>
            </h1>
            {publicUrl && <p>{publicUrl}</p>}
          </div>
          <div className="trio" style={deviceStyle}>
            <Device
              type="desktop"
              name="progress-desktop"
              still
              width={v ? 710 : 880}
              style={{ position: "absolute", left: v ? 170 : 440, top: 0 }}
            />
            <Device
              type="laptop"
              name="home-still"
              still
              width={v ? 690 : 780}
              style={{ position: "absolute", left: 0, top: v ? 480 : 170 }}
            />
            <Device
              type="phone"
              name="mobile-still"
              still
              width={v ? 250 : 245}
              style={{
                position: "absolute",
                left: v ? 690 : 1240,
                top: v ? 390 : 105,
              }}
            />
          </div>
        </>
      )}
    </AbsoluteFill>
  );
}
function Stamp({ frame, size }: { frame: number; size: number }) {
  const { fps } = useVideoConfig();
  const value = spring({ frame: Math.max(0, frame), fps, config: motion.seal });
  return (
    <BrandSeal
      size={size}
      style={{
        opacity: frame < 0 ? 0 : 1,
        transform: `translateY(${(1 - value) * -150}px) rotate(${(1 - value) * -18}deg) scale(${1 + (1 - value) * 0.35})`,
      }}
    />
  );
}
function Fonts() {
  const [handle] = useState(() => delayRender("Shared brand fonts"));
  useEffect(() => {
    Promise.all([
      document.fonts.load(`400 100px "${brand.fonts.calligraphy}"`, "日本語"),
      document.fonts.load(`600 100px "${brand.fonts.japanese}"`, "文"),
      document.fonts.load(`550 80px "${brand.fonts.body}"`),
    ])
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle))
      .catch(cancelRender);
  }, [handle]);
  return null;
}
function Sweep({
  frame,
  id,
  w,
  h,
  children,
}: {
  frame: number;
  id: number;
  w: number;
  h: number;
  children: React.ReactNode;
}) {
  const p = interpolate(frame, [0, motion.wipe], [0, 1], {
    ...clamp,
    easing: Easing.bezier(...motion.wipeEase),
  });
  const mask = `scene-reveal-${id}`;
  return (
    <>
      <svg
        width={w}
        height={h}
        style={{ position: "absolute", pointerEvents: "none" }}
      >
        <defs>
          <mask
            id={mask}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={w}
            height={h}
          >
            {Array.from({ length: 8 }, (_, row) => (
              <InkBrush
                key={row}
                points={Array.from(
                  { length: 40 },
                  (_, i) =>
                    [
                      -w * 0.4 + (i / 39) * w * 1.9,
                      (h * row) / 7 + Math.sin(i * 0.3 + row) * h * 0.025,
                    ] as [number, number],
                )}
                progress={Math.min(
                  1,
                  Math.max(0, p * 1.15 - (row % 3) * 0.035),
                )}
                width={h * 0.3}
                taper={0.25}
                color="white"
                seed={1100 + id * 10 + row}
                dry={0}
              />
            ))}
          </mask>
        </defs>
      </svg>
      <AbsoluteFill
        style={{
          mask: p < 1 ? `url(#${mask})` : undefined,
          WebkitMask: p < 1 ? `url(#${mask})` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
      {frame < motion.wipe && id > 1 && (
        <svg
          width={w}
          height={h}
          style={{
            position: "absolute",
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          {[0, 1, 2].map((i) => (
            <polygon
              key={i}
              points={maplePoints.map((p) => p.join(",")).join(" ")}
              fill={i === 1 ? brand.colors.red : brand.colors.orange}
              opacity={0.9}
              transform={`translate(${-250 + p * (w + 600) + i * 135} ${h * (0.28 + i * 0.19) + Math.sin(p * Math.PI) * 100}) rotate(${p * 260 + i * 80}) scale(${0.4 + i * 0.15})`}
            />
          ))}
        </svg>
      )}
    </>
  );
}
export function Promo({
  vertical = false,
  publicUrl = "",
}: {
  vertical?: boolean;
  publicUrl?: string;
}) {
  const { width } = useVideoConfig();
  const w = vertical ? 1080 : 1920,
    h = vertical ? 1920 : 1080;
  let boundary = 0;
  return (
    <AbsoluteFill style={{ background: brand.colors.paper }}>
      <BrandStyles fontRoot={staticFile("fonts")} calligraphy />
      <Fonts />
      <div
        style={{
          position: "absolute",
          width: w,
          height: h,
          transform: `scale(${width / w})`,
          transformOrigin: "top left",
        }}
      >
        {scenes.map((n, id) => {
          const from = id === 0 ? 0 : boundary - motion.wipe;
          boundary += n;
          return (
            <Sequence
              key={id}
              from={from}
              durationInFrames={boundary - from}
              style={{ zIndex: id, isolation: "isolate" }}
            >
              {id === 0 ? (
                <Scene id={id} vertical={vertical} publicUrl={publicUrl} />
              ) : (
                <Transition id={id} w={w} h={h}>
                  <Scene id={id} vertical={vertical} publicUrl={publicUrl} />
                </Transition>
              )}
            </Sequence>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
function Transition({
  id,
  w,
  h,
  children,
}: {
  id: number;
  w: number;
  h: number;
  children: React.ReactNode;
}) {
  const frame = useCurrentFrame();
  return (
    <Sweep frame={frame} id={id} w={w} h={h}>
      {children}
    </Sweep>
  );
}
