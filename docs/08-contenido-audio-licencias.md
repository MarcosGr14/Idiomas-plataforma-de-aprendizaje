# Licencias del piloto implementado

- Texto didáctico original: `content/japanese-pilot.json`, marcado `reviewed: false`. Revisión por Marcos y revisión lingüística externa pendientes.
- Audio: 25 MP3 generados localmente con pyopenjtalk/Open JTalk y voz Mei, MMDAgent Project Team, Nagoya Institute of Technology, copyright 2009–2013. Voz bajo CC BY 3.0; copia de licencia en `public/audio/LICENSE-Mei.txt`. Conversión a MP3 a 64 kbit/s; velocidad lenta en el reproductor. Atribución visible en Créditos. No se redistribuye el modelo de voz ni el diccionario.
- Noto Serif JP: SIL OFL, copia en `public/fonts/OFL-Noto-Serif-JP.txt`. Subconjuntos alojados localmente.
- Manrope: SIL OFL, paquete Fontsource, copia en `public/fonts/OFL-Manrope.txt`.
- Lucide: ISC, iconos de interfaz. Three.js: MIT, escena geométrica original.
- Iconos PNG: conversión directa con ImageMagick del SVG original `public/icons/icon.svg`, sin material externo.
- Referencias visuales agregadas por Marcos en `docs/referencias/`: no se usan como assets de producción.

## Hero Kioto — 2026-10-22
Geometría, shaders, texturas de madera/adoquines/hojas/brillos y composición
procedurales originales del proyecto (`src/components/Street.tsx`). No incorporan
fotografías de referencia ni modelos descargados. Los pósteres
`public/images/kyoto-desktop.webp` y `kyoto-mobile.webp` son capturas de esa misma
escena, convertidas a WebP. Registro estructurado: `content/assets-licenses.json`.
Letreros: `content/street-signs.json`, marcados `reviewed: false`; no representan
contenido lingüístico revisado ni disponibilidad del curso de mandarín.

## Video promocional — 2026-10-23

- Capturas originales de esta plataforma, con datos sintéticos y sin cuentas reales.
- Marcos genéricos de dispositivos: CSS original en `promo/src/style.css`, sin marcas.
- Manrope y Noto Serif JP: mismas fuentes OFL registradas arriba; copias locales para el render.
- Música: ninguna. No se distribuye pista ni se asume que una canción disponible en Internet es libre.
  El README permite añadir después una pista autorizada, previa inscripción de autor, origen y licencia.
- Remotion 4.0.404: herramienta de render, bajo [Remotion License](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md), no MIT.
  Uso local por creador individual; revisar condiciones antes de ampliar a una organización.
- Playwright: Apache-2.0. ffmpeg: herramienta local de codificación; no se redistribuyen sus binarios.
