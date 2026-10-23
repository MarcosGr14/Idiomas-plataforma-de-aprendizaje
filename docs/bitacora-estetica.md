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
