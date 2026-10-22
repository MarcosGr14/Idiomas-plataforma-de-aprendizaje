# Sistema de diseño (brief para las skills `impeccable` y `taste skill`)

## Dirección
Asia contemporánea y cálida: **fondo claro tipo papel washi**, tinta negra, rojo bermellón, amarillo, naranja. Una calle asiática con neones como momento memorable del home; el resto del sitio, sobrio y legible. Evitar el look genérico de "plantilla SaaS" (tarjetas idénticas, sombras iguales, etiquetas en mayúsculas por todos lados).

## Paleta (tokens iniciales; las skills pueden afinar valores, no la familia cromática)
| Token | Hex | Uso |
|---|---|---|
| `--paper` | `#FBF8F3` | fondo principal (blanco cálido) |
| `--white` | `#FFFFFF` | superficies |
| `--ink` | `#14110F` | texto, negro principal |
| `--ink-soft` | `#3A322D` | texto secundario |
| `--red` | `#C8102E` | acento principal, CTA |
| `--red-deep` | `#8F1220` | hover, bordes, sellos |
| `--orange` | `#F26B21` | acento cálido, progreso |
| `--amber` | `#F2A900` | racha, XP, neón |
| `--cream-line` | `#E9E0D2` | divisores |
Reglas: amarillo/ámbar **no** como color de texto sobre blanco (contraste); usar como relleno o con texto oscuro encima. Todo texto debe cumplir contraste AA.

## Tipografía (descargar y **autoalojar** en `public/fonts/`, licencia OFL, subsetting)
Probar y quedarse con la combinación que mejor funcione (máx. 4 familias):
- **Títulos (con aire asiático, legibles):** Shippori Mincho; alternativa Zen Antique / Zen Old Mincho.
- **Subtítulos y texto CJK serif:** Noto Serif JP / Noto Serif SC.
- **Cuerpo / interfaz:** Inter (o similar) + Noto Sans JP / Noto Sans SC para CJK.
- Verificar que la fuente del cuerpo cubra el pinyin con tonos (ā á ǎ à ē é ě è ī í ǐ ì ō ó ǒ ò ū ú ǔ ù ǖ ǘ ǚ ǜ).
- `font-display: swap`; cargar subsets CJK solo donde se usan. Documentar la combinación final en `docs/bitacora-estetica.md`.

## Modos de animación (obligatorio en todo el sitio)
Estado global `motion`: `full` | `reduced` | `off`, guardado en localStorage y en el perfil.
- `full`: escena Three.js completa, transiciones.
- `reduced`: escena simplificada (pocas partículas, sin bloom, 30 fps máx.), transiciones cortas.
- `off`: sin Three.js ni animaciones; imagen/SVG estático del home.
- Autodetección inicial: `prefers-reduced-motion`, `navigator.deviceMemory`, `hardwareConcurrency`, `Save-Data`, ausencia de WebGL → proponer `reduced` u `off`.
- Selector accesible en el header o ajustes y también en el footer.
- Three.js se importa con `React.lazy`/dynamic import; pausar render cuando la pestaña no es visible.

## Home (momento memorable)
> El detalle de la escena 3D vive en `docs/10-hero-escena-3d.md`; si hay conflicto, manda ese documento.

Escena de calle asiática (callejón con letreros de neón con caracteres reales: 日本語, 中文, 学, 福…), farolillos, lluvia/niebla ligera, parallax suave con el scroll o el giroscopio/puntero. Luz cálida (rojo/naranja/ámbar) sobre fondo claro tipo amanecer/papel; si el neón no luce en claro, se permite un panel oscuro acotado **solo dentro del hero**, no en todo el sitio. Debajo: propuesta de valor en pocas líneas, los dos idiomas como entradas claras, CTA "Hacer examen de nivel".

## Navegación y layout
- Móvil: **barra inferior** con 5 destinos: Inicio, Aprender, Practicar, Biblioteca, Perfil.
- Escritorio: misma navegación adaptada (barra lateral o superior).
- Footer: copyright, derechos de autor, aviso legal, datos y GitHub de Marcos, enlaces a Privacidad/Términos/Créditos, selector de animaciones.

## Imágenes y audio en la interfaz
- Cada concepto/palabra de vocabulario lleva imagen de apoyo cuando aplica (ilustraciones propias o con licencia libre, registradas en `docs/08`).
- Botón de audio grande y claro; opción lento/normal; tecla/atajo en escritorio.

## Calidad mínima
Responsive desde 360 px, foco visible, `prefers-reduced-motion`, contraste AA, `lang` correcto en texto CJK, objetivos táctiles ≥ 44 px.
