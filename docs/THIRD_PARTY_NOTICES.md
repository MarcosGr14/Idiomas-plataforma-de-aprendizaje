# Créditos y licencias de terceros

Estos avisos acompañan los recursos distribuidos con Idiomas. Las licencias de
terceros se aplican a sus respectivos componentes; no asignan una licencia general
al código o al contenido original de la plataforma.

## Tipografías

- **Manrope**, distribuida mediante Fontsource, SIL Open Font License 1.1.
  Copia: `public/fonts/OFL-Manrope.txt`.
- **Noto Serif JP**, SIL Open Font License 1.1. Subconjuntos alojados localmente.
  Copia: `public/fonts/OFL-Noto-Serif-JP.txt`.
- **Yuji Boku**, The Yuji Project Authors, copyright 2021, SIL OFL 1.1.
  [Origen](https://github.com/google/fonts/tree/main/ofl/yujiboku).
  Subconjunto para la apertura del video. Copia: `public/fonts/OFL-Yuji-Boku.txt`.

## Trazos de escritura

**KanjiVG**, Ulrich Apel y colaboradores, Creative Commons Attribution-ShareAlike 3.0.
[Proyecto y fuentes](https://github.com/KanjiVG/kanjivg).

Se conservan los SVG originales en `content/kanjivg/`, con sus avisos de copyright.
Las muestras geométricas de `src/data/hiragana-strokes.json` y
`src/design/kanjivg.json` son adaptaciones bajo la misma CC BY-SA 3.0; mantienen
orden y dirección. La procedencia del conjunto de hiragana está fijada en
`content/kanjivg/hiragana-source.json`. Copia de licencia:
`public/licenses/KanjiVG-CC-BY-SA-3.0.txt`. Atribución visible en Escritura y Créditos.

## Audio de pronunciación

92 archivos MP3 generados localmente con **Open JTalk / pyopenjtalk** y la voz
**Mei**, MMDAgent Project Team, Nagoya Institute of Technology, copyright 2009–2013.
Voz bajo CC BY 3.0; licencia en `public/audio/LICENSE-Mei.txt`.

Conversión a MP3 a 64 kbit/s, reproducción lenta mediante el reproductor. No se
distribuye el modelo de voz ni el diccionario. Los audios continúan en revisión
lingüística y auditiva; no se graba ni evalúa la voz del estudiante.

## Curso y recursos visuales

Textos y ejercicios originales en los JSON de `content/`, con estado editorial
`reviewed: false` donde corresponde. Los objetivos iniciales toman como referencia
[Irodori, The Japan Foundation](https://www.irodori.jpf.go.jp/en/starter/pdf.html).
No se copian sus lecciones, ilustraciones o grabaciones; no hay afiliación ni
certificación JLPT.

Escena de Kioto, geometría, shaders, texturas, hojas y tinta: creación procedural
del proyecto. Pósteres WebP capturados de esa escena. Iconos PNG derivados del SVG
original de la plataforma. Procedencia: `content/assets-licenses.json`.
Las imágenes de referencia del proceso de diseño no se distribuyen con el sitio.

## Bibliotecas y herramientas

- React, Vite, Three.js y Supabase: MIT. Lucide: ISC.
- Workbox: MIT; registro y actualización de la aplicación instalable.
- `svg-path-properties`: MIT; solo se utiliza para preparar geometría.
- Playwright: Apache-2.0; herramienta de captura del video.
- Remotion: [Remotion License](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
  No es MIT; revisa sus condiciones para el tamaño y uso de tu organización.
- ffmpeg: herramienta local de conversión; sus binarios no se redistribuyen.

El video no incorpora música ni SFX de terceros. Añade únicamente pistas con
licencia y atribución verificadas. Distribuye `promo/ATTRIBUTION.txt` junto a las
piezas que incorporan las adaptaciones KanjiVG.
