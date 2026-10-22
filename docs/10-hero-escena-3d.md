# Hero 3D del home — "Callejón de Kioto de noche, en otoño"
Brief para Codex. Usar las skills `impeccable` y `taste skill`. Referencias en `docs/referencias/`.

## Diagnóstico de la versión actual
**Funciona y se conserva:** letreros con caracteres reales, farolillos, enlace "¿Qué dice este letrero?", botón "Pausar movimiento", carga diferida.
**Falla:** se lee como *maqueta isométrica low-poly de juguete*: luz plana, sin atmósfera, objeto pequeño flotando en un fondo vacío, sin profundidad, sin partículas. Lo que hace bonitas a las referencias **no es la geometría, es la luz y la atmósfera**: charcos de luz cálida sobre oscuro, niebla en capas, follaje saturado, un hito lejano en la bruma.

## Concepto
Un callejón empedrado de una ciudad asiática de noche, visto en perspectiva de un punto de fuga (ref-4): fachadas de madera con farolillos y ventanas encendidas, una **pagoda de silueta** al fondo entre niebla, **ramas de arce** rojas/naranjas/amarillas enmarcando una esquina (ref-3), hojas cayendo y luciérnagas/brasas flotando. Cielo índigo oscuro con resplandor cálido en el horizonte. Un único momento memorable: **luz + partículas**; todo lo demás, sobrio.

## Composición (estilo ref-2: texto a la izquierda, escena con profundidad)
```
Escritorio
┌───────────────────────────────────────────────┐
│ logo        Inicio Aprender Biblioteca [Entrar]│
│                                   ramas arce ↘ │
│  日本語 · 中文                  ░ pagoda (niebla)│
│  Aprende japonés y mandarín    ░  farolillos    │
│  con clases diarias            ░ calle ↗ luz    │
│  [Hacer examen de nivel]       adoquines mojados│
│ ¿Qué dice este letrero?              ⏸ Pausar  │
└───────────────────────────────────────────────┘
Móvil (vertical): escena a pantalla completa de fondo, pagoda en el tercio superior,
texto y CTA abajo sobre degradado oscuro; controles en esquinas inferiores.
```
- Un elemento (rama o farolillo) **cruza hacia la zona de texto** para dar profundidad, como en ref-2.
- El tercio izquierdo queda más oscuro/desenfocado: el texto debe cumplir contraste AA.
- Cámara baja y ligeramente por encima del suelo, FOV ~35-40°. Pagoda en el tercio derecho.

## Ingredientes (checklist)
- [ ] **Calle:** perspectiva con líneas de fuga; adoquines con textura (CC0, p. ej. Poly Haven) y aspecto mojado (reflejo falso: plano espejado con alpha bajo y desenfoque, sin reflexión en tiempo real).
- [ ] **Fachadas:** madera oscura, aleros, celosías, ventanas emisivas cálidas; variación de alturas. No flat-shading de juguete: usar materiales con rugosidad y emisivos.
- [ ] **Luz:** ambiente índigo-marrón muy bajo; máximo 3-4 `PointLight` reales; el resto con **emisivos + "charcos de luz"** (planos con degradado radial aditivo sobre el suelo).
- [ ] **Niebla:** `FogExp2` cálida-oscura + 2-3 planos grandes de niebla con ruido que derivan lento.
- [ ] **Pagoda:** silueta de 5 niveles en la bruma, un piso con luz cálida. Se mantiene el rojo/naranja de la paleta.
- [ ] **Cielo:** degradado en shader, índigo arriba, brillo cálido en el horizonte; nubes oscuras suaves.
- [ ] **Follaje (ref-3):** ramas de arce en una esquina superior; hojas como quads instanciados con textura de hoja generada en canvas, colores rojo→naranja→amarillo, ligero emisivo.
- [ ] **Letreros y farolillos:** texto real renderizado en canvas con las fuentes del proyecto (Shippori Mincho / Noto), nítido, ver tabla al final.
- [ ] **Haz de luz** fino azul-blanquecino en el cielo (guiño a ref-3), muy sutil y opcional.
- [ ] Un detalle vivo discreto: vapor de un puesto o humo de incienso (sprites).

## Movimiento
- Cámara: **dolly lento** hacia la pagoda (deriva continua, ±1-2 m) + **parallax** con puntero (escritorio) o giroscopio (móvil; pedir permiso en iOS; si se rechaza, arrastre o scroll).
- **Scroll:** al bajar por el hero la cámara avanza por la calle y la niebla sube hasta fundirse con el fondo claro de la página.
- Farolillos con balanceo suave; parpadeo mínimo de ventanas; hojas con vaivén.
- Todo se pausa con "Pausar movimiento", con modo `off` y cuando la pestaña no es visible.

## Partículas (en GPU, instanciadas; sin trabajo por frame en CPU)
| Tipo | Full | Reducido | Off |
|---|---|---|---|
| Hojas de arce cayendo (vertex shader con vaivén) | 400-700 | 100-150 | 0 |
| Luciérnagas/brasas aditivas con parpadeo | 100-200 | 30-50 | 0 |
| Motas de polvo en los charcos de luz | 150 | 0 | 0 |
| Pétalos/hojas de primer plano con desenfoque falso | 20-40 | 0 | 0 |

## Posproceso y calidad
- Tone mapping ACES, salida sRGB, vignette suave, grano muy leve.
- **Bloom selectivo** solo en emisivos (umbral alto). Sin profundidad de campo (caro en móvil).
- **Reducido:** sin posproceso; brillo falso con sprites aditivos; DPR 1; tope 30 fps.
- **Off:** imagen estática WebP del mismo plano (*poster*), generada capturando la escena; también sirve de placeholder mientras carga Three.js y como LCP.
- Presupuesto: DPR máx. 2 escritorio / 1.5 móvil · modelos glTF con Meshopt/Draco ≤ 2 MB · texturas WebP/KTX2 ≤ 1 MB · three con imports por módulo · todo en carga diferida.
- Medir y documentar fps en un celular de gama media; si cae de ~30 fps, bajar de modo automáticamente y avisar con el selector.

## Interacción (conservar y mejorar)
- "¿Qué dice este letrero?": al tocar/seleccionar un letrero, la cámara se acerca un poco y aparece una tarjeta con caracteres, lectura (kana/pinyin con tonos), significado en español y botón de audio (cuando exista el audio de Fase 3). Accesible por teclado y lector de pantalla.
- Control "Pausar movimiento" visible siempre, sincronizado con el estado global `motion`.

## Texto y CTA del hero
- Título en fuente de títulos (Shippori Mincho u otra elegida), subtítulo breve, CTA "Hacer examen de nivel" en rojo/naranja cálido (ref-2). Sin eyebrows en mayúsculas ni "01/02/03".
- Copy claro: qué se aprende, para quién y qué hacer ahora.

## Transición al resto del sitio (fondo claro)
El hero es el **único panel oscuro** (permitido en `docs/02`). En su borde inferior la niebla se funde a `--paper` (`#FBF8F3`) con degradado o borde de papel washi; el resto de la página sigue claro.

## Assets y licencias
- **Prohibido** usar las fotos de referencia o stock con derechos. Texturas/modelos propios o CC0 (Poly Haven, etc.); registrar todo en `docs/08` y `content/assets-licenses.json`.
- Alternativa permitida: capas ilustradas propias (planos con profundidad) combinadas con geometría simple, si da mejor resultado con menos peso.

## Criterios de aceptación
- [ ] A primera vista se parece más a ref-3/ref-4 que al diorama actual.
- [ ] 60 fps escritorio; ≥ 30 fps móvil gama media en modo completo, o degrada solo.
- [ ] Modos completo/reducido/apagado funcionando, con poster en `off`.
- [ ] Texto legible (AA) sobre la escena en 360 px y en escritorio.
- [ ] `prefers-reduced-motion` respetado; pausa y visibilidad de pestaña funcionan.
- [ ] Peso total de la escena dentro del presupuesto; carga diferida verificada.
- [ ] Entrada en `docs/bitacora-estetica.md` y `CHANGELOG.md`; commit + push.

## Letreros iniciales (para tarjeta "¿Qué dice este letrero?")
| Letrero | Lectura | Significado |
|---|---|---|
| 本屋 | hon'ya | librería |
| ラーメン | rāmen | ramen |
| 日本語 | nihongo | idioma japonés |
| 花 | hana | flor |
| 茶 | cha / chá | té |
| 学 | gaku / xué | estudio, aprender |
| 福 | fuku / fú | fortuna, buena suerte |
| 中文 | zhōngwén | idioma chino |
Contenido marcado `reviewed: false` hasta que Marcos lo confirme.
