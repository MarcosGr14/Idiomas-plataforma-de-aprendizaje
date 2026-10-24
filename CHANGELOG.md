# Cambios

## 0.2.0 — 2026-10-22

- Hero Kioto nocturno: calle en perspectiva, pagoda, farolillos, arces, niebla, reflejos simulados y partículas GPU.
- Composición desktop/móvil conservando la identidad y el aula existentes.
- Modos completo/reducido/apagado, pausa, adaptación al rendimiento y pósteres WebP propios; compatibilidad con preferencias anteriores.
- Letreros seleccionables con lecturas y traducciones, acceso por teclado y CTA al diagnóstico.
- AGENTS.md conciliado con archivos reales y el alcance aprobado; cuatro pruebas nuevas de movimiento.

## 0.1.0 — 2026-10-22

- Fundación React/TypeScript/Vite y PWA instalable; Supabase Auth y migración RLS preparadas.
- Bienvenida Three.js, sistema tipográfico local, neones rojos y modo de movimiento reducido.
- Aula adaptable, unidad piloto de cinco lecciones, diagnóstico y práctica con feedback.
- Biblioteca, rōmaji opcional, escritura libre, repaso espaciado, XP y rachas.
- Evaluaciones por periodo y exportación PDF mediante impresión; exportación JSON del progreso.
- Comprobaciones unitarias de lógica y recorrido funcional en navegador.
- Plan curricular ampliable para japonés; mandarín permanece para una fase posterior.
- Cierre del piloto: 25 audios estáticos Open JTalk/Mei con atribución, contenido JSON marcado no revisado, React Router, comandos de formato y tipos, documentación del sistema visual y corrección de revisión independiente.

## Promo — captura determinista

- Modo opt-in `?capture=1` con reloj de escena controlado por fotograma, sin bucle RAF libre ni degradación dependiente del tiempo de render.
- Semilla demo reproducible en memoria: 7 días, 200 XP, 3 lecciones y vocabulario aprendido; Supabase y persistencia desactivados solo en captura.
- Pipeline local de Playwright en `promo/`; medios regenerables excluidos de Git.

## 2026-10-23 — Composición de la promo

- Siete escenas Remotion, 40 segundos a 30 fps; horizontal y vertical con layouts independientes.
- Captura con Playwright, fuentes locales, dispositivos genéricos y texto español.
- Scripts para previsualizar cada escena a 480p, generar másteres/pósteres y regenerar con un comando.
- Música opcional documentada; sin pistas de terceros incluidas.

## 2026-10-23 — Firma de tinta, sistema compartido

- Tokens de marca y movimiento compartidos desde `src/design`; papel #FBF8F3, tinta #14110F y rojo #C8102E aprobados por Marcos.
- Sello 文 y carga de fuentes compartidos entre la web y la promo; Yuji Boku limitado a un subconjunto de 2 KiB para la apertura.
- InkBrush SVG determinista con presión, contorno irregular, cola seca, gotas y chorreones acotados; InkCharacter conserva orden y dirección KanjiVG.
- Fuentes/datos con licencias locales y atribución en Créditos. Sin cambios en la política de modos ni en el aprendizaje.

## 2026-10-23 — Intro y continuidad de tinta

- Intro de 3,5 s sobre papel plano: 日本語 con recorridos KanjiVG, Yuji Boku y sello 文 compartido.
- Barridos SVG de InkBrush entre los siete capítulos, hojas del hero, titulares por palabras y subrayados rojos de punta seca.
- Mensaje unificado «Un mundo nuevo. Empieza en japonés.»; cierre con el mismo sello.
- Dos composiciones independientes y tokens de movimiento importados de la app; sin grano ni viñeta.
- Ajustes estéticos: sin nuevas pruebas de lógica ni cambios en la política de movimiento. Capturas actualizadas y renders completos de 480p terminados.

### Revisión del barrido

Borde refinado con 48 cerdas y puntas orgánicas para eliminar los grandes escalones del primer montaje. Revisión independiente: `ship` para sistema visual y composiciones examinadas; montajes completos verificados a 40 s/1.200 fotogramas y revisados mediante hojas de contacto. La exportación omite audio silencioso y fija la duración de cada clip para evitar pausas por relleno AAC al concatenar.

### Entrega de previsualizaciones

Completados ambos montajes de 480p, catorce clips por escena y pósteres horizontal/vertical. Código y documentación versionados; medios pesados ignorados. Sin música, sin URL inventada. Los másteres HD/4K permanecen como siguiente exportación tras revisar esta versión.

## Exportación QHD — 2026-10-24

Terminado `promo/out/promo-16x9-1440p.mp4`: 2560×1440, H.264, 30 fps, 40 segundos exactos, 1.200 fotogramas decodificados y sin audio (18.603.650 bytes). Revisada hoja de contacto a 1 fps. Exportación directa desde Remotion, sin ampliar el preview de 480p. Diseño conservado; capturas interiores mantienen su resolución original.

El comando `node promo/scripts/render.mjs qhd` guarda capítulos reanudables en `out/qhd-scenes/`. ANGLE acelerado por defecto, `PROMO_GL=swangle` como alternativa por software. Se observaron mensajes de cierre de navegador al finalizar algunos capítulos; los siete terminaron y el archivo unido pasó la decodificación completa. MP4 y cachés ignorados por Git.
