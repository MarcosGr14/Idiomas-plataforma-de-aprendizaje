import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
export default function Street({ reduced }: { reduced: boolean }) {
  const mount = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x252c29, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x252c29, 35, 70);
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(17, 15, 22);
    camera.lookAt(0, 2, 0);
    scene.add(new THREE.AmbientLight(0xe2e5dc, 1.5));
    const sun = new THREE.DirectionalLight(0xffead7, 2);
    sun.position.set(-6, 15, 7);
    scene.add(sun);
    const objects: THREE.Object3D[] = [];
    const materials: THREE.Material[] = [];
    const textures: THREE.Texture[] = [];
    function box(
      w: number,
      h: number,
      d: number,
      x: number,
      y: number,
      z: number,
      color: number,
    ) {
      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.85,
      });
      materials.push(material);
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(x, y, z);
      scene.add(mesh);
      objects.push(mesh);
      return mesh;
    }
    function sign(
      text: string,
      w: number,
      h: number,
      x: number,
      y: number,
      z: number,
      bg: string,
      fg: string,
      rotate = 0,
    ) {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = Math.round((512 * h) / w);
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = fg;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `600 ${text.length > 4 ? 68 : 100}px "Noto Serif JP",serif`;
      ctx.fillText(text, 256, canvas.height / 2);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      textures.push(texture);
      const mat = new THREE.MeshBasicMaterial({ map: texture });
      materials.push(mat);
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      mesh.position.set(x, y, z);
      mesh.rotation.y = rotate;
      scene.add(mesh);
      objects.push(mesh);
    }
    box(22, 0.35, 12, 0, -0.2, 0, 0xd5d5ce);
    box(22, 0.08, 3.5, 0, 0, 2.7, 0x434846);
    box(22, 0.12, 1.4, 0, 0.05, 0.25, 0xc9c9bf);
    box(22, 0.12, 1.5, 0, 0.05, 5.25, 0xd8d8d0);
    for (let x = -9; x < 10; x += 2.2)
      box(1.15, 0.02, 0.08, x, 0.06, 2.7, 0xe7dfc8);
    for (let x = 5; x < 9; x += 0.6)
      box(0.3, 0.03, 2.9, x, 0.07, 2.6, 0xf8f6df);
    const buildings = [
      {
        x: -8,
        w: 3.2,
        h: 5.2,
        d: 4,
        color: 0xddd5bc,
        name: "喫茶",
        bg: "#28544b",
        fg: "#fff8dc",
      },
      {
        x: -4.4,
        w: 3.4,
        h: 7.5,
        d: 4.8,
        color: 0xdddeda,
        name: "本屋",
        bg: "#d1372e",
        fg: "#fff4da",
      },
      {
        x: -0.7,
        w: 3.5,
        h: 4.5,
        d: 4,
        color: 0xedd7ae,
        name: "ラーメン",
        bg: "#efbd3a",
        fg: "#302d24",
      },
      {
        x: 3.2,
        w: 3.8,
        h: 8,
        d: 5,
        color: 0xc6ceca,
        name: "日本語",
        bg: "#faf5e6",
        fg: "#c62c26",
      },
      {
        x: 7.4,
        w: 3.6,
        h: 5.5,
        d: 4,
        color: 0xd9bfaa,
        name: "花屋",
        bg: "#d74b30",
        fg: "#fff4da",
      },
    ];
    for (const b of buildings) {
      box(b.w, b.h, b.d, b.x, b.h / 2, -b.d / 2, b.color);
      box(b.w + 0.15, 0.22, b.d + 0.2, b.x, b.h, -b.d / 2, 0x59605a);
      box(b.w - 0.4, 1.6, 0.12, b.x, 0.9, 0.08, 0x273d39);
      for (let x = b.x - b.w / 2 + 0.4; x < b.x + b.w / 2 - 0.2; x += 0.67) {
        box(0.06, 1.6, 0.2, x, 0.9, 0.18, 0x93734c);
        box(0.45, 1.1, 0.13, x + 0.24, 1.1, 0.17, 0xe9bf63);
      }
      box(b.w + 0.2, 0.15, 1, b.x, 2.05, 0.3, 0xc7352d);
      const light = new THREE.PointLight(0xffb458, 8, 5, 2);
      light.position.set(b.x, 2, 1.4);
      scene.add(light);
      const neon = box(b.w - 0.1, 0.035, 0.04, b.x, 2.96, 0.15, 0xff5940);
      (neon.material as THREE.MeshStandardMaterial).emissive.set(0xff3a19);
      (neon.material as THREE.MeshStandardMaterial).emissiveIntensity = 3;
      box(0.65, 0.6, 0.7, b.x - 0.7, b.h + 0.4, -1, 0x737b70);
      box(0.04, 1.3, 0.04, b.x + 0.8, b.h + 0.6, -1.5, 0x737b70);
      box(0.6, 0.04, 0.04, b.x + 0.8, b.h + 1, -1.5, 0x737b70);
      sign(b.name, b.w - 0.15, 0.67, b.x, 2.55, 0.08, b.bg, b.fg);
      for (let y = 3.5; y < b.h - 0.3; y += 1.5)
        for (let x = b.x - b.w / 2 + 0.7; x < b.x + b.w / 2 - 0.3; x += 1.15) {
          box(0.75, 0.9, 0.1, x, y, 0.52, 0x778c88);
          box(0.06, 0.9, 0.15, x, y, 0.59, 0xd4d7c9);
          box(0.76, 0.06, 0.15, x, y, 0.59, 0xd4d7c9);
        }
      if (b.h > 6) {
        box(0.8, 2.8, 0.4, b.x + b.w / 2 + 0.2, 4.5, 0.5, 0xc52c2a);
        sign(
          "学",
          0.65,
          0.75,
          b.x + b.w / 2 + 0.2,
          5.2,
          0.72,
          "#c52c2a",
          "#fff2cb",
        );
        sign(
          "ぶ",
          0.65,
          0.75,
          b.x + b.w / 2 + 0.2,
          4.25,
          0.72,
          "#c52c2a",
          "#fff2cb",
        );
      }
    }
    // Lamps, suspended lanterns and street furniture are geometry, not an image substitute.
    for (const x of [-8, -2, 4, 9]) {
      box(0.09, 5, 0.09, x, 2.5, 0.85, 0x343e38);
      box(1, 0.07, 0.08, x + 0.45, 5, 0.85, 0x343e38);
      box(0.45, 0.14, 0.3, x + 0.8, 4.95, 0.85, 0xffd078);
    }
    for (let x = -9; x < 10; x += 1.9) {
      const m = new THREE.MeshStandardMaterial({
        color: 0xe5482f,
        emissive: 0x852411,
        emissiveIntensity: 0.3,
      });
      materials.push(m);
      const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), m);
      lantern.scale.y = 1.3;
      lantern.position.set(x, 3.2, 1);
      scene.add(lantern);
      objects.push(lantern);
      box(0.03, 0.5, 0.03, x, 3.7, 1, 0x49473c);
    }
    const line = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-10, 4, 1),
      new THREE.Vector3(10, 4, 1),
    ]);
    const wire = new THREE.Line(
      line,
      new THREE.LineBasicMaterial({ color: 0x5c5d50 }),
    );
    scene.add(wire);
    for (const x of [-6, 1, 8]) {
      box(0.55, 0.6, 0.55, x, 0.35, 5.2, 0xb97448);
      const mat = new THREE.MeshStandardMaterial({ color: 0x55765c });
      materials.push(mat);
      const plant = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), mat);
      plant.position.set(x, 1, 5.2);
      scene.add(plant);
      objects.push(plant);
    }
    sign("ようこそ", 3.5, 0.7, -0.7, 3.55, 0.05, "#f0dfb9", "#332b26");
    let frame = 0;
    let visible = true;
    let started = performance.now();
    function draw(now: number) {
      if (visible && !document.hidden) {
        if (!reduced) {
          const t = (now - started) / 1000;
          camera.position.x = 17 + Math.sin(t * 0.13) * 0.7;
          camera.lookAt(0, 2, 0);
        }
        renderer.render(scene, camera);
      }
      if (!reduced) frame = requestAnimationFrame(draw);
    }
    const resize = () => {
      const w = el.clientWidth,
        h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.position.z = w < 600 ? 32 : 22;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    intersection.observe(el);
    resize();
    draw(performance.now());
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose();
      });
      line.dispose();
      (wire.material as THREE.Material).dispose();
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [reduced]);
  return (
    <div
      ref={mount}
      className="street-canvas"
      role="img"
      aria-label="Ilustración tridimensional de una calle japonesa con librería, cafetería, faroles y letreros en japonés"
    >
      {failed && (
        <div className="street-fallback">
          <span lang="ja">ようこそ</span>
          <p>Bienvenido a tu primer recorrido en japonés.</p>
        </div>
      )}
    </div>
  );
}
