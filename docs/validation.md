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
