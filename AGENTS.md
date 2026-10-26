# AGENTS.md — Reglas permanentes para Codex

Proyecto: web de aprendizaje de **japonés y mandarín** (nombre provisional: Idiomas; marca actualmente en `src/App.tsx`).
Dueño: Marcos. Idioma de trabajo con él: **español, tuteo**. Código, commits y nombres técnicos: inglés o español, pero consistentes.

## Lee primero (documentos existentes)
1. `PRODUCT.md`: alcance; japonés primero, mandarín después.
2. `README.md`: estructura, comandos y configuración.
3. `DESIGN.md`: sistema visual implementado y conservado.
4. `docs/direction.md`: dirección de la primera versión y actualizaciones aprobadas.
5. `docs/10-hero-escena-3d.md` y `docs/referencias/`: cambio aprobado del hero.
6. `docs/curriculum.md`, `docs/08-contenido-audio-licencias.md` y `docs/validation.md`.

## Decisión de Marcos — 2026-10-22
Se conserva la dirección visual actual: Manrope + Noto Serif JP, paleta, aula,
navegación y demás pantallas. El cambio aprobado es el hero: callejón nocturno
de Kioto en otoño, composición inmersiva y tres modos de movimiento.
`docs/02-diseno-sistema.md` permanece como brief de referencia; sus propuestas
fuera del hero (cambiar fuentes, barra inferior, etc.) no autorizan un rediseño global.
El ejemplo de copy bilingüe de `docs/10` no debe anunciar mandarín disponible.
Las instrucciones directas más recientes de Marcos prevalecen sobre los briefs.
No se requiere otra confirmación para ejecutar este cambio ya autorizado.

## SKILLS OBLIGATORIAS (diseño y UI)
Marcos tiene instaladas las skills **`impeccable`** y **`taste skill`**.
- Úsalas SIEMPRE antes de crear o modificar cualquier cosa visual: sistema de diseño, home, componentes, páginas, animaciones, tipografía, layouts, estados vacíos/errores, footer.
- Úsalas también al auditar o pulir al final de cada fase de UI.
- Si no encuentras alguna de las dos en tu entorno, **detente y avísale a Marcos**; no sustituyas con diseño genérico.
- La decisión de alcance anterior y `DESIGN.md` fijan la identidad; `docs/10-hero-escena-3d.md` guía el hero. Las skills afinan la ejecución.

## Stack fijado (no cambiar sin preguntar)
- Frontend: React + Vite + TypeScript, React Router, instalable como PWA (`vite-plugin-pwa`).
- 3D/animación: `three` (carga diferida, solo en el home). 
- Backend: **Supabase** (Auth + Postgres + RLS). Sin servidor propio.
- Hosting: **Cloudflare Pages**, solo capa gratuita. **Prohibido** usar servicios de pago de Cloudflare (R2, Workers de pago, Images, Stream, etc.).
- Railway existe (plan hobby) pero **no se usa** salvo que Marcos lo pida.
- Contenido didáctico: **archivos JSON en `content/`** (versionados en git). Supabase guarda solo progreso/usuarios.
- Audio: archivos estáticos pregenerados en `public/audio/`. **El usuario NO graba su voz ni se evalúa pronunciación.** Solo escucha.

## Reglas de trabajo
1. **Mobile-first, 100% responsive.** Probar a 360 px de ancho antes de dar algo por terminado.
2. **Modos de animación** (completo / reducido / apagado) respetados en TODA animación nueva. Ver `docs/02-diseno-sistema.md`.
3. **Accesibilidad mínima:** foco visible, contraste AA, `prefers-reduced-motion`, textos alternativos, `lang="ja"` / `lang="zh"` en texto CJK.
4. **Git:** al terminar cada fase (y cada cambio completo relevante) → `git add`, commit con Conventional Commits y `git push`. Remoto actual: `origin` en GitHub (`MarcosGr14/Idiomas-plataforma-de-aprendizaje`). Verificarlo antes de publicar. Si no hay remoto configurado, pide la URL a Marcos.
5. **Pruebas:**
   - Cambios SOLO estéticos (CSS, tipografía, colores, espaciado, copy visual): **sin pruebas**, solo documentar en `docs/bitacora-estetica.md` y `CHANGELOG.md`.
   - Cualquier cambio de **lógica** (XP, rachas, SRS, niveles, examen, auth, desbloqueos): pruebas con Vitest obligatorias.
6. **Documentar** cada fase terminada: actualizar el estado en `PRODUCT.md`/`docs/validation.md` y añadir entrada a `CHANGELOG.md`.
7. **No inventes contenido didáctico.** Sigue `docs/curriculum.md`; los documentos `05` y `06` aún no existen. Cualquier borrador nuevo debe marcarse `"reviewed": false` para que Marcos lo revise.
8. **Licencias:** toda fuente, dataset, imagen o audio de terceros se registra en `docs/08-contenido-audio-licencias.md` y se muestra en la página de créditos.
9. **Secretos:** nunca subir `.env.local`. Solo la anon key de Supabase en el frontend.
10. **Referencias visuales** (`docs/referencias/`) son solo inspiración: no se usan en producción.
11. **Textos de interfaz** en español, tono claro y directo, verbos activos, sin relleno (la skill de diseño aplica a los textos también).

## Comandos existentes
`npm run dev` · `npm run build` · `npm run preview` · `npm run test` · `npm run lint` · `npm run typecheck`

`lint` comprueba formato con Prettier; `typecheck` comprueba tipos con TypeScript.
Supabase está preparado; verificar la conexión real y el despliegue Cloudflare antes de declararlos operativos. GitHub ya tiene remoto configurado.

## Prioridad permanente — decisión de Marcos, 2026-10-26

Estabilidad, seguridad y rendimiento preceden a nuevas funciones. Antes de ampliar
cada fase, corregir fallos comprobables y cubrir cambios de lógica con pruebas.
Validar JSON de almacenamiento local y remoto; no asumir que TypeScript valida datos
externos. Mantener mínimo privilegio y aislamiento RLS; ninguna autorización debe
depender solo de la interfaz. Revisar dependencias y cabeceras al incorporar servicios.
Evitar cargas y trabajo sin límites, conservar la carga diferida del 3D y los modos
de movimiento. No declarar el sitio invulnerable ni confundir pruebas locales con
validación del despliegue. Referencia: `docs/12-seguridad-estabilidad.md`.
