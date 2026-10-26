# Idiomas · piloto de japonés

Primera implementación funcional del proyecto de Marcos. React + TypeScript + Vite, escena Three.js, progreso local e integración opcional con Supabase. La interfaz está en español. Nombre provisional.

## Arrancar

```sh
npm ci
npm run dev
```

Abre la URL que imprime Vite. `npm run build` crea `dist/`; `npm run preview` permite probar la compilación con PWA. `npm test` verifica reglas de progreso, rachas y repetición.

## Qué está disponible

- Bienvenida con calle japonesa 3D, letreros, iluminación, movimiento suave y control de reducción; respeta la preferencia del sistema. Three.js se carga solo al entrar a la portada.
- Aula móvil, diagnóstico de seis preguntas limitado al piloto y recomendación de entrada sin otorgar dominio por adelantado.
- 16 lecciones en dos unidades: piloto y mapa del hiragana (46 básicos, marcas sonoras, combinaciones y ritmo). 80 preguntas con explicaciones y 92 entradas; borradores pendientes de revisión lingüística.
- 92 audios estáticos sintetizados con Open JTalk/Mei, en MP3, con reproducción normal y lenta; pendientes de revisión lingüística. Sin micrófono ni servicios de voz en tiempo de uso. Créditos en la aplicación y `public/audio/LICENSE-Mei.txt`. Regeneración con `scripts/generate-audio.py` (Python + pyopenjtalk + scipy + ffmpeg).
- Escritura guiada de los 46 hiragana básicos, con orden KanjiVG, demostración y asistencia al trazado con ratón/dedo. Estudio visual alternativo, sin XP ni certificación de caligrafía. Datos estáticos: `node scripts/prepare-hiragana.mjs`.
- Biblioteca, búsqueda, rōmaji opcional y repasos espaciados. Intervalos iniciales simples: 1, 2, 4, 8, 16 y 30 días; un fallo vuelve a 1 día.
- Lecciones aprobadas con 60% o más: 30 XP una sola vez; repaso recordado: 5 XP una vez por fecha programada. Cada 100 XP aumenta el nivel motivacional, sin equivalencia a JLPT.
- Rachas por días locales de estudio, incluyendo volver a completar lecciones sin duplicar XP.
- Revisión semanal y balance mensual del contenido completado; 50 XP una vez por periodo y tipo. Repetir permite practicar. No hay certificación oficial.
- Exportación de ejercicios por impresión/Guardar como PDF y exportación del progreso JSON.
- PWA con recursos estáticos precargados. El botón de instalación usa el evento del navegador o explica el procedimiento manual.
- Supabase Auth y tabla de progreso con RLS preparados; se activa con variables de entorno y migración.

## Conectar Supabase

La guía paso a paso está en [docs/11-cuentas-supabase.md](docs/11-cuentas-supabase.md).
Incluye creación del proyecto Free, variables públicas, las **tres migraciones**,
URL de confirmación/recuperación, configuración de correo y pruebas de aislamiento.

Registro, acceso, reenvío, recuperación y cambio de contraseña están implementados.
El progreso conserva cambios pendientes, usa revisiones para detectar conflictos y
permite elegir una versión con respaldo. Una pestaña por cuenta edita el progreso;
las demás esperan para proteger la copia local. Invitados y cuentas están separados.

**Estado al 2026-10-24:** proyecto Supabase creado y registro confirmado por Marcos.
Auth responde con registro y confirmación de correo habilitados; la API rechaza
lecturas anónimas del progreso. Políticas y permisos inspeccionados en el panel; prueba RLS con sujetos simulados
aprobada. Pendientes: sesiones reales de dos usuarios, recuperación por correo y
sincronización entre dispositivos. Ver `docs/validation.md`.

## Despliegue Cloudflare

En un proyecto Pages conectado al repositorio: comando `npm run build`, directorio `dist`, Node 22 o superior. Añade las variables `VITE_*` de Supabase antes de construir; quedan incorporadas a la compilación. Las rutas internas usan hash y no requieren reescrituras del servidor. Comprueba registro, confirmación de correo, carga de fuentes/audio e instalación PWA en el dominio HTTPS final.

Despliegue publicado por Marcos y comprobado en navegador:
https://idiomas-plataforma-de-aprendizaje.marcos-gaitan.workers.dev/

La URL actual corresponde a Workers, aunque el plan original proponía Pages.
No se ha migrado infraestructura ni cambiado de plan; la facturación no está
verificada. Las instrucciones de Pages anteriores se conservan como alternativa.

## Contenido y siguientes fases

Las doce unidades del plan aparecen en el aula; **las dos primeras tienen implementación**. Los textos y audios siguen pendientes de revisión lingüística externa. Ver `docs/curriculum.md`. Pendientes de apertura pública: validación editorial, contenido restante, política legal final, eliminación de cuenta, recuperación por correo, sincronización con cuentas reales y validación en teléfonos físicos. La guía de trazos de los 46 hiragana básicos ya usa geometría KanjiVG; no certifica caligrafía.

La interfaz muestra las limitaciones reales. No hay alumnos ficticios, testimonios, estadísticas de demostración ni botones de acceso a contenido inexistente.

## Tipografías

Manrope y Noto Serif JP están alojadas con la aplicación. `node scripts/prepare-fonts.mjs` selecciona bloques CJK que contienen caracteres del código y contenido actuales. Ejecutarlo al ampliar el curso. Licencia Noto: `public/fonts/OFL-Noto-Serif-JP.txt`; Manrope: paquete `@fontsource-variable/manrope/LICENSE`.

## Diseño y validación

Dirección del brief: calle japonesa con neones en una web clara. Guías utilizadas: impeccable, emil-design-eng y design-taste-frontend. La zona de estudio prioriza lectura y feedback; sin animaciones de entrada repetidas. Ver `docs/direction.md`, `DESIGN.md` y `docs/validation.md`.

## Cierre de fase 3

Alcance, límites editoriales y regeneración: [docs/13-fase-3-japones.md](docs/13-fase-3-japones.md).
