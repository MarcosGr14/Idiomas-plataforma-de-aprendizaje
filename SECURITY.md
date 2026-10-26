# Seguridad

## Comunicar una vulnerabilidad

Utiliza [Report a vulnerability](https://github.com/MarcosGr14/Idiomas-plataforma-de-aprendizaje/security/advisories/new)
para enviar un informe privado al responsable del repositorio. Incluye los pasos
para reproducir el problema y su impacto, utilizando datos de prueba.

No publiques claves, sesiones, datos de estudiantes ni pruebas que expongan cuentas
ajenas en incidencias públicas. No pruebes ataques contra usuarios reales.

## Configuración y mantenimiento

- `.env.local`, credenciales y configuración de herramientas son locales; no se versionan.
- Las variables `VITE_*` se incorporan al frontend. Solo admiten valores públicos.
- Nunca uses `service_role`, claves secret de Supabase o la contraseña de Postgres en la app.
- Conserva Auth, RLS y los permisos mínimos de las migraciones. Ocultar archivos no sustituye controles de acceso.
- Publica únicamente `dist/` y conserva las cabeceras de seguridad.
- Revisa cambios de dependencias, tests y auditorías de CI antes de publicar.
- `.gitignore` evita nuevas inclusiones; no elimina archivos de commits anteriores. Si se filtra una credencial, revócala y rótala.

La comprobación automática de publicación detecta rutas internas y patrones comunes
de credenciales; no sustituye una revisión de seguridad completa.
