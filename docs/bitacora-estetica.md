# Bitácora estética

## 2026-10-22 · piloto inicial

Manrope para interfaz española y Noto Serif JP para caracteres. Superficies claras, tinta oscura, rojo en acciones, iluminación cálida en el diorama Three.js. Adaptación móvil verificada en navegador (ancho efectivo 355 px), foco visible, movimiento reducido. Ajuste final: retirar la etiqueta sobre el título de siguiente lección tras revisión independiente. Cambios estéticos revisados visualmente, sin suite específica.

El nuevo brief `docs/10-hero-escena-3d.md` apareció durante el cierre. Su sustitución del diorama por un callejón de Kioto atmosférico es trabajo pendiente; esta entrega no afirma cumplir ese nuevo rediseño ni sus cifras de rendimiento. También quedan pendientes la barra inferior y los tres modos de calidad definidos en el nuevo sistema; actualmente hay movimiento completo o pausado y respeto a prefers-reduced-motion.

## 2026-10-22 — Hero nocturno aprobado
Se sustituye solo el diorama del home por el callejón de Kioto: perspectiva baja,
fachadas con celosías, pagoda de cinco niveles, faroles, luz cálida, niebla por
capas, arces y partículas animadas en GPU. Composición inmersiva con texto a la
izquierda; en móvil, título y CTA sobre la zona inferior oscura. Se mantienen
Manrope, Noto Serif JP, paleta y el resto de las pantallas.
Se añaden controles completo/reducido/apagado, pausa, pósteres propios y tarjeta
accesible de letreros. Los modos tienen pruebas de lógica; no se añaden pruebas
para estilos. El nuevo brief se aplica únicamente al alcance aprobado.

## 2026-10-23 — Composición promocional

Guion aprobado de 40 s. Se extiende la identidad Manrope/Noto Serif JP a video,
con apertura oscura y callejón real, transición a papel claro, titulares amplios,
revelados por palabras y entradas amortiguadas. Marcos de dispositivos originales.
El vertical se recompone con el celular dominante. No se modifica la dirección
visual de la web ni se anuncia mandarín como disponible. Previews por escena a
480p antes de los másteres. No se agregan pruebas para composición puramente visual.

## 2026-10-23 — Sistema de tinta aprobado

Marcos aprobó el moodboard: papel #FBF8F3, tinta #14110F, rojo #C8102E y mayor energía comercial. Tokens, fuentes y sello se extraen a la app como fuente de verdad para Remotion. InkBrush recibe progreso y semilla; no programa animaciones ni altera la política completo/reducido/apagado. KanjiVG guía la escritura; Yuji Boku queda solo en la apertura. Sin textura global ni recursos stock. Cambio visual, sin nuevas pruebas funcionales; comprobación de tipos para integración.

## 2026-10-23 — Intro y continuidad de tinta

- Intro de 3,5 s sobre papel plano: 日本語 con recorridos KanjiVG, Yuji Boku y sello 文 compartido.
- Barridos SVG de InkBrush entre los siete capítulos, hojas del hero, titulares por palabras y subrayados rojos de punta seca.
- Mensaje unificado «Un mundo nuevo. Empieza en japonés.»; cierre con el mismo sello.
- Dos composiciones independientes y tokens de movimiento importados de la app; sin grano ni viñeta.
- Ajustes estéticos: sin nuevas pruebas de lógica ni cambios en la política de movimiento. Capturas actualizadas y renders completos de 480p terminados.

### Revisión del barrido

Borde refinado con 48 cerdas y puntas orgánicas para eliminar los grandes escalones del primer montaje. Revisión independiente: `ship` para sistema visual y composiciones examinadas; montajes completos verificados a 40 s/1.200 fotogramas y revisados mediante hojas de contacto. La exportación omite audio silencioso y fija la duración de cada clip para evitar pausas por relleno AAC al concatenar.

### Entrega de previsualizaciones

Completados ambos montajes de 480p, catorce clips por escena y pósteres horizontal/vertical. Código y documentación versionados; medios pesados ignorados. Sin música, sin URL inventada. Los másteres HD/4K permanecen como siguiente exportación tras revisar esta versión.

## Exportación QHD — 2026-10-24

Terminado `promo/out/promo-16x9-1440p.mp4`: 2560×1440, H.264, 30 fps, 40 segundos exactos, 1.200 fotogramas decodificados y sin audio (18.603.650 bytes). Revisada hoja de contacto a 1 fps. Exportación directa desde Remotion, sin ampliar el preview de 480p. Diseño conservado; capturas interiores mantienen su resolución original.

El comando `node promo/scripts/render.mjs qhd` guarda capítulos reanudables en `out/qhd-scenes/`. ANGLE acelerado por defecto, `PROMO_GL=swangle` como alternativa por software. Se observaron mensajes de cierre de navegador al finalizar algunos capítulos; los siete terminaron y el archivo unido pasó la decodificación completa. MP4 y cachés ignorados por Git.
