# Video promocional de Idiomas

Composición de 40 segundos en Remotion, con capturas de la plataforma, dispositivos
genéricos y el sistema de tinta compartido con la app. Las capturas usan una demo
aislada y no acceden a cuentas reales.

## Preparación

Node.js 24, ffmpeg y Chrome/Chromium o compatible. Si el navegador no está en una
ruta estándar, define `CHROME_PATH` con la ruta de su ejecutable.

Desde la raíz del repositorio:

```sh
npm ci
npm --prefix promo ci
```

## Generar el video

```sh
npm --prefix promo run all
```

El comando inicia Vite si hace falta, captura las pantallas, genera previsualizaciones de 480p
y renderiza las versiones horizontal/vertical y el póster. Para regenerar tras cambios:

```sh
PROMO_RECAPTURE=1 PROMO_RERENDER=1 npm --prefix promo run all
```

Otros comandos:

```sh
npm --prefix promo run preview
npm --prefix promo run render
node promo/scripts/render.mjs qhd
npm --prefix promo run studio
```

Revisa primero las previews. QHD produce 2560×1440; `render -- --4k` permite 3840×2160
cuando lo necesites. La versión vertical tiene su propia composición.

## Configuración

| Variable | Uso |
| --- | --- |
| `CHROME_PATH` | Ejecutable del navegador |
| `PROMO_SITE` | Servidor de captura; por defecto `http://localhost:5173` |
| `PROMO_URL` | URL que aparece en el cierre |
| `PROMO_RECAPTURE=1` | Actualizar capturas |
| `PROMO_RERENDER=1` | Rehacer renders existentes |
| `PROMO_RESUME=1` | Reanudar una captura interrumpida, sin cambios de contenido |
| `PROMO_GL=swangle` | Render por software si ANGLE no está disponible |

La identidad se importa desde `src/design` y los componentes de la aplicación;
no dupliques fuentes, colores ni pinceladas dentro de este proyecto.

## Entregables

Se guardan en `promo/out/` y quedan fuera de Git:

- `promo-16x9-1080p.mp4`
- `promo-9x16.mp4`
- `promo-16x9-1440p.mp4`, al ejecutar QHD
- `poster.png` y `poster-vertical.png`
- Previsualizaciones de 480p e intermedios de render

Las capturas de `promo/public/captures/` también son generadas. Conserva los
másteres que quieras distribuir; para rehacer una pieza tras actualizar la web,
regenera capturas y render.

## Derechos

Sin música por defecto. Créditos y condiciones de fuentes, KanjiVG, Remotion y
herramientas: [avisos de terceros](../docs/THIRD_PARTY_NOTICES.md).
Distribuye [ATTRIBUTION.txt](ATTRIBUTION.txt) junto a los videos.


### Comprobación de mantenimiento

Usa Node 24 y ejecuta `npm ci --prefix promo`. `npm run check:bundle --prefix promo`
comprueba la composición sin capturas ni renderizado de MP4. La auditoría se ejecuta
con `npm audit --prefix promo`; conserva alineadas las versiones de todos los
paquetes Remotion y el override de Zod mientras la dependencia no lo incorpore.
