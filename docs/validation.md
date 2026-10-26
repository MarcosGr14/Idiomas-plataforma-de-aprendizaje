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

## Integración del sistema de tinta — 2026-10-23

- TypeScript de la app y de Remotion correcto; lint raíz aprobado. Build Vite/PWA aprobado (88 recursos precache, ~1,97 MiB).
- Captura Playwright con Brave local, perfiles aislados y reloj explícito. Recapturadas las pantallas con la paleta compartida; manifiesto en promo/public/captures/manifest.json.
- KanjiVG preserva el orden original de los recorridos. La máscara sobre Yuji Boku termina asentando los contornos de la fuente, que no coinciden exactamente con los del dataset.
- Sin cambios de lógica en XP, rachas, SRS, cuentas o preferencias de movimiento; no se añadieron suites de pruebas para esta fase estética.
- Taste lint: 0 FAIL / 0 WARN tras documentar sombras y reflejos pedidos por Marcos. Impeccable: solo avisos de escalas de tipografía y radios del documento promocional anterior, actualizado al sistema actual.
- Renders completos de 480p terminados: horizontal 854×480 y vertical 270×480. Ambos decodifican 1.200 fotogramas a 30 fps, duran 40,000 s y contienen solo video. Informe regenerable local: promo/out/render-verification.json.
- Revisadas hojas de contacto de ambos montajes a un fotograma por segundo, los seis barridos horizontales y muestras de lección/diagnóstico; sin planos vacíos ni mezcla incorrecta de capas en esas muestras. Pósteres finales generados.
- Revisor independiente: `ship` para el sistema visual compartido, las composiciones y las muestras de transición examinadas. No certifica reproducción temporal íntegra ni aprobación editorial de Marcos.
- Esta entrega es la revisión completa de 480p. Los másteres HD/4K quedan para después de revisarla; el comando de render está documentado. No equivale a verificación de despliegue o hardware físico.

## Exportación QHD — 2026-10-24

Terminado `promo/out/promo-16x9-1440p.mp4`: 2560×1440, H.264, 30 fps, 40 segundos exactos, 1.200 fotogramas decodificados y sin audio (18.603.650 bytes). Revisada hoja de contacto a 1 fps. Exportación directa desde Remotion, sin ampliar el preview de 480p. Diseño conservado; capturas interiores mantienen su resolución original.

El comando `node promo/scripts/render.mjs qhd` guarda capítulos reanudables en `out/qhd-scenes/`. ANGLE acelerado por defecto, `PROMO_GL=swangle` como alternativa por software. Se observaron mensajes de cierre de navegador al finalizar algunos capítulos; los siete terminaron y el archivo unido pasó la decodificación completa. MP4 y cachés ignorados por Git.

## Fase 1 de cuentas y despliegue — 2026-10-24

- Implementación de cuentas incluida en el commit existente `c153063`: no se rehízo ni sobrescribió el trabajo ya publicado por Marcos.
- 30 pruebas Vitest aprobadas en 7 archivos; formato y build TypeScript/Vite/PWA aprobados. Persiste el aviso conocido de Three.js >500 kB; carga diferida. Sin cambios de lógica en este cierre.
- Ronda local anterior con Supabase simulado: registro, acceso inválido/válido, recuperación, reenvío, contraseñas distintas, cambio de contraseña y salida. Capturas 1440/768/360 px, sin errores de página. Pruebas de lógica cubren pendientes offline, conflictos, serialización, callbacks y exclusión entre pestañas.
- Revisor independiente confirmó las correcciones de concurrencia entre pestañas y errores del callback en fragmento; no encontró bloqueos adicionales. La documentación final se completó en el agente principal porque el documentador no pudo ejecutarse.
- Marcos reporta creación del proyecto Supabase, despliegue en Cloudflare y registro de cuenta correcto. Ese registro es evidencia del usuario, no una prueba ejecutada por el agente.
- Verificado en navegador integrado el dominio HTTPS publicado: portada, formulario de acceso, recuperación, aula como invitado y lección de vocales. Botón de audio activado sin error registrado; no certifica revisión auditiva. Callback con error de enlace vencido probado mediante carga completa: limpia el fragmento y muestra un mensaje seguro en Cuenta.
- Comprobación móvil publicada: viewport solicitado de 360 px; el navegador integrado reportó ancho efectivo de 319 px y documento de 309 px, sin desbordamiento horizontal. Captura inspeccionada. Se restauró el viewport al terminar; esto no sustituye prueba en teléfono físico.
- Configuración local apunta al proyecto indicado. Consulta real `/auth/v1/settings`: HTTP 200, proveedor email habilitado, `disable_signup=false`, `mailer_autoconfirm=false`. Sin imprimir claves.
- Consulta real anónima `/rest/v1/learning_progress?select=revision&limit=0`: HTTP 401, código 42501. Confirma denegación al rol anónimo; NO demuestra por sí sola aislamiento entre usuarios ni presencia correcta de todas las migraciones.
- El panel Supabase redirige a inicio de sesión en el navegador disponible. Pendientes: inspeccionar ambas migraciones, RLS y RPC con usuarios autenticados, correos de confirmación/recuperación, sincronización real y conflictos entre dispositivos.
- Hosting observado: dominio `workers.dev`, distinto de la propuesta original Pages. No se han cambiado infraestructura, permisos ni plan; gratuidad/facturación no verificadas.
- El acceso HTTP automatizado al dominio devolvió 403; la navegación interactiva sí funcionó. No se atribuye ese 403 a un fallo de la aplicación.

### Inspección autenticada de Supabase — 2026-10-24

- Sesión abierta por Marcos. Organización en plan Free, proyecto Idiomas Healthy.
- Tabla `learning_progress`: RLS activo, `revision bigint default 1`, cuatro políticas por `auth.uid() = user_id`. Función `save_learning_progress` presente, SECURITY DEFINER, search_path vacío, propietario derivado de auth.uid y control de revisión/validación del payload conforme a la migración.
- Un usuario y un registro de progreso; no se imprimieron identidades ni contenido del aprendizaje. Las estructuras de las dos primeras migraciones están instaladas; “No migrations” en dashboard refleja ausencia de historial, no ausencia del esquema.
- Hallazgo: los grants predeterminados conservaban TRUNCATE/REFERENCES/TRIGGER para authenticated. Aplicada migración `202610240002_progress_least_privilege.sql`: revocar todos los privilegios de tabla a public/anon/authenticated y conceder solo SELECT a authenticated. No se modificaron filas.
- Verificación real de privilegios: authenticated SELECT y EXECUTE RPC true; INSERT/UPDATE/DELETE/TRUNCATE false; anon SELECT y EXECUTE RPC false. Registro de progreso conservado (1).
- Transacción de solo lectura: sujeto del propietario + rol authenticated ve una fila; otro sujeto simulado ve cero filas. Ambas aserciones aprobadas, ROLLBACK. No es una prueba con dos cuentas reales ni de sincronización en dispositivos.
- Site URL y los dos callbacks exactos `?auth=confirm` / `?auth=recovery` apuntan al dominio publicado. No se alteró su configuración.
- Pendientes acotados: SMTP/entrega de correos, recuperación completa por email y sincronización real entre dispositivos. Estado general de Supabase mostraba aviso de incidencia, pero las consultas anteriores terminaron correctamente.

### Refinamiento de cuenta — 2026-10-24

Build y 30 pruebas existentes aprobados. Revisión visual de acceso en escritorio
y registro en viewport 360 px (documento 350 px, sin overflow). Registro/acceso,
ayuda de contraseña y reenvío siguen usando los manejadores existentes. No se
modificaron cuentas reales ni se cerró la sesión de Marcos. Enlace de portada
corregido para apuntar a Cuenta; salida existente ahora claramente identificada.

## Fase 3 · primer refuerzo — 2026-10-26

- 39 pruebas Vitest aprobadas en 8 archivos: nuevos casos de progreso corrupto,
  claves peligrosas, campos remotos inválidos, revisión local negativa e integridad
  del curso/audio. Conservados los casos de concurrencia/conflictos existentes.
- Build TypeScript/Vite/PWA y formato aprobados. Añadidos tipos Node requeridos por
  los tests de archivos. Aviso conocido Three.js >500 kB; sigue diferido.
- `npm audit` completo: 0 avisos tras actualizar serialize-javascript a 7.1.4.
  Antes: un aviso bajo en compilación; dependencias de producción sin avisos.
- Servidor local temporal sirvió el build con las cabeceras de `public/_headers`;
  HTTP 200 y CSP/X-Frame-Options verificadas. Navegador integrado: portada, lección
  de vocales y formulario de cuenta cargan sin errores de consola. Botón de audio
  cambia a «Reproduciendo…» sin bloqueo CSP. No es revisión auditiva ni login real.
- No se tocaron filas de Supabase, cuentas ni credenciales. No se prueba en esta
  ronda recuperación por correo ni sincronización real entre dispositivos.
- Añadido workflow de calidad; su resultado remoto y la aplicación de cabeceras
  en el despliegue permanecen pendientes hasta ejecutarse/publicarse.
- Alcance pedagógico sin cambios: fase 3 iniciada, no terminada.

## Fase 3 · cierre técnico — 2026-10-26

- 49 pruebas Vitest aprobadas en 11 archivos; build, typecheck y formato aprobados.
  Nuevos casos: geometría de los 46 kana, remuestreo, dirección incorrecta, garabatos,
  entradas no finitas/excesivas, quiz vacío/eventos repetidos y bibliotecas por progreso.
- Curso: 16 lecciones, 80 preguntas de práctica, 92 entradas y MP3, seis preguntas de
  diagnóstico. Integridad comprobada; 67 audios nuevos decodificados con ffmpeg sin
  errores. No se realizó revisión auditiva experta ni aprobación lingüística externa.
- `npm audit`: 0 avisos conocidos, incluyendo herramientas de desarrollo.
- Navegador CUA sobre build con CSP: lección S 5/5 → aviso +30XP, siete palabras
  programadas; biblioteca muestra12 entradas y conserva estado tras recargar. Prueba
  en invitado de origen localhost separado, sin escribir datos de cuentas reales.
- Escritura: trazo incorrecto rechazado, trazo válido de ま avanza al segundo;
  demostración completa y versiones estáticas en reducido/apagado verificadas.
  Sin errores de consola registrados en la ronda.
- Revisión visual: escritorio habitual1280,768 y viewport360. En360 el navegador
  reporta innerWidth360/clientWidth350/scrollWidth350, lienzo310: sin overflow. La
  captura excluye la barra de10px; evidencia conservada en .impeccable/review/phase3.
- Taste lint de WritingPad/Quiz: 0 FAIL/0 WARN. Inspector de navegador sustituido
  por CUA por política de control del navegador. Detector Impeccable: avisos
  orientativos mayormente históricos; sin rediseño de tokens. Revisor independiente:
  `ship`, sin hallazgos materiales dentro del alcance; documentador confirma sistema
  preservado. El numeral SVG4 unidades escala a12–15px, no es texto de4px CSS.
- Escritura diferida:94,19kB (37,24kB gzip). Three sigue diferido520,82kB, aviso
  conocido. Precache PWA160 recursos/~2,83MiB; MP3 totales868KiB en disco. No se
  midió rendimiento en un teléfono físico ni se afirmaron Core Web Vitals reales.
- Dominio publicado consultado antes de este cierre:HTTP200 y CSP, DENY,
  nosniff, no-referrer y Permissions-Policy correctas. Esta comprobación confirma el
  refuerzo anterior, no el despliegue de las nuevas lecciones todavía no publicadas.
- Pendientes editoriales/operativos: revisión de borradores/audio y comprobaciones
  de correo/sincronización reales previamente documentadas; no bloquean declarar
  implementado este alcance técnico, sí presentar el curso como contenido validado.

### Publicación del cierre

CI de GitHub aprobado para `8e95e0a` (implementación, run40404563437) y `f5e7879`
(README, run40404654954). Cloudflare Workers Builds de `8e95e0a` terminó success.
El dominio público sirvió `/assets/index-iMRpAma7.js` con los identificadores de las
nuevas lecciones `hiragana-s` y `hiragana-rhythm`. Se confirma publicación de los
archivos; no se ejecutó una nueva sesión autenticada de aprendizaje en producción.
