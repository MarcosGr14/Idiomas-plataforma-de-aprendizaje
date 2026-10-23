# Promo de Idiomas

Pieza de 40 segundos, 30 fps. Guion aprobado en [STORYBOARD.md](STORYBOARD.md).
Remotion compone capturas reales de la web; Playwright controla cada fotograma y
ffmpeg codifica H.264. No usa servicios de render ni cuentas reales.

## Preparación

Node 22 o superior, ffmpeg en PATH y un navegador Chromium local. En este equipo
se usa Brave (`/opt/brave.com/brave/brave`); en otro, define `CHROME_PATH`.
Desde la raíz del repositorio:

```sh
npm ci
npm --prefix promo ci
```

## Regenerar con un comando

```sh
npm --prefix promo run all
```

Arranca Vite si es necesario, captura la demo, genera las previsualizaciones de
cada escena a 480p, las concatena y produce ambos másteres y el póster. Para añadir
4K: `npm --prefix promo run all -- --4k`. Los medios ya generados se reutilizan;
para regenerar todo después de editar:

```sh
PROMO_RECAPTURE=1 PROMO_RERENDER=1 npm --prefix promo run all
```

El render no necesita una URL pública. Si ya existe una URL verificada, define
`PROMO_URL=https://tu-dominio` para mostrarla al cerrar. No se inventa un dominio.
`PROMO_SITE` cambia el servidor de captura (por defecto `http://localhost:5173`).

## Flujo editorial

```sh
npm run dev
npm --prefix promo run capture
npm --prefix promo run preview
# Revisar primero out/previews/*.mp4; ajustar composición y repetir preview.
PROMO_RERENDER=1 npm --prefix promo run preview
npm --prefix promo run render
# Opcional, después de revisar 480p:
npm --prefix promo run render -- --4k
```

`PROMO_ONLY=hero-desktop,hero-mobile PROMO_RECAPTURE=1 npm --prefix promo run capture`
repite solo clips concretos. `node promo/scripts/render.mjs stills` genera siete
fotogramas de revisión por formato. `npm --prefix promo run studio` abre el editor.

## Salidas (no se suben a Git)

- `out/previews/`: siete escenas por formato, 854×480 y 270×480.
- `out/promo-preview-16x9-480p.mp4`, `out/promo-preview-9x16-480p.mp4`.
- `out/promo-16x9-1080p.mp4`: 1920×1080.
- `out/promo-9x16.mp4`: 1080×1920, composición propia.
- `out/promo-16x9-4k.mp4`: 3840×2160, opción `--4k`.
- `out/poster.png`, `out/poster-vertical.png`.
- `out/capture-verification.json`: comprobación del reloj y almacenamiento.

Las capturas (`public/captures`), fuentes copiadas, caché, bundle y salidas están
ignoradas. Se versionan código, guion, scripts y lockfile. Los másteres 4K amplían
la composición, no añaden detalle a las capturas de escritorio de 1440×900.

## Captura y demo

Solo `?capture=1` activa `window.__IDIOMAS_CAPTURE__.setFrame({time,pointerX,
pointerY,scroll})`. El renderer Three no programa RAF en este modo. Completo usa
el tiempo absoluto; reducido cuantiza a 30 fps; apagado desmonta Three. Fuera del
parámetro no existe el puente y el comportamiento normal se conserva.

La demo usa fecha fija (23 de octubre de 2026), 200 XP, siete días de racha,
tres lecciones completadas y quince palabras de repaso. Es memoria de una sesión
nueva: no inicializa Supabase, no lee ni escribe progreso real. La lección se
muestra en curso durante la captura. No se fingen validación de trazos, librerías
por desbloquear ni un curso de mandarín disponible.

## Audio y derechos

Sin música ni pista de audio por defecto. El botón de pronunciación que se ve
es real; no se añade música sin licencia verificada. Las fuentes locales y la
escena proceden del proyecto; dispositivos propios sin marcas. Registro:
`docs/08-contenido-audio-licencias.md`.

Para añadir una pista autorizada sin recompilar las imágenes, registra primero
su autor, URL, licencia y atribución; después mezcla una copia con ffmpeg:

```sh
ffmpeg -i promo/out/promo-16x9-1080p.mp4 -stream_loop -1 -i /ruta/pista-autorizada.wav \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k \
  -af 'volume=0.18,afade=t=in:d=1,afade=t=out:st=38:d=2' -t 40 \
  -movflags +faststart promo/out/promo-con-musica.mp4
```

Remotion requiere revisar su licencia si cambia el tamaño de la organización;
esta instalación usa el supuesto de creador individual. No es una licencia MIT.
