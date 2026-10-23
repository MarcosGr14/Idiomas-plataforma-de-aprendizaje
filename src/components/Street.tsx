import { maplePoints } from "../design/maple";
import { captureEnabled, registerCaptureRenderer } from "../lib/capture";
import { useEffect, useRef } from "react";
import * as T from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import {
  downgradeMotion,
  nextFrameDeadline,
  type MotionMode,
} from "../lib/motion";

import { signs } from "../data/street-signs";
export default function Street({
  mode,
  paused,
  selected,
  onSelect,
  onDegrade,
}: {
  mode: Exclude<MotionMode, "off">;
  paused: boolean;
  selected: number | null;
  onSelect: (n: number) => void;
  onDegrade: (mode: MotionMode) => void;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const live = useRef({ paused, selected, onSelect, onDegrade });
  live.current = { paused, selected, onSelect, onDegrade };
  useEffect(() => {
    const el = mount.current!;
    let disposed = false;
    let renderer: T.WebGLRenderer;
    try {
      renderer = new T.WebGLRenderer({
        antialias: mode === "full",
        alpha: false,
        preserveDrawingBuffer: captureEnabled,
      });
    } catch {
      live.current.onDegrade("off");
      return;
    }
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.setAttribute("aria-hidden", "true");
    el.appendChild(renderer.domElement);
    const scene = new T.Scene();
    scene.fog = new T.FogExp2(0x362320, 0.023);
    const camera = new T.PerspectiveCamera(39, 1, 0.1, 150);
    const textures: T.Texture[] = [];
    const materials: T.Material[] = [];
    const geometries: T.BufferGeometry[] = [];
    const keep = <M extends T.Material>(m: M) => {
      materials.push(m);
      return m;
    };
    const geo = <G extends T.BufferGeometry>(g: G) => {
      geometries.push(g);
      return g;
    };
    let seed = 178;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    function texture(
      size: number,
      paint: (ctx: CanvasRenderingContext2D, size: number) => void,
    ) {
      const c = document.createElement("canvas");
      c.width = c.height = size;
      paint(c.getContext("2d")!, size);
      const t = new T.CanvasTexture(c);
      t.colorSpace = T.SRGBColorSpace;
      textures.push(t);
      return t;
    }
    const glow = texture(128, (c, s) => {
      const g = c.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      g.addColorStop(0, "#fff9dc");
      g.addColorStop(0.12, "#ffcf87aa");
      g.addColorStop(0.42, "#f3783628");
      g.addColorStop(1, "#ad431000");
      c.fillStyle = g;
      c.fillRect(0, 0, s, s);
    });
    const leaf = texture(128, (c, s) => {
      c.translate(s / 2, s / 2);
      c.fillStyle = "#ffffff";
      c.beginPath();
      const pts = maplePoints;
      pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
      c.closePath();
      c.fill();
    });
    const stone = texture(512, (c, s) => {
      c.fillStyle = "#24201d";
      c.fillRect(0, 0, s, s);
      for (let y = 0; y < s; y += 64)
        for (let x = -80; x < s; x += 128) {
          const xx = x + ((y / 64) % 2) * 64;
          c.fillStyle = `rgb(${55 + rand() * 23},${49 + rand() * 20},${44 + rand() * 18})`;
          c.fillRect(xx + 3, y + 3, 121, 57);
          c.strokeStyle = "#9e8c6944";
          c.strokeRect(xx + 4, y + 4, 119, 55);
          for (let k = 0; k < 230; k++) {
            c.fillStyle = rand() > 0.5 ? "#c0b7a30d" : "#00000020";
            c.fillRect(xx + rand() * 120, y + rand() * 57, 2, 2);
          }
        }
    });
    stone.wrapS = stone.wrapT = T.RepeatWrapping;
    stone.repeat.set(3, 18);
    stone.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const wood = texture(256, (c, s) => {
      c.fillStyle = "#30221b";
      c.fillRect(0, 0, s, s);
      for (let i = 0; i < 350; i++) {
        c.strokeStyle = `rgba(${rand() > 0.5 ? "125,78,41" : "8,6,5"},${rand() * 0.3})`;
        c.beginPath();
        const x = rand() * s;
        c.moveTo(x, 0);
        c.bezierCurveTo(x + rand() * 6, s * 0.3, x - 4, s * 0.7, x, s);
        c.stroke();
      }
    });
    wood.wrapS = wood.wrapT = T.RepeatWrapping;
    const timber = keep(
      new T.MeshStandardMaterial({
        map: wood,
        color: 0x9c7959,
        roughness: 0.89,
      }),
    );
    const dark = keep(
      new T.MeshStandardMaterial({ color: 0x211b19, roughness: 0.8 }),
    );
    const roof = keep(
      new T.MeshStandardMaterial({
        color: 0x252426,
        roughness: 0.58,
        metalness: 0.18,
      }),
    );
    const plaster = keep(
      new T.MeshStandardMaterial({ color: 0x6d5140, roughness: 1 }),
    );
    const amber = keep(
      new T.MeshStandardMaterial({
        color: 0xffb35b,
        emissive: 0xff822b,
        emissiveIntensity: 2.4,
        roughness: 0.6,
      }),
    );
    const cube = geo(new T.BoxGeometry(1, 1, 1));
    // Merge repeated architecture into one instanced draw per material.
    const batches = new Map<T.Material, T.Matrix4[]>();
    function box(
      w: number,
      h: number,
      d: number,
      x: number,
      y: number,
      z: number,
      mat: T.Material = timber,
      rz = 0,
    ) {
      const o = new T.Object3D();
      o.position.set(x, y, z);
      o.scale.set(w, h, d);
      o.rotation.z = rz;
      o.updateMatrix();
      const b = batches.get(mat) ?? [];
      b.push(o.matrix.clone());
      batches.set(mat, b);
    }
    const ground = new T.Mesh(
      geo(new T.PlaneGeometry(24, 105)),
      keep(
        new T.MeshStandardMaterial({
          map: stone,
          roughness: 0.36,
          metalness: 0.35,
          color: 0xb3a08a,
        }),
      ),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.03, -29);
    scene.add(ground);
    // Sky is a depth-bearing shader, not a downloaded reference image.
    const sky = new T.Mesh(
      geo(new T.SphereGeometry(100, 24, 16)),
      keep(
        new T.ShaderMaterial({
          side: T.BackSide,
          depthWrite: false,
          uniforms: {},
          vertexShader:
            "varying vec3 v; void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
          fragmentShader:
            "varying vec3 v;void main(){float h=smoothstep(-8.,65.,v.y);vec3 col=mix(vec3(.25,.125,.09),vec3(.022,.029,.07),h);float cloud=sin(v.x*.13+sin(v.z*.09))*sin(v.y*.25+v.x*.06);col+=cloud*.015;gl_FragColor=vec4(col,1.);}",
        }),
      ),
    );
    scene.add(sky);
    scene.add(new T.HemisphereLight(0x727b9f, 0x6a341d, 0.85));
    const moon = new T.DirectionalLight(0x9aacc8, 1.1);
    moon.position.set(-8, 20, -10);
    scene.add(moon);
    const signMeshes: T.Mesh[] = [];
    const lanterns: T.Group[] = [];
    const sphere = geo(new T.SphereGeometry(0.31, 14, 10));
    const glowMat = keep(
      new T.SpriteMaterial({
        map: glow,
        color: 0xffa24c,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
        blending: T.AdditiveBlending,
      }),
    );
    function halo(x: number, y: number, z: number, size: number) {
      const s = new T.Sprite(glowMat);
      s.position.set(x, y, z);
      s.scale.set(size, size, 1);
      scene.add(s);
    }
    function pool(x: number, z: number, size: number) {
      const m = keep(
        new T.MeshBasicMaterial({
          map: glow,
          color: 0xffa549,
          transparent: true,
          opacity: 0.6,
          depthWrite: false,
          blending: T.AdditiveBlending,
        }),
      );
      const p = new T.Mesh(geo(new T.PlaneGeometry(size, size * 1.8)), m);
      p.rotation.x = -Math.PI / 2;
      p.position.set(x, 0.012, z);
      scene.add(p);
    }
    function sign(
      text: string,
      x: number,
      y: number,
      z: number,
      side: number,
      index: number,
    ) {
      const map = texture(512, (c, s) => {
        c.fillStyle = "#351511";
        c.fillRect(0, 0, s, s);
        c.fillStyle = "#ffe6ac";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.font = '110px "Noto Serif JP", serif';
        [...text].forEach((ch, i) =>
          c.fillText(ch, s / 2, s / 2 + (i - (text.length - 1) / 2) * 115),
        );
      });
      const m = keep(
        new T.MeshStandardMaterial({
          map,
          emissiveMap: map,
          emissive: 0xffcf83,
          emissiveIntensity: 1.25,
          roughness: 0.8,
        }),
      );
      const mesh = new T.Mesh(geo(new T.BoxGeometry(0.72, 2.25, 0.14)), m);
      mesh.position.set(x, y, z);
      mesh.rotation.y = side * 0.15;
      mesh.userData.sign = index;
      scene.add(mesh);
      signMeshes.push(mesh);
      box(0.84, 2.38, 0.18, x, y, z - 0.09, dark);
    }
    for (let row = 0; row < 8; row++)
      for (const side of [-1, 1]) {
        const z = 5 - row * 6;
        const height = 5.6 + rand() * 1.5;
        box(5, height, 5.9, side * 6.8, height / 2, z, plaster);
        box(0.22, height, 5.95, side * 4.27, height / 2, z, timber);
        box(0.2, 2.4, 4.8, side * 4.13, 1.5, z, amber);
        for (let d = -2.65; d < 2.8; d += 0.3)
          box(0.28, 2.8, 0.065, side * 3.99, 1.55, z + d, timber);
        for (const y of [0.2, 2.85, 3.35, height - 0.12])
          box(0.35, 0.17, 5.95, side * 4.02, y, z, timber);
        for (const dz of [-2.85, 0, 2.85])
          box(0.32, height, 0.22, side * 3.95, height / 2, z + dz, timber);
        for (let d = -2.5; d < 2.8; d += 0.46) {
          box(0.2, 1.6, 0.3, side * 4.01, 4.45, z + d, dark);
          box(
            0.23,
            1.2,
            0.22,
            side * 3.98,
            4.45,
            z + d,
            rand() > 0.6 ? amber : timber,
          );
        }
        // Deep, pitched eaves with narrow repeated tile ridges.
        box(2.3, 0.15, 6.25, side * 4.05, 3.18, z, roof, side * 0.15);
        box(5.8, 0.18, 6.3, side * 6, height + 0.2, z, roof, side * 0.14);
        for (let d = -3; d < 3.2; d += 0.22)
          box(2.35, 0.06, 0.055, side * 4.04, 3.28, z + d, dark, side * 0.15);
        const lx = side * 3.35,
          lz = z + 1.8;
        box(0.9, 0.09, 0.08, side * 3.55, 3.2, lz, timber);
        const group = new T.Group();
        group.position.set(lx, 2.75, lz);
        const lamp = new T.Mesh(sphere, amber);
        lamp.scale.set(0.9, 1.4, 0.9);
        group.add(lamp);
        const capMat = dark;
        for (const y of [-0.39, 0.39]) {
          const cap = new T.Mesh(
            geo(new T.CylinderGeometry(0.19, 0.19, 0.07, 12)),
            capMat,
          );
          cap.position.y = y;
          group.add(cap);
        }
        const ribMat = keep(
          new T.MeshBasicMaterial({
            color: 0x72381d,
            transparent: true,
            opacity: 0.35,
          }),
        );
        for (let y = -0.28; y <= 0.3; y += 0.095) {
          const ring = new T.Mesh(
            geo(
              new T.TorusGeometry(
                Math.sqrt(Math.max(0, 0.31 * 0.31 - (y / 1.4) ** 2)) * 0.9,
                0.009,
                3,
                16,
              ),
            ),
            ribMat,
          );
          ring.rotation.x = Math.PI / 2;
          ring.position.y = y;
          group.add(ring);
        }
        scene.add(group);
        lanterns.push(group);
        halo(lx, 2.75, lz, 2.3);
        pool(side * 2.7, lz, 3.8);
        // Stretched translucent highlights suggest wet reflections without another scene render.
        for (let j = 0; j < 5; j++) {
          const reflection = new T.Mesh(
            geo(new T.PlaneGeometry(0.08 + rand() * 0.28, 1 + rand() * 2)),
            keep(
              new T.MeshBasicMaterial({
                color: 0xd68a43,
                transparent: true,
                opacity: 0.06 + rand() * 0.1,
                depthWrite: false,
              }),
            ),
          );
          reflection.rotation.x = -Math.PI / 2;
          reflection.position.set(
            side * (1.5 + rand() * 2),
            0.018,
            lz + rand() * 2,
          );
          scene.add(reflection);
        }
        if (row < 4) {
          const idx = row * 2 + (side === 1 ? 1 : 0);
          sign(signs[idx].text, side * 3.6, 4.15, z + 2.85, side, idx);
        }
      }
    for (const [x, z] of [
      [-3, 3],
      [3, -9],
      [-3, -23],
    ]) {
      const light = new T.PointLight(0xffa34d, 32, 17, 2);
      light.position.set(x, 2.8, z);
      scene.add(light);
    }
    // Five storeys and sweeping silhouettes, rather than a floating miniature.
    const pagodaZ = -49;
    for (let i = 0; i < 5; i++) {
      const w = 7.1 - i * 0.95,
        y = 1.2 + i * 2.15;
      box(w * 0.72, 1.8, w * 0.65, 0, y, pagodaZ, timber);
      box(
        w * 0.7,
        0.8,
        0.12,
        0,
        y + 0.15,
        pagodaZ + w * 0.34,
        i === 2 ? amber : dark,
      );
      for (let x = -w * 0.3; x < w * 0.36; x += 0.5)
        box(0.1, 1.9, 0.15, x, y, pagodaZ + w * 0.35, dark);
      const shape = new T.Shape();
      shape.moveTo(-w * 0.64, 0);
      shape.quadraticCurveTo(-w * 0.46, -0.28, -w * 0.31, 0.6);
      shape.lineTo(0, 1.0);
      shape.lineTo(w * 0.31, 0.6);
      shape.quadraticCurveTo(w * 0.46, -0.28, w * 0.64, 0);
      shape.lineTo(w * 0.6, -0.18);
      shape.lineTo(-w * 0.6, -0.18);
      shape.closePath();
      const r = new T.Mesh(
        geo(
          new T.ExtrudeGeometry(shape, {
            depth: w * 0.85,
            bevelEnabled: false,
          }),
        ),
        roof,
      );
      r.position.set(0, y + 1, pagodaZ - w * 0.425);
      scene.add(r);
    }
    box(0.12, 3, 0.12, 0, 13, pagodaZ, dark);
    for (let i = 0; i < 7; i++) {
      const ring = new T.Mesh(
        geo(new T.TorusGeometry(0.3 - i * 0.028, 0.035, 4, 16)),
        dark,
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, 11.9 + i * 0.23, pagodaZ);
      scene.add(ring);
    }
    halo(0, 6, pagodaZ + 3, 9);
    // Branches arc from the upper right and cross the central space.
    function branch(points: T.Vector3[], radius: number) {
      const curve = new T.CatmullRomCurve3(points);
      scene.add(
        new T.Mesh(
          geo(new T.TubeGeometry(curve, 18, radius, 6, false)),
          timber,
        ),
      );
    }
    branch(
      [
        new T.Vector3(10, 7.2, 4),
        new T.Vector3(6, 7.8, 1),
        new T.Vector3(2.8, 8.2, -1),
        new T.Vector3(-1, 8.8, -4),
      ],
      0.16,
    );
    branch(
      [
        new T.Vector3(6, 7.8, 1),
        new T.Vector3(4.2, 6.5, -1),
        new T.Vector3(1.2, 6.4, -4),
      ],
      0.075,
    );
    const foliageMat = keep(
      new T.MeshStandardMaterial({
        map: leaf,
        alphaTest: 0.45,
        side: T.DoubleSide,
        color: 0xffffff,
        roughness: 0.8,
        emissive: 0x5b1000,
        emissiveIntensity: 0.3,
      }),
    );
    const foliage = new T.InstancedMesh(
      geo(new T.PlaneGeometry(1, 1)),
      foliageMat,
      650,
    );
    const o = new T.Object3D();
    const colors = [0xd94718, 0x9f2111, 0xf07d21, 0xe6aa35, 0x741a13];
    for (let i = 0; i < 650; i++) {
      const t = rand();
      o.position.set(
        9 - t * 10 + (rand() - 0.5) * 3,
        7.4 + Math.sin(t * 4) * 0.7 + (rand() - 0.5) * 1.8,
        2 - t * 6 + (rand() - 0.5) * 3,
      );
      o.rotation.set(rand() * 1.3, rand() * 2, rand() * 6);
      o.scale.setScalar(0.22 + rand() * 0.42);
      o.updateMatrix();
      foliage.setMatrixAt(i, o.matrix);
      foliage.setColorAt(
        i,
        new T.Color(colors[Math.floor(rand() * colors.length)]),
      );
    }
    scene.add(foliage);
    const particleUniforms: { time: { value: number } }[] = [];
    function particles(count: number, kind: "leaf" | "ember" | "dust") {
      const g = geo(new T.InstancedBufferGeometry());
      const plane = new T.PlaneGeometry(1, 1);
      g.index = plane.index;
      g.attributes.position = plane.attributes.position;
      g.attributes.uv = plane.attributes.uv;
      const offsets = new Float32Array(count * 3),
        seeds = new Float32Array(count),
        cols = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        offsets.set([(rand() - 0.5) * 11, rand() * 10, 8 - rand() * 55], i * 3);
        seeds[i] = rand();
        const col = new T.Color(
          kind === "leaf"
            ? colors[Math.floor(rand() * colors.length)]
            : 0xffba55,
        );
        cols.set([col.r, col.g, col.b], i * 3);
      }
      g.setAttribute("offset", new T.InstancedBufferAttribute(offsets, 3));
      g.setAttribute("seed", new T.InstancedBufferAttribute(seeds, 1));
      g.setAttribute("tint", new T.InstancedBufferAttribute(cols, 3));
      g.instanceCount = count;
      const u = {
        time: { value: 0 },
        map: { value: kind === "leaf" ? leaf : glow },
      };
      particleUniforms.push(u);
      const m = keep(
        new T.ShaderMaterial({
          uniforms: u,
          transparent: true,
          depthWrite: false,
          side: T.DoubleSide,
          blending: kind === "leaf" ? T.NormalBlending : T.AdditiveBlending,
          vertexShader: `attribute vec3 offset;attribute float seed;attribute vec3 tint;uniform float time;varying vec2 vUv;varying vec3 vColor;varying float vAlpha;void main(){vUv=uv;vColor=tint;float t=time*${kind === "leaf" ? ".36" : ".14"};vec3 p=offset;p.y=mod(offset.y-t*(.4+seed),10.);p.x+=sin(t+seed*40.)*.65;p.z+=cos(t*.7+seed*20.)*.3;vec4 mv=modelViewMatrix*vec4(p,1.);float a=t+seed*6.28;mat2 rot=mat2(cos(a),-sin(a),sin(a),cos(a));mv.xy+=rot*position.xy*${kind === "leaf" ? ".22" : kind === "dust" ? ".055" : ".19"}*(.6+seed);gl_Position=projectionMatrix*mv;vAlpha=${kind === "leaf" ? ".9" : "(.45+.35*sin(time+seed*30.))"}*smoothstep(65.,10.,-mv.z);}`,
          fragmentShader:
            "uniform sampler2D map;varying vec2 vUv;varying vec3 vColor;varying float vAlpha;void main(){vec4 tex=texture2D(map,vUv);if(tex.a<.03)discard;gl_FragColor=vec4(vColor*tex.rgb,tex.a*vAlpha);}",
        }),
      );
      const mesh = new T.Mesh(g, m);
      mesh.frustumCulled = false;
      scene.add(mesh);
    }
    particles(mode === "full" ? 550 : 120, "leaf");
    particles(mode === "full" ? 150 : 40, "ember");
    if (mode === "full") particles(150, "dust");
    const fogUniforms: { time: { value: number } }[] = [];
    for (let i = 0; i < 3; i++) {
      const u = { time: { value: 0 }, opacity: { value: 0.09 + i * 0.025 } };
      fogUniforms.push(u);
      const m = keep(
        new T.ShaderMaterial({
          uniforms: u,
          transparent: true,
          depthWrite: false,
          vertexShader:
            "varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
          fragmentShader:
            "varying vec2 v;uniform float time;uniform float opacity;void main(){float n=sin(v.x*19.+time*.04+sin(v.y*12.))*sin(v.y*16.+v.x*5.-time*.02);float edge=smoothstep(0.,.2,v.x)*smoothstep(1.,.8,v.x)*sin(v.y*3.14159);gl_FragColor=vec4(.47,.32,.24,(.5+n*.25)*edge*opacity);}",
        }),
      );
      const mesh = new T.Mesh(geo(new T.PlaneGeometry(30, 12)), m);
      mesh.position.set(0, 4, -12 - i * 15);
      scene.add(mesh);
    }
    for (const [mat, matrices] of batches) {
      const mesh = new T.InstancedMesh(cube, mat, matrices.length);
      matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
      scene.add(mesh);
    }
    const composer = mode === "full" ? new EffectComposer(renderer) : null;
    if (composer) {
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(
        new UnrealBloomPass(new T.Vector2(1, 1), 0.42, 0.5, 1.15),
      );
      composer.addPass(new OutputPass());
    }
    let width = 1,
      height = 1,
      visible = true,
      frame = 0,
      last = 0,
      deadline = 0,
      time = 0,
      needsRender = true,
      previousSelected: number | null = null,
      measurement = 0,
      samples = 0,
      warmup = 0;
    let px = 0,
      py = 0,
      currentX = 0,
      currentY = 0,
      scroll = 0;
    const ray = new T.Raycaster();
    const pointer = new T.Vector2();
    const resize = () => {
      width = el.clientWidth;
      height = el.clientHeight;
      renderer.setPixelRatio(
        mode === "reduced"
          ? 1
          : Math.min(devicePixelRatio, width < 700 ? 1.5 : 2),
      );
      renderer.setSize(width, height);
      composer?.setPixelRatio(renderer.getPixelRatio());
      composer?.setSize(width, height);
      camera.aspect = width / height;
      camera.setViewOffset(
        width,
        height,
        width < 700 ? 0 : -width * 0.22,
        0,
        width,
        height,
      );
      camera.updateProjectionMatrix();
      needsRender = true;
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width - 0.5) * 2;
      py = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const leave = () => {
      px = 0;
      py = 0;
    };
    const click = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.set(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        (-(e.clientY - r.top) / r.height) * 2 + 1,
      );
      ray.setFromCamera(pointer, camera);
      const hit = ray.intersectObjects(signMeshes)[0];
      if (hit) live.current.onSelect(hit.object.userData.sign);
    };
    const onScroll = () => {
      scroll = Math.max(
        0,
        Math.min(1, -el.getBoundingClientRect().top / height),
      );
    };
    const contextLost = (e: Event) => {
      e.preventDefault();
      live.current.onDegrade("off");
    };
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointerup", click);
    window.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    function start() {
      if (captureEnabled) return;
      last = 0;
      deadline = 0;
      measurement = 0;
      samples = 0;
      if (!frame && !document.hidden && visible)
        frame = requestAnimationFrame(draw);
    }
    function visibility() {
      if (document.hidden || !visible) {
        cancelAnimationFrame(frame);
        frame = 0;
        last = 0;
      } else start();
    }
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      visibility();
    });
    intersection.observe(el);
    document.addEventListener("visibilitychange", visibility);
    function draw(now: number) {
      frame = 0;
      if (disposed || (!captureEnabled && (document.hidden || !visible)))
        return;
      const delta = last ? Math.min((now - last) / 1000, 0.2) : 0;
      if (!captureEnabled && mode === "reduced") {
        const next = nextFrameDeadline(now, deadline);
        if (next === null) {
          frame = requestAnimationFrame(draw);
          return;
        }
        deadline = next;
      }
      last = now;
      if (!captureEnabled && !live.current.paused) {
        time += delta;
        needsRender = true;
      }
      if (previousSelected !== live.current.selected) {
        needsRender = true;
        previousSelected = live.current.selected;
      }
      if (needsRender) {
        if (!captureEnabled && !live.current.paused) {
          currentX += (px - currentX) * 0.035;
          currentY += (py - currentY) * 0.035;
        }
        const travel = live.current.paused
          ? 0
          : Math.sin(time * 0.12) * 0.7 + scroll * 1.5;
        camera.position.set(
          currentX * 0.32,
          2.8 - currentY * 0.12,
          13 - travel - (live.current.selected !== null ? 0.7 : 0),
        );
        camera.lookAt(currentX * 0.12, width < 700 ? 5.3 : 4.15, -36);
        for (const u of particleUniforms) u.time.value = time;
        for (const u of fogUniforms) u.time.value = time;
        lanterns.forEach((l, i) => {
          l.rotation.z = Math.sin(time * 0.7 + i) * 0.035;
        });
        if (composer) composer.render();
        else renderer.render(scene, camera);
        needsRender = false;
      }
      if (!captureEnabled && !live.current.paused && delta > 0) {
        warmup += delta;
        if (warmup > 4) {
          measurement += delta;
          samples++;
          if (samples >= 120) {
            const next = downgradeMotion(mode, samples / measurement, samples);
            if (next !== mode) {
              live.current.onDegrade(next);
              return;
            }
            measurement = 0;
            samples = 0;
          }
        }
      }
      if (!captureEnabled) frame = requestAnimationFrame(draw);
    }
    resize();
    start();
    const unregisterCapture = registerCaptureRenderer((capture) => {
      if (!live.current.paused)
        time =
          mode === "reduced"
            ? Math.floor(capture.time * 30) / 30
            : capture.time;
      currentX = capture.pointerX;
      currentY = capture.pointerY;
      scroll = capture.scroll;
      needsRender = true;
      draw(capture.time * 1000);
    });
    return () => {
      unregisterCapture();
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointerup", click);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      composer?.passes.forEach((p) => p.dispose());
      composer?.dispose();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [mode]);
  return <div className="kyoto-canvas" ref={mount} aria-hidden="true" />;
}
