# Producto: plataforma de aprendizaje de idiomas

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

- Confirmado por Marcos: Supabase y Cloudflare. Existe una suscripción Railway Hobby disponible si resulta necesaria.
- Propuesta pendiente de ratificar: React + Vite para el frontend y Cloudflare Pages para alojamiento; Supabase Auth y Postgres para cuentas y progreso.
- Objetivo: evitar nuevos costos recurrentes. Los límites, precios y condiciones de los proveedores deben verificarse antes de implementar o desplegar; no se promete gratuidad ilimitada.
- Se desea instalación con icono en escritorio y móvil. Se propone una PWA; no está confirmada la necesidad de una extensión real del navegador.

## Users

Personas que desean aprender mandarín o japonés, desde principiantes absolutos hasta estudiantes con conocimientos previos. Deben poder estudiar desde celulares y computadoras, incluso equipos con recursos limitados, y adaptar la duración de sus clases al tiempo disponible.

Decisiones abiertas: edad del público, idioma de las explicaciones y alcance curricular inicial para estudiantes experimentados.

## Product Purpose

Ofrecer aprendizaje progresivo y estructurado de mandarín y japonés, con cuentas y progreso persistente. Priorizar comprensión de la pronunciación mediante escucha, escritura virtual, vocabulario y lectura. Marcos encarga estructurar las clases y su contenido, con una curva de aprendizaje cuidada.

## Operating Context

- Un examen inicial identifica conocimientos y propone el nivel o clase de entrada.
- El estudiante recibe clases diarias ajustadas al tiempo que puede dedicar.
- Practica contenidos vistos, consulta vocabulario y oraciones aprendidas y explora bibliotecas adecuadas a su nivel.
- Realiza exámenes semanales y mensuales para revisar conocimientos y valorar avances.
- Escucha audios de pronunciación. No se solicita micrófono ni se graba, reconoce o evalúa la voz del estudiante en el alcance actual.

## Capabilities and Constraints

### Requisitos confirmados

- Registro de cuentas y guardado de progreso.
- Mandarín y japonés como primeros idiomas del producto.
- Orden de lanzamiento confirmado: primero japonés; después mandarín, reutilizando la estructura desarrollada para japonés y adaptando el currículo y los contenidos a las particularidades del mandarín.
- Evaluación inicial, asignación de nivel y clases adaptadas al tiempo disponible.
- Rachas diarias por clases completadas y recompensas semanales.
- Imágenes explicativas, audio de pronunciación, talleres y prácticas.
- Recopilación del vocabulario y las oraciones aprendidas.
- Exámenes semanales y mensuales.
- Experiencia (XP) por actividades, ponderada por dificultad o importancia.
- Bibliotecas temáticas, algunas disponibles según el diagnóstico y otras desbloqueadas por progreso, clases o nivel de XP.
- Escritura virtual y actividades de lectura.
- Exportación de exámenes y prácticas a PDF.
- Diseño plenamente adaptable a celulares e instalación con acceso desde un icono.
- Control para reducir o desactivar animaciones en equipos limitados.
- Footer con navegación sencilla, información del autor, enlace GitHub, copyright e información reglamentaria.

### Propuestas todavía no confirmadas

- Repetición espaciada (SRS), repaso de errores y congelación de racha.
- Metas de 5, 10 o 20 minutos.
- Controles de pinyin y rōmaji.
- Lecciones descargables y funcionamiento offline; definir sincronización y alcance.
- Audio pregenerado a velocidad normal y lenta. Proveedor, licencias, revisión lingüística y almacenamiento pendientes.
- Trazado guiado con orden de trazos; bibliotecas y cobertura por idioma pendientes.
- React + Vite, PWA, servicios concretos de Cloudflare y estructura técnica detallada.

### Decisiones pendientes

- Nombre público del producto, repositorio remoto, URL GitHub y datos públicos del autor.
- Alcance curricular y funcional de la primera versión de japonés.
- Sistemas de referencia curricular, método de diagnóstico y criterios de dominio.
- Reglas exactas de XP, rachas, recompensas y desbloqueos.
- Estrategia de contenido, revisión lingüística y licencias de imágenes, fuentes, audio y datos.
- Política de privacidad, eliminación de cuentas y datos, y demás requisitos legales según público y operación.

## Brand Commitments

- Base clara o blanca, con negros, rojos, amarillos y naranjas en la paleta.
- Home visual y animado con Three.js: calle inspirada en Asia, neones y caracteres asiáticos.
- Tipografía elegante y legible, con carácter asiático en algunos títulos; explorar combinaciones de tres o cuatro familias según función y alojar las fuentes necesarias respetando sus licencias.
- Estas son restricciones expresadas por Marcos; la dirección visual detallada queda para el trabajo de diseño.

## Evidence on Hand

La fuente del brief es la conversación con Claude pegada por Marcos en esta tarea el 22 de octubre de 2026. Sus requisitos y la elección explícita de Supabase + Cloudflare están confirmados; las recomendaciones de Claude se distinguen como propuestas.

El proyecto no contiene todavía implementación, currículo, audios, imágenes, marca o textos legales. No presentar contenido generado ni afirmaciones de aprendizaje como validados sin revisión.

## Product Principles

1. El aprendizaje y la progresión deben guiar el producto, con objetivos claros y práctica de lo aprendido.
2. El tiempo disponible y los conocimientos del estudiante deben orientar su recorrido.
3. La escucha, la lectura, el vocabulario y la escritura deben recibir atención explícita.
4. La experiencia móvil y el acceso desde equipos modestos son requisitos centrales.
5. Mantener control de costos y trazabilidad del contenido y de sus licencias.

## Accessibility & Inclusion

- Permitir reducir o desactivar movimiento sin impedir el aprendizaje.
- Conservar legibilidad de texto latino y CJK y verificar contraste de la paleta.
- No requerir voz ni acceso al micrófono.

## Development Workflow

- Marcos solicita commit y push a GitHub por cada fase o cambio completado. Falta identificar el remoto antes de publicar.
- Los cambios exclusivamente estéticos no requieren suites de pruebas extensas: documentar el cambio y revisar visualmente el resultado.
- Las comprobaciones de comportamiento se ajustarán a los cambios de lógica, especialmente cuentas, progreso, evaluaciones y recompensas.
- Esta etapa define y audita el proyecto; no autoriza a dar por aceptadas todas las propuestas de la conversación ni inicia por sí sola la implementación.

## Estado de implementación · 2026-10-22

Marcos autorizó comenzar y continuar el desarrollo. Se implementó el piloto de japonés con React, TypeScript, Vite, React Router y PWA; cinco lecciones, audio estático sintetizado, diagnóstico, prácticas, repaso, progreso local e integración Supabase pendiente de conexión real. El resto del curso está planificado, no publicado. Nombre provisional: Idiomas. Explicaciones en español.

El nuevo brief de `docs/10-hero-escena-3d.md`, incorporado durante el cierre, exige reemplazar el diorama actual por un callejón atmosférico. Esa sustitución y los requisitos ampliados de `AGENTS.md` quedan pendientes; no se consideran completados por este piloto.
