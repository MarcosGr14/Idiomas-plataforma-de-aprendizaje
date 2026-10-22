---
name: Idiomas
description: Japonés en contexto y un espacio claro para estudiar.
colors:
  paper: "#f9f9f6"
  ink: "#252923"
  muted: "#64685e"
  red: "#c82f27"
  red-hover: "#a92620"
  surface: "#efefea"
  line: "#dcded4"
  white: "#ffffff"
  secondary: "#e7e8e1"
  secondary-hover: "#dadcd1"
  field-line: "#cbd0c1"
  focus: "#a94416"
  street: "#252c29"
  street-text: "#faf9ed"
  sign-yellow: "#efbd3a"
  sign-orange: "#d74b30"
typography:
  display:
    fontFamily: '"Manrope Variable", sans-serif'
    fontSize: "clamp(48px, 6.2vw, 90px)"
    fontWeight: 550
    lineHeight: 1.06
    letterSpacing: "-0.04em"
  headline:
    fontFamily: '"Manrope Variable", sans-serif'
    fontSize: "clamp(26px, 3vw, 40px)"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.035em"
  title:
    fontFamily: '"Manrope Variable", sans-serif'
    fontSize: "25px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.035em"
  body:
    fontFamily: '"Manrope Variable", sans-serif'
    fontSize: "14px"
    lineHeight: 1.8
  label:
    fontFamily: '"Manrope Variable", sans-serif'
    fontSize: "13px"
    fontWeight: 650
  japanese:
    fontFamily: '"Noto Serif JP", serif'
    fontSize: "30px"
    lineHeight: 1.6
rounded:
  control: "5px"
  segment: "4px"
  segmented: "6px"
  toast: "7px"
  circle: "50%"
spacing:
  compact: "8px"
  control: "12px"
  small: "16px"
  medium: "20px"
  panel: "24px"
  large: "32px"
  section: "48px"
components:
  button-primary:
    backgroundColor: "{colors.red}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "13px 23px"
  button-primary-hover:
    backgroundColor: "{colors.red-hover}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "13px 23px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
  review-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    padding: "32px"
  answer:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "16px 20px"
---

# Design System: Idiomas

## Overview

**Creative North Star: "Aprender a leer la calle que te da la bienvenida"**

La bienvenida conecta caracteres japoneses con una calle tridimensional hecha en código. El entorno de estudio usa papel claro, tinta y superficies discretas para sostener la lectura. La personalidad procede de los caracteres, la tipografía y la señalética; las métricas mantienen un tratamiento sobrio.

Este documento describe la implementación de `src/styles.css`, `src/App.tsx` y sus componentes. Los valores iniciales del brief se han afinado en el código. El nombre sigue siendo provisional. La escena terminada tiene una base oscura localizada, mientras el resto de la interfaz conserva la base clara acordada.

**Key Characteristics:**
- Blanco de papel, tinta y rojo de señalética.
- Manrope para español; Noto Serif JP para japonés.
- Paneles planos, listas abiertas y divisores finos.
- Calle 3D propia como bienvenida y contexto de lectura.
- Controles compactos con foco visible y movimiento configurable.

## Colors

### Primary

El rojo de señalética identifica acciones principales, marca y caracteres destacados; su variante profunda comunica hover.

### Secondary

El amarillo de escaparate y el naranja cálido pertenecen a los rótulos de la escena. No se trasladan automáticamente a números de experiencia, racha o estadísticas. Los estados correctos usan verdes apagados; los incorrectos, tonos cálidos con borde y explicación textual.

### Neutral

Papel es el fondo global; tinta es el texto principal. Muted sostiene información secundaria. Surface agrupa ejercicios y paneles; line separa filas. Los campos blancos usan un borde propio. El fondo oscuro de la calle mantiene legibles los rótulos y el pie de escena.

**The Acción Rule.** El rojo guía la acción y los caracteres destacados; las métricas de estudio permanecen en tinta.

## Typography

**Display Font:** Manrope Variable, sans-serif.
**Body Font:** Manrope Variable, sans-serif.
**Japanese Font:** Noto Serif JP, serif.

La familia latina combina títulos abiertos de peso medio con controles compactos. La serif japonesa conserva el protagonismo y la legibilidad de los caracteres. No existe una escala matemática única: los roles responden a bienvenida, lectura y operación.

### Hierarchy

- **Display:** titular del home; se adapta a móvil y permite dos líneas.
- **Headline:** título de las pantallas del aula; en móvil usa 28px y altura de línea 1.2.
- **Title:** títulos generales de sección; los paneles densos usan variantes de 16–23px.
- **Body:** prosa de lección con medida máxima de 70ch. El texto operativo suele usar 12–13px; el hero de escritorio usa 16px.
- **Label:** acciones principales; metadatos existentes usan 11–12px y no sirven de referencia para párrafos largos.
- **Japanese:** ejemplos de vocabulario; los caracteres de práctica y presentación amplían su tamaño según contexto.

**The Escritura Rule.** El texto japonés lleva `lang="ja"` y la familia japonesa; los caracteres que se estudian son contenido, no sustitutos de iconos de interfaz.

## Layout

El home alcanza 1600px y usa márgenes laterales del 6%; las secciones de contenido alcanzan 1300px. El titular y la invitación a empezar comparten fila sobre una calle horizontal. Las secciones alternan texto abierto, filas de lección y una despedida roja.

El aula tiene una barra lateral fija de 244px y contenido con padding horizontal fluido. La pantalla inicial combina una lección principal y un panel diario de 250px; las listas se apoyan en divisores, no en tarjetas independientes. A 1100px la barra pasa a 210px y el panel diario se coloca bajo la lección.

A 760px la navegación lateral se convierte en menú desplegable bajo una barra de 72px; el aula usa márgenes de 20px y el home de 22px. Las composiciones se apilan. La calle usa un lienzo de 320px de alto. Las reglas de ancho muy pequeño apilan también respuestas y controles cuando hace falta; verificar siempre a 360px. La prosa conserva medidas acotadas incluso en pantallas grandes.

## Elevation & Depth

La interfaz de estudio es plana: diferencia regiones mediante tonos claros, espaciado y bordes finos. La escena tiene profundidad real de Three.js; no es una textura decorativa aplicada a paneles. El aviso flotante es la excepción de elevación, con sombra `0 8px 30px #0002`.

**The Superficie Rule.** Los paneles de estudio se separan mediante tono y espacio; la sombra corresponde al aviso que flota sobre ellos.

## Shapes

Paneles y filas conservan esquinas rectas. Los controles usan una curva pequeña; el selector segmentado mantiene curvas internas y externas cercanas. Los círculos se reservan para estados, indicadores y el interruptor. No se reproduce el volumen de la escena en los contenedores del aula.

## Components

### Buttons

Acciones directas con verbo en español, fondo rojo y texto blanco; secundarias con fondo neutro. Ambas tienen altura mínima de 48px y pueden incluir un SVG. Las acciones de texto no reciben una caja adicional. Los botones deshabilitados usan opacidad 0.5; no responden al escalado de presión.

Hover se limita a dispositivos con puntero fino. La presión escala a 0.98 con transición de 140ms. El foco tiene un contorno de 3px con separación de 4px. Se omiten transiciones con la preferencia de movimiento reducido del sistema o del producto.

### Inputs / Fields

Campos blancos de borde fino, altura mínima de 46px y el mismo foco visible de los botones. Etiquetas persistentes o accesibles describen cada campo; el placeholder es una ayuda. Los selectores de ajustes usan una agrupación segmentada con selección en tinta y texto blanco.

### Cards / Containers

Paneles de repaso y cuestionario usan superficie tonal, padding de 32px en escritorio y ninguna sombra. Las lecciones y el vocabulario se presentan como filas con divisor inferior. Las respuestas añaden borde de selección y estados correctos/incorrectos con texto explicativo.

### Navigation

La navegación pública es horizontal. La navegación del aula combina SVG y texto, con destino activo sobre un relleno gris verdoso y peso 700. En móvil se accede desde el menú de la barra superior; el destino conserva el texto visible.

### Calle japonesa

La escena propia contiene rótulos legibles, farolillos, edificios y una traducción activable. Three.js se carga para el home. En movimiento completo hay una oscilación lenta de cámara; el modo reducido presenta un render estático. Los modos y el fallback pertenecen al componente; una escena fallida no debe impedir comenzar el aprendizaje.

## Do's and Don'ts

### Do:
- **Do** conservar el papel claro y la tinta como base de las pantallas de estudio.
- **Do** usar rojo para acciones principales y caracteres destacados.
- **Do** mantener las listas legibles con divisores y la prosa con medida limitada.
- **Do** preservar foco visible, etiquetas accesibles y preferencias de movimiento.
- **Do** probar las composiciones a 360px con texto japonés y español real.

### Don't:
- **Don't** convertir todas las secciones en tarjetas con sombra.
- **Don't** añadir etiquetas decorativas por encima de títulos ni mayúsculas ornamentales.
- **Don't** usar amarillo claro para texto de lectura sobre papel.
- **Don't** convertir caracteres japoneses en iconos funcionales sin significado explícito.
