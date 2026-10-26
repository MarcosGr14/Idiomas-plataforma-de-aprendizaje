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

## Cuentas — cierre 2026-10-24

Formularios de acceso, registro, recuperación y contraseña conservan Manrope,
Noto Serif JP, sello 文, superficies y acciones de la aplicación. Se reutilizan
`page-title`, `account-form`, botones y navegación; no hay rediseño global ni
nuevas animaciones. Campos con etiquetas visibles, opción de mostrar contraseña,
mensajes de estado/error y controles deshabilitados durante peticiones.

Revisadas capturas locales de escritorio/tablet/móvil y formulario publicado en
ancho móvil. Inspector taste local: 0 FAIL, 5 WARN; los avisos de paleta, logo,
escala del título y espacio lateral se conservan por identidad aprobada y ancho
limitado del formulario. Detector impeccable sobre Account: sin hallazgos.
DESIGN.md y sus tokens se conservan: esta extensión no crea otro sistema visual.
La revisión documental final se realizó en el agente principal tras fallar el
agente documentador. Este cierre solo actualiza documentación, sin retoques visuales.

## 2026-10-24 — Formularios de cuenta simplificados

Acceso y registro centrados en una columna de 440 px, sin la caja gris ni la lista
plana de acciones anterior. Jerarquía convencional: título, campos, recuperación,
acción principal y cambio entre acceso/registro. Visibilidad de contraseña dentro
del campo; reenvío de confirmación en disclosure. Etiquetas de 14 px, campos de
16 px y controles de al menos 44 px. Identidad, fuentes y modos de movimiento
conservados; no se añadieron animaciones. Cuenta muestra salida explícita y Ajustes
incluye acceso a su gestión. Revisado en navegador a 360 px y escritorio, sin
desbordamiento móvil. Revisión/documentación realizadas en el agente principal
para limitar coste tras la indisponibilidad previa del documentador.

## 2026-10-26 · cierre de fase 3

Escritura conserva Manrope, papel, tinta y rojo. La geometría KanjiVG sustituye la
silueta tipográfica libre: guía numerada, inicio destacado y tinta compartida en
trazos aceptados/demostrados. Controles breves «Ver trazos»/«Repetir»; explicaciones
de alcance bajo el lienzo para priorizar la práctica en móvil. El recorrido agrupa
las dos unidades disponibles y la biblioteca informa entradas por descubrir.

Revisión CUA escritorio/768/360, sin overflow; contraste reforzado en el trazo
activo, notas y números legibles. Se conserva estilo editorial-greeting existente;
no se sortea identidad nueva. Taste lint0/0, revisión independiente `ship`, sistema
preservado según documentador. No se generaron rasters de producción ni fuentes
nuevas: solo subconjuntos adicionales de la misma Noto Serif JP ya licenciada.
