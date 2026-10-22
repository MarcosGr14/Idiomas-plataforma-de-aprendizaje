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
- Cinco lecciones originales: vocales, palabras con vocales, familia K, saludos y presentación. 25 preguntas con explicaciones y 25 entradas de vocabulario.
- Práctica libre de escritura con ratón o dedo; no evalúa ni certifica orden de trazos.
- Biblioteca, búsqueda, rōmaji opcional y repasos espaciados. Intervalos iniciales simples: 1, 2, 4, 8, 16 y 30 días; un fallo vuelve a 1 día.
- Lecciones aprobadas con 60% o más: 30 XP una sola vez; repaso recordado: 5 XP una vez por fecha programada. Cada 100 XP aumenta el nivel motivacional, sin equivalencia a JLPT.
- Rachas por días locales de estudio, incluyendo volver a completar lecciones sin duplicar XP.
- Revisión semanal y balance mensual del contenido completado; 50 XP una vez por periodo y tipo. Repetir permite practicar. No hay certificación oficial.
- Exportación de ejercicios por impresión/Guardar como PDF y exportación del progreso JSON.
- PWA con recursos estáticos precargados. El botón de instalación usa el evento del navegador o explica el procedimiento manual.
- Supabase Auth y tabla de progreso con RLS preparados; se activa con variables de entorno y migración.

## Conectar Supabase

1. Copia `.env.example` a `.env.local`.
2. Define `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con la URL y clave pública del proyecto. **Nunca** uses `service_role` en el frontend.
3. Ejecuta `supabase/migrations/202610220001_progress.sql` una vez en SQL Editor.
4. Activa correo/contraseña y confirmación de correo. Configura Site URL y las URL de retorno de desarrollo/producción en Auth.
5. Reinicia Vite; crea dos cuentas de prueba y verifica que cada una solo acceda a su propio registro.

El modo invitado y cada cuenta tienen almacenamiento separado. No se importa silenciosamente el progreso del invitado. La sincronización no es un sistema colaborativo: requiere validación de conflictos y concurrencia antes de permitir trabajo simultáneo intensivo en varios dispositivos. No se ha probado contra un proyecto real en esta entrega porque no se suministró su configuración.

## Cloudflare Pages

En un proyecto Pages conectado al repositorio: comando `npm run build`, directorio `dist`, Node 22 o superior. Añade las variables `VITE_*` de Supabase antes de construir; quedan incorporadas a la compilación. Las rutas internas usan hash y no requieren reescrituras del servidor. Comprueba registro, confirmación de correo, carga de fuentes/audio e instalación PWA en el dominio HTTPS final.

No se ha publicado: falta el proyecto de Cloudflare y el repositorio remoto. No se presupone un plan ilimitado ni se contratan servicios.

## Contenido y siguientes fases

Las doce unidades del plan aparecen en el aula; **solo la primera está desarrollada**. Ver `docs/curriculum.md`. Antes de una apertura pública: revisión lingüística de lecciones/audio, contenido restante, trazos guiados validados, política legal final, recuperación/eliminación de cuenta, pruebas de RLS y sincronización con cuentas reales, y validación en teléfonos físicos.

La interfaz muestra las limitaciones reales. No hay alumnos ficticios, testimonios, estadísticas de demostración ni botones de acceso a contenido inexistente.

## Tipografías

Manrope y Noto Serif JP están alojadas con la aplicación. `node scripts/prepare-fonts.mjs` selecciona bloques CJK que contienen caracteres del código y contenido actuales. Ejecutarlo al ampliar el curso. Licencia Noto: `public/fonts/OFL-Noto-Serif-JP.txt`; Manrope: paquete `@fontsource-variable/manrope/LICENSE`.

## Diseño y validación

Dirección del brief: calle japonesa con neones en una web clara. Guías utilizadas: impeccable, emil-design-eng y design-taste-frontend. La zona de estudio prioriza lectura y feedback; sin animaciones de entrada repetidas. Ver `docs/direction.md`, `DESIGN.md` y `docs/validation.md`.
