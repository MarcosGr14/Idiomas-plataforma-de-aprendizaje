# Desarrollo de Idiomas

## Requisitos y arranque

Node.js 24 y npm. Desde la raíz:

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
