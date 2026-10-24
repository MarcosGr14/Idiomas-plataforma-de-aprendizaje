# Promo de Idiomas

Pieza de 40 segundos, 30 fps. Guion aprobado en [STORYBOARD.md](STORYBOARD.md).
Remotion compone capturas reales de la web; Playwright controla cada fotograma y
ffmpeg codifica H.264. No usa servicios de render ni cuentas reales.

## Preparación

Node 24 o superior, ffmpeg en PATH y Chromium/Chrome/Brave local. En este equipo
se usa `/opt/brave.com/brave/brave`; en otro, define `CHROME_PATH` con su ruta
absoluta. Siempre se abre un perfil temporal, aislado de tus pestañas y datos.
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
repite solo clips concretos. Si el navegador se interrumpe y no has cambiado el código ni el contenido, `PROMO_RESUME=1` reutiliza los PNG ya capturados; sin ese parámetro vuelve a capturar el clip incompleto desde cero. `PROMO_SCENES=3 PROMO_RERENDER=1 npm --prefix promo run preview` regenera una escena en ambos formatos; luego ejecuta preview sin filtro para recomponer los montajes. `node promo/scripts/render.mjs stills` genera siete
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

## Sistema de tinta compartido

`src/design/tokens.ts` de la aplicación define colores, familias y movimiento.
Remotion importa `InkBrush`, `InkCharacter`, `InkCalligraphy` y `BrandSeal` desde
`src/`; no mantiene copias de marca. Los PNG y clips se capturan nuevamente
cuando cambian los tokens. La geometría de las hojas también procede del hero.

KanjiVG aporta los recorridos en orden de 日・本・語・い. Para regenerar sus
muestras SVG: `node promo/scripts/prepare-ink.mjs`. InkCalligraphy usa esos
recorridos como máscara de la fuente Yuji Boku; al terminar asienta el contorno
restante del glifo. La fuente y los recorridos no tienen contornos idénticos.
InkBrush recibe progreso explícito y semilla: no usa reloj, RAF ni aleatoriedad
libre. No modifica las preferencias de animación de la aplicación.

`PROMO_FRAMES=80,89,95,255 node promo/scripts/render.mjs stills` genera imágenes
para inspeccionar el intro y sus transiciones. El intro ocupa 105 fotogramas;
los barridos se solapan 22 fotogramas. Duraciones, springs, easing y posiciones
de titulares están en los tokens compartidos.

Distribuye `promo/ATTRIBUTION.txt` junto a los videos. Los datos derivados de
KanjiVG se conservan bajo CC BY-SA 3.0; las fuentes tienen sus licencias OFL.

## Exportar 1440p (QHD / 2K habitual)

`node promo/scripts/render.mjs qhd` genera únicamente
`promo/out/promo-16x9-1440p.mp4` a 2560×1440, 30 fps, 40 segundos y sin audio.
Compone de nuevo desde las fuentes y capturas originales; no amplía el preview
de 480p. Las capturas mantienen su resolución de origen.

La exportación QHD guarda cada capítulo en `out/qhd-scenes/` y reutiliza los
capítulos terminados al reanudar. Usa `PROMO_RERENDER=1` si cambias la composición.
El navegador usa ANGLE; si un equipo no lo admite, configura `PROMO_GL=swangle`
para renderizar por software. Los capítulos y el MP4 final permanecen fuera de Git.
