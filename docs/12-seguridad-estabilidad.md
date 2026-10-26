# Fase 3 — estabilidad, seguridad y rendimiento

## Primer incremento · 2026-10-26

Antes de ampliar japonés, reforzamos los límites de entrada del motor existente.
El JSON local/remoto se reconstruye campo por campo: tipos, fechas de calendario,
puntuaciones, intervalos, metas y claves. Se preservan registros válidos y se omiten
los inválidos; no se combinan XP de dispositivos. Las colecciones se acotan a
20.000 entradas, las claves a 120 caracteres y la lectura de invitado a 1 MiB de
caracteres. Son defensas de robustez, no una garantía contra consumo arbitrario de
memoria: JSON.parse y Object.entries todavía procesan el documento recibido.
La RPC ya limita el payload remoto a 1 MB; no se cambia el esquema ni datos reales.

La sincronización normaliza también lecturas y resolución de conflictos; una revisión
local negativa se trata como 0, conservando el control atómico de conflictos del servidor.
Los tests del contenido comprueban IDs únicos, referencias a lecciones, respuestas
válidas, audios existentes y metadatos de revisión. No certifican naturalidad del japonés.

## Cabeceras y dependencias

`public/_headers` restringe scripts al propio origen, conexiones al proyecto Supabase
actual, fuentes/audio a archivos locales y prohíbe incrustar la página en marcos.
No permite plugins ni scripts inline/eval. Los estilos inline siguen permitidos
porque el sistema visual usa propiedades de estilo y BrandStyles; no se presenta
como una CSP sin excepciones. Al cambiar el proyecto Supabase debe actualizarse
`connect-src`. No se permiten hosts comodín ni terceros por defecto.

Cloudflare aplica `_headers` a respuestas de archivos estáticos; una futura función
Worker que genere respuestas tendría que añadir sus propias cabeceras:
[documentación oficial](https://developers.cloudflare.com/workers/static-assets/headers/).
Vite preview no aplica este archivo: la comprobación local usó un servidor temporal
que sí lo convierte en cabeceras HTTP. Verificar también el dominio tras desplegar.

Actualizada `serialize-javascript` 7.1.2 → 7.1.4 (dependencia de compilación), por el
aviso GHSA-m5mm-p8h7-m29v. Añadidos tipos Node para los tests de archivos.
Auditar con `npm audit`; cero avisos conocidos no implica ausencia de vulnerabilidades.

## Controles continuos

`.github/workflows/quality.yml`: instalación reproducible, tests, formato, compilación
y auditoría (bloquea severidad alta/crítica), con token de solo lectura, sin secretos.
No configura reglas de protección de rama ni impide por sí solo que Cloudflare
publique antes de terminar CI. Los cambios puramente estéticos siguen sin requerir
escribir pruebas nuevas; CI ejecuta las existentes.

## Pendientes y límites

- Cabeceras CSP, marcos, referencias y permisos confirmadas por HTTP 200 en el dominio publicado el 2026-10-26. Mantener verificación de CI y futuros despliegues.
- Verificar recuperación por correo y sincronización real entre dispositivos;
  Marcos confirma acceso desde web y teléfono. El aislamiento RLS ya se probó con
  sujetos simulados: ver `validation.md` y `supabase/tests/progress_rls_readonly.sql`.
- Revisar controles de abuso de registro/correo en Supabase antes de abrir a gran
  escala; no se activan CAPTCHA ni servicios externos sin evaluar integración.
- XP se calcula en cliente y el usuario puede alterar su propio progreso. No sirve
  como clasificación competitiva ni certificación: eso exigiría validación del servidor.
- Mantener vigilado el bundle de Three.js (520,82 kB, 132,43 kB gzip), ya diferido.
  No se aumentó la carga 3D ni se midieron Core Web Vitals reales en esta entrega.
- Fase 3 técnica cerrada: hiragana y guía de trazos implementados. Continúa pendiente
  revisión lingüística/auditiva externa; los borradores se identifican como no revisados.
  Ver `13-fase-3-japones.md`.
