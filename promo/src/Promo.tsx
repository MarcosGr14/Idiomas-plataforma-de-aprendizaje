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
} from "remotion";
import "./style.css";
import { fontFaces } from "./fontFaces";
export const scenes = [120, 150, 180, 240, 180, 150, 180];
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
              transform: `translateY(${interpolate(f, [delay + i * 3, delay + i * 3 + 19], [110, 0], clamp)}%)`,
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
  return still ? (
    <Img
      src={staticFile(`captures/${name}.png`)}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  ) : (
    <OffthreadVideo
      muted
      src={staticFile(`captures/${name}.mp4`)}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
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
    config: { damping: 24, stiffness: 100, mass: 1.1 },
  });
  const end = scenes[id];
  const opacity = interpolate(
    f,
    [0, 10, end - 9, end - 1],
    [0, 1, 1, 0],
    clamp,
  );
  const deviceStyle = {
    transform: `translateY(${(1 - enter) * 80}px) scale(${0.97 + enter * 0.03})`,
  };
  const heading = (text: string, sub?: string) => (
    <div className="heading">
      <h1>
        <Words>{text}</Words>
      </h1>
      {sub && (
        <p style={{ opacity: interpolate(f, [24, 40], [0, 1], clamp) }}>
          {sub}
        </p>
      )}
    </div>
  );
  return (
    <AbsoluteFill
      className={`scene scene-${id} ${v ? "vertical" : ""}`}
      style={{ opacity }}
    >
      {id === 0 && (
        <>
          <div className="intro">
            <div
              lang="ja"
              className="japanese"
              style={{
                opacity: enter,
                transform: `translateY(${(1 - enter) * 35}px)`,
              }}
            >
              日本語
            </div>
            <h1>
              <Words delay={22}>Japonés, primero.</Words>
            </h1>
            <p style={{ opacity: interpolate(f, [55, 75], [0, 1], clamp) }}>
              <span lang="zh">中文</span> · Mandarín, próximamente.
            </p>
          </div>
          <div className="brand-small">文 / Idiomas</div>
        </>
      )}
      {id === 1 && (
        <>
          <AbsoluteFill
            style={{ transform: `scale(${1 + (f / 150) * 0.035})` }}
          >
            <Media name={v ? "hero-mobile" : "hero-desktop"} />
          </AbsoluteFill>
          <div className="hero-scrim" />
          {heading("Un mundo nuevo.")}
          <p className="hero-note">Empieza a descubrirlo en japonés.</p>
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
                  <Device type="laptop" name="home-desktop" width={1220} />
                </Sequence>
                <Sequence from={90}>
                  <Device
                    type="laptop"
                    name="diagnostic-desktop"
                    width={1220}
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
              <span lang="ja">い</span>
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
                  <Device type="desktop" name="progress-desktop" width={1170} />
                </Sequence>
                <Sequence from={90}>
                  <Device type="desktop" name="library-desktop" width={1170} />
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
                    color: Math.floor(f / 50) === i ? "#b63226" : "#b0aaa2",
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
              <span lang="ja">文</span> Idiomas.
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
              style={{ position: "absolute", left: 0, top: v ? 480 : 220 }}
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
function Fonts() {
  const [handle] = useState(() => delayRender("Load brand fonts"));
  useEffect(() => {
    Promise.all([
      document.fonts.load('400 100px "Noto Serif JP"', "日本語中文い"),
      document.fonts.load("550 80px Manrope"),
    ])
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle));
  }, [handle]);
  return (
    <style>{fontFaces.replaceAll("/fonts/", staticFile("fonts") + "/")}</style>
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
  let start = 0;
  return (
    <AbsoluteFill style={{ background: "#151715" }}>
      <style>{`@font-face{font-family:Manrope;src:url('${staticFile("fonts/manrope.woff2")}') format('woff2');font-weight:200 800;font-display:block}`}</style>
      <Fonts />
      <div
        style={{
          position: "absolute",
          width: vertical ? 1080 : 1920,
          height: vertical ? 1920 : 1080,
          transform: `scale(${width / (vertical ? 1080 : 1920)})`,
          transformOrigin: "top left",
        }}
      >
        {scenes.map((n, id) => {
          const from = start;
          start += n;
          return (
            <Sequence key={id} from={from} durationInFrames={n}>
              <Scene id={id} vertical={vertical} publicUrl={publicUrl} />
            </Sequence>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
