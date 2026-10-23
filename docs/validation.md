# Validación del piloto

- Compilación TypeScript + Vite y generación de service worker: correctas.
- Vitest: 6 pruebas aprobadas (XP idempotente, mejor nota, fechas SRS, límites de intervalo, rachas y repetición sin duplicar XP).
- Navegador: primera lección completada 5/5, +30 XP, cinco entradas de repaso, siguiente lección y persistencia después de recargar.
- Portada y aula revisadas en escritorio y móvil; ancho efectivo móvil 355 px por zoom del navegador. Sin desbordamiento horizontal medido.
- Reproducción del primer MP3 activada desde el botón sin error de carga. 25 archivos generados; no hubo revisión auditiva/lingüística humana.
- Inspector automático de taste no disponible por ausencia de Chrome/Chromium local; se utilizó el navegador integrado. Lint de taste: marca de check en PDF sustituida por texto. Avisos conservados: padding de fechas y sombra de notificación flotante.
- Detector impeccable: sin hallazgos. Revisor independiente: capturas válidas, una corrección solicitada (etiqueta previa al título), resuelta y confirmada; veredicto ship limitado a esa corrección.
- No verificado: autenticación/RLS contra Supabase real, despliegue Cloudflare, instalación en dispositivos físicos, rendimiento FPS móvil real, impresión PDF en todos los sistemas ni flujo offline completo.
- La versión actual es un piloto de cinco lecciones, no las doce unidades completas ni el nuevo rediseño atmosférico solicitado por el brief agregado durante el cierre.

## Cierre hero Kioto — 2026-10-23

- Build TypeScript/Vite/PWA correcto; 91 entradas precache (~2 MiB), incluidos ambos pósteres WebP.
- 11 pruebas Vitest aprobadas; cinco nuevas cubren migración/preferencias, sistema reducido, indicios del dispositivo, degradación y cadencia de 30 fps con 1200 timestamps fluctuantes de 60 Hz.
- `npm run lint` correcto. Three.js produce aviso de chunk >500 kB sin comprimir; se importa de forma diferida (~132 kB gzip para Three; escena ~10 kB gzip).
- Navegador integrado: viewports 1440, 768 y 360 px; sin desbordamiento horizontal medido. Revisados estados completo, reducido, apagado, pausa y tarjeta de traducción (花 → Flor).
- Apagado: el componente Three no se monta; póster local visible. Reducido: mantenido después de corregir el limitador, sin degradación causada por pérdida del resto temporal.
- Taste lint: 0 FAIL / 0 WARN en los componentes del hero. Inspector automatizado no pudo arrancar por ausencia de Chrome/Edge/Chromium compatible; se usó navegador integrado para capturas y mediciones.
- Detector impeccable: sin hallazgos. Revisión independiente: una corrección material (cadencia), resuelta; disposition `ship` limitada a esa corrección. Documentador actualizó DESIGN y sidecar conservando tokens globales.
- Pósteres: captura de la escena propia, ~104 KiB escritorio y ~40 KiB móvil. No hay modelos o texturas descargados; las texturas se crean en canvas.
- No se afirma medición de 60/30 fps en hardware físico. Pendientes: teléfono de gama media, instalación/offline en dispositivos físicos y comprobación independiente de despliegue Cloudflare. El movimiento móvil usa puntero/scroll, sin pedir acceso al giroscopio.
