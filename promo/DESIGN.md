---
name: Idiomas — tinta compartida
description: Extensión audiovisual de la identidad de Idiomas para presentar el piloto de japonés.
colors:
  paper: "#FBF8F3"
  ink: "#14110F"
  red: "#C8102E"
  muted: "#64685e"
  night: "#151715"
  white: "#ffffff"
  orange: "#d74b30"
  inactive: "#b0aaa2"
  bezel: "#262a29"
  metal: "#aab0ad"
  foot: "#989f9a"
  camera: "#080b0a"
typography:
  display:
    fontFamily: '"Manrope Variable", sans-serif'
    fontSize: "76px"
    fontWeight: 550
    lineHeight: 1.08
    letterSpacing: "-0.04em"
  display-vertical:
    fontFamily: '"Manrope Variable", sans-serif'
    fontSize: "90px"
    fontWeight: 550
    lineHeight: 1.06
    letterSpacing: "-0.04em"
  body:
    fontFamily: '"Manrope Variable", sans-serif'
    fontSize: "27px"
    lineHeight: 1.5
  seal:
    fontFamily: '"Noto Serif JP", serif'
    fontWeight: 600
    lineHeight: 1
  calligraphy:
    fontFamily: '"Yuji Boku"'
    fontSize: "108px"
rounded:
  bezel: "22px"
  screen: "8px"
  phone-bezel: "42px"
  phone-screen: "32px"
components:
  device-bezel:
    backgroundColor: "{colors.bezel}"
    rounded: "{rounded.bezel}"
    padding: "16px"
  phone-bezel:
    backgroundColor: "{colors.bezel}"
    rounded: "{rounded.phone-bezel}"
    padding: "11px"
  brand-seal:
    textColor: "{colors.red}"
    typography: "{typography.seal}"
---

# Design System: Idiomas — promoción

## Overview

**Creative North Star: "Tinta que abre un mundo"**

La escritura abre el callejón de Kioto y acompaña las pantallas reales de estudio.
La pieza conserva el papel plano, la tinta y el rojo de Idiomas; el movimiento
concentra energía en entradas y barridos, con pausas para leer el producto.
La dirección aprobada está en `STORYBOARD.md`.

`../src/design/tokens.ts` es la fuente compartida de colores, familias y movimiento.
`Promo.tsx` importa esos tokens y los componentes de la aplicación;
`../src/components/brand/BrandStyles.tsx` publica las variables CSS y las fuentes
locales. El frontmatter documenta sus valores y las medidas de esta composición;
no constituye una segunda configuración de marca. Los tamaños se expresan sobre
el lienzo de referencia, no como escala responsive de la web. El sistema general
sigue documentado en `../DESIGN.md`.

**Key Characteristics:**

- Apertura de caligrafía sobre papel, sin grano ni viñeta.
- Pincel SVG determinista y sello 文 compartidos con la aplicación.
- Siete escenas, 1200 fotogramas a 30 fps: 40 segundos.
- Capturas reales del piloto de japonés y progreso señalado como demostración.
- Composición independiente para horizontal y vertical.

Este documento describe el código actual. Las capturas y los montajes completos
están en proceso de renderizado y revisión; no se declara aquí una aprobación
visual o temporal de los renders finales.

## Colors

El papel es la base de apertura, producto y cierre; la tinta sostiene la lectura.
El rojo une sello, pinceladas, kana de práctica y modo destacado. `muted` identifica
el aviso de demostración; `inactive` diferencia los modos no destacados.

El callejón conserva los colores de su captura y recibe un velo de legibilidad
con `brand.colors.heroScrim`. Las hojas usan rojo y naranja compartidos. Las
carcasas combinan `bezel`, `metal`, `foot` y `camera`; las pantallas conservan el
aspecto de la web. Todos estos colores proceden de los tokens de la aplicación.

## Typography

Manrope Variable organiza el español. Noto Serif JP compone el sello 文.
Yuji Boku se limita a 日本語 en la apertura: su contorno tipográfico se revela
mediante máscaras que siguen el orden de trazos KanjiVG. El kana い de la escena
de práctica utiliza directamente la geometría de `InkCharacter`. Los componentes
japoneses incluyen `lang="ja"` y nombres accesibles.

La caligrafía usa un SVG de 109 unidades: el tamaño del frontmatter pertenece a
ese espacio; cada carácter ocupa 450px en horizontal y 316px en vertical.
Los titulares generales siguen los tokens documentados arriba; el hero usa
106px horizontal y 90px vertical. El cierre usa 68px y 92px; la marca, 58px y
78px. El cuerpo vertical aumenta a 32px. Las máscaras de palabras reservan
0.07em inferior con margen compensado para evitar cortar descendentes.

## Layout

Lienzos de referencia: 1920×1080 y 1080×1920. El render escala todo el lienzo según
su ancho de salida. La versión vertical cambia posiciones, tamaños y capturas:
no recorta el montaje horizontal. Los encabezados generales parten de x=110,
y=75 y ancho 1500px; en vertical, x=80, y=110 y ancho 920px. Las posiciones de
encabezado se importan de `motion.heading`.

| Tiempo nominal | Composición |
|---|---|
| 0–3,5 s | 日本語 sobre papel, sello rojo y pincelada inferior |
| 3,5–9 s | Callejón real a sangre y titular |
| 9–15 s | Inicio y diagnóstico; laptop horizontal, teléfono vertical |
| 15–23 s | Lección, escritura libre y audio en teléfono; kana lateral horizontal |
| 23–29 s | Progreso y biblioteca; monitor horizontal, teléfono vertical |
| 29–34 s | Selector de movimiento; nombres de modos laterales en horizontal |
| 34–40 s | Marca, frase final y tres dispositivos recombinados |

Los límites son nominales: cada escena siguiente comienza 22 fotogramas antes
del límite para revelarse mientras la anterior continúa. En vertical, los
encabezados quedan arriba y el teléfono ocupa la zona central; el cierre coloca
el monitor arriba, la laptop abajo a la izquierda y el teléfono a la derecha.
La apertura dura 105 fotogramas y reserva el protagonismo a los tres caracteres.

## Elevation & Depth

El papel permanece plano. Los dispositivos flotan con
`drop-shadow(0 24px 28px var(--shadow))` y un reflejo sutil basado en
`brand.colors.reflection`. Estos tratamientos pertenecen a las carcasas del
montaje. La profundidad del callejón y de las pantallas procede de la aplicación
capturada; no se añaden sombras a los paneles de estudio.

## Shapes

Las carcasas usan los radios del frontmatter. La pantalla de escritorio conserva
la relación 1440/900; la móvil, 390/844. La base de laptop y el cuello trapezoidal
con pie ovalado del monitor distinguen dispositivos propios sin marcas ajenas.
Las pinceladas tienen bordes irregulares, punta afinada y zonas secas; las hojas
reutilizan `maplePoints` de la aplicación.

## Components

`InkBrush` genera geometría SVG reproducible a partir de puntos, progreso y
semilla, sin temporizadores ni azar no controlado. Se reutiliza en máscaras,
subrayados y práctica. `InkCalligraphy` conserva el contorno Yuji Boku y revela
los trazos de cada carácter antes del asentamiento final de tinta.

`BrandSeal` muestra el mismo 文 rojo de la web en apertura y cierre. `Stamp`
añade caída, rotación y rebote con `motion.seal`. Los titulares entran palabra
a palabra en 14 fotogramas, con separación de dos; la última palabra recibe un
subrayado de 11 fotogramas. `motion.ease` gobierna la entrada del texto.

`Sweep` revela cada capítulo con una máscara de 48 pinceladas durante
`motion.wipe` (22 fotogramas), usando `motion.wipeEase`. Las transiciones hacia
las escenas claras añaden tres hojas. `Device` combina captura y carcasa; su
entrada mezcla desplazamiento de 135px, escala 0.88→1 y giro ±3° mediante
`motion.enter`. `Media` reproduce capturas silenciadas y mantiene su último
fotograma al terminar; el cierre usa imágenes fijas.

El selector grabado presenta los modos completo, reducido y apagado de la web.
No es un control interactivo de las transiciones del vídeo. La URL del cierre
solo aparece cuando se proporciona `publicUrl`, configurado mediante `PROMO_URL`.
El montaje no incluye audio por defecto.

## Do's and Don'ts

- **Do** importar colores, familias, sello, pincel y movimiento desde la aplicación.
- **Do** conservar el papel plano y recomponer ambos formatos con capturas reales.
- **Do** revisar escenas y ambos montajes completos antes de aprobar la entrega.
- **Do** mantener visible el aviso de datos de demostración.
- **Don't** recuperar la apertura oscura ni añadir un anuncio de mandarín.
- **Don't** presentar escritura libre como evaluación automática de trazos.
- **Don't** prometer grabación o evaluación de voz, ni bibliotecas inexistentes.
- **Don't** inventar una URL ni incorporar activos sin procedencia y licencia.
