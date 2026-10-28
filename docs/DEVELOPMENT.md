# Desarrollo de Idiomas

## Requisitos y arranque

Node.js 24 y npm (`nvm use` lee `.nvmrc`). Desde la raíz:

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Sin configuración de Supabase puedes explorar el modo local. Para habilitar las
cuentas completa `.env.local` con la URL y la clave pública anon/publishable de tu
proyecto. No incluyas claves de administrador ni contraseñas en variables `VITE_*`:
todo valor usado por el frontend es público en el navegador.

## Estructura

| Ruta | Contenido |
| --- | --- |
| `src/` | Interfaz, aprendizaje y sincronización |
| `content/` | Lecciones JSON, procedencia y geometría fuente |
| `public/` | Audio, fuentes, iconos y recursos que se sirven al navegador |
| `supabase/migrations/` | Esquema, políticas de acceso y guardado atómico |
| `supabase/tests/` | Verificaciones de aislamiento de datos |
| `scripts/` | Preparación de recursos y comprobación de publicación |
| `promo/` | Composición del video promocional |

## Cuentas y base de datos

Aplica en orden las tres migraciones de `supabase/migrations/` en tu proyecto.
La tabla de progreso mantiene RLS activo; el rol autenticado solo lee sus filas y
guarda mediante la función `save_learning_progress`, con comprobación de revisión.
Conserva los permisos mínimos de la tercera migración.

Configura Site URL con tu dominio HTTPS y permite estos callbacks exactos:

- `https://TU-DOMINIO/?auth=confirm`
- `https://TU-DOMINIO/?auth=recovery`

Verifica entrega de confirmación/recuperación, aislamiento entre dos cuentas y
sincronización entre dispositivos antes de abrir una nueva instalación al público.
`supabase/tests/progress_rls_readonly.sql` comprueba permisos y lectura sin modificar
filas; requiere una fila existente y acceso al editor SQL con permisos de administración.
No sustituye las comprobaciones con sesiones reales.

## Comandos

```sh
npm test
npm run lint
npm run typecheck
npm run build
npm run check:release
npm run preview
```

Los cambios de lógica requieren tests. Para cambios solo de estilo, revisa móvil y
escritorio y documenta el resultado sin añadir pruebas que dupliquen el CSS.

## Publicación

El sitio se publica como archivos estáticos desde `dist/`. El proyecto incluye
`wrangler.jsonc` para Cloudflare Workers y se puede alojar también en Pages.
Construye con `npm run build` y define las variables públicas de Supabase antes de
compilar. Las rutas usan hash y no requieren un servidor de aplicación.

`public/_headers` define CSP y otras cabeceras. Si cambias de proyecto Supabase,
actualiza el host permitido por `connect-src`; no añadas comodines por comodidad.
No publiques la carpeta de trabajo completa. `check:release` comprueba que los
archivos internos o sensibles no estén versionados ni presentes en `dist/`.
Ejecuta la comprobación antes de hacer commit/push. CI también la repite, pero
no revoca credenciales ni borra archivos publicados en el historial.
Las cabeceras no sustituyen Auth, RLS ni la validación de datos.

## Contenido, fuentes y pronunciación

El contenido vive en los JSON de `content/`. Conserva IDs existentes para no romper
el progreso y marca los borradores `reviewed: false` hasta su revisión lingüística.
Al modificar caracteres o contenido:

```sh
node scripts/prepare-hiragana.mjs
npm run fonts
```

Los SVG KanjiVG originales ya están versionados. La aplicación y el video comparten
el manifiesto de fuentes generado; no mantengas una segunda copia manual.

Para regenerar audios se necesitan Python, ffmpeg, pyopenjtalk y scipy:

```sh
python3 -m venv .venv
.venv/bin/pip install pyopenjtalk scipy
.venv/bin/python scripts/generate-audio.py
```

Se omiten MP3 existentes; `--force` los regenera. Revisa las grabaciones antes de
presentarlas como material validado. No se solicita micrófono al estudiante.
Licencias y atribuciones: [avisos de terceros](THIRD_PARTY_NOTICES.md).

## Evaluaciones y experiencia

Los períodos semanales siguen ISO (lunes a domingo, incluido el cambio de año);
los mensuales siguen el calendario local del dispositivo. Cada evaluación fija al
comenzar su período y una selección reproducible de las lecciones completadas:
hasta 10 preguntas semanales o 20 mensuales, sin duplicados y equilibradas entre
lecciones. Salir o recargar descarta el intento sin terminar; el resultado se guarda
al finalizar. El historial muestra los 12 períodos más recientes y permite repasar
los errores del último intento, sin cambiar la nota ni sumar XP adicionales.

`XP_RULES` en `src/lib/progress.ts` centraliza las reglas:

| Actividad | XP |
| --- | ---: |
| Primera aprobación de una lección (≥60%) | 30 |
| Palabra recordada en su repaso programado | 5 |
| Primera evaluación semanal aprobada (≥60%) en el período | 50 |
| Primera evaluación mensual aprobada (≥60%) en el período | 100 |
| Cada siete días consecutivos de estudio | 50 |

Cada 100 XP se avanza un nivel de actividad personal. Una práctica completada cuenta
para la racha aunque no otorgue XP. Repetir lecciones o evaluaciones no vuelve a
conceder su bonificación; conserva el mejor porcentaje. Los hitos son reconocimientos
visuales y no añaden XP. La recompensa de racha se concede al completar una actividad,
con un registro por inicio de racha y bloque de siete días; no al abrir la página ni
como pago retroactivo masivo por rachas antiguas.

El normalizador incorpora los nuevos campos JSON sin una migración SQL: transforma
las semanas antiguas usando la fecha del resultado y conserva sus XP ya concedidos,
aunque la nota anterior no alcanzara 60%. No se recalculan ni restan XP históricos.
Los registros que coinciden en una semana conservan la mejor nota y el estado pagado.

El progreso se guarda por cuenta mediante las políticas RLS y el control de revisión
existentes. Los resultados y la fecha se calculan en el cliente: son seguimiento
personal, no un sistema antifraude, un ranking ni una certificación oficial. No
utilices estos XP para asignar dinero, permisos o premios con valor económico.

La exportación usa la impresión del navegador (Guardar como PDF), con soluciones
opcionales; las preguntas de escucha se convierten en lectura para funcionar en papel.

### Aviso de dependencias de desarrollo (27 de octubre de 2026)

La auditoría completa registra un aviso bajo de `deepmerge@4.3.1`, dependencia
transitiva de Workbox/Rollup en la generación de la PWA
([GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4)).
No forma parte del código servido al usuario y no procesa datos de estudiantes en
este proyecto. No hay versión corregida publicada al verificarlo; `audit fix --force`
propone degradar el plugin PWA a una versión incompatible. Conserva la versión
actual y revisa el aviso cuando se publique una corrección. La auditoría de
producción (`npm audit --omit=dev`) no registra vulnerabilidades; esto no sustituye
una revisión de seguridad de la aplicación.


## Actualizaciones de la aplicación

El registro de la PWA muestra un aviso cuando hay una versión lista. Puedes
posponerla y aplicarla desde Ajustes → Actualizaciones. Primero termina la práctica:
una evaluación o ejercicio sin terminar no se reanuda después de recargar.
La aplicación impide aplicar la actualización si los cambios de progreso no están
guardados ni en el navegador ni en la cuenta. Las comprobaciones y la activación
recuperan el control tras 15 segundos si no responden, sin borrar el progreso.
La comprobación también se realiza al recuperar conexión y al volver a la pestaña
(con un intervalo mínimo de 30 minutos para las comprobaciones por foco).

Vite 8 utiliza Rolldown; `codeSplitting.groups` conserva separados el motor 3D,
React y Supabase. TypeScript 7 y el plugin React 6 se comprueban con Node 24.
No cambies los tipos de Node a una versión de otro runtime solo para eliminar un
aviso de versión disponible.

La carpeta `promo` mantiene las dependencias Remotion en una misma versión y usa
un override compatible de Zod ≥4.6.6 para corregir GHSA-mrhx-c7xc-m3w5. CI comprueba
su auditoría y `npm run check:bundle --prefix promo`, que compila las composiciones
sin abrir un navegador ni renderizar videos. Los MP4 existentes no se regeneran
por un cambio de mantenimiento.
