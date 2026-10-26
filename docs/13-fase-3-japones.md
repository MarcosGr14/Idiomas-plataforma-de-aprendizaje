# Fase 3 — japonés inicial y escritura

Cierre técnico: 2026-10-26. Se conserva la identidad y el progreso del piloto.

## Alcance entregado

- Dos unidades: cinco lecciones existentes y once nuevas en JSON separado.
- 46 hiragana básicos, marcas sonoras, combinaciones y ritmo: 80 preguntas de
  práctica, 92 entradas de biblioteca, 92 MP3 y diagnóstico inicial de seis preguntas.
- Ocho preguntas nuevas de escucha con alternativa visual accesible.
- Escritura guiada de los 46 básicos usando KanjiVG, dirección y secuencia originales.
  Validación aproximada por distancia y recorrido remuestreado. Sin XP ni afirmación
  de reconocimiento de escritura. Rechaza taps, trazos incompletos/invertidos y garabatos.
- Demostración solo bajo petición, hasta 30 fps; en reducido/apagado y captura se
  muestra estática. Se detiene si se oculta la pestaña. Datos de escritura diferidos.
- Biblioteca ampliada al completar lecciones; el diagnóstico permite explorar
  ejemplos sin otorgar XP ni programar repasos. Se mantienen referencias e IDs viejos.
- Prácticas con estado controlado: avanzar exige comprobar, eventos repetidos no
  duplican puntuaciones, callback de resultado una vez por intento, salida para vacío.

## Regeneración

```sh
npm ci
node scripts/prepare-hiragana.mjs
npm run fonts
python3 -m venv /tmp/idiomas-audio-env
/tmp/idiomas-audio-env/bin/pip install pyopenjtalk scipy
/tmp/idiomas-audio-env/bin/python scripts/generate-audio.py
npm test
npm run build
```

Se necesita ffmpeg. Audio omite archivos existentes; `--force` regenera todos.
La primera ejecución descarga el diccionario Open JTalk al entorno local; no se
redistribuye. Los SVG fuente y sus licencias ya están versionados: no se consulta
GitHub en la web ni al regenerar sus muestras. Tras cambiar JSON, regenerar fuentes
para conservar cobertura CJK. Los MP3 pequeños son recursos del curso y se versionan.

## Límites editoriales y operativos

Contenido original marcado `reviewed: false`; no se cambia ese indicador tras tests.
Revisión interna de coherencia, familias y respuestas realizada; revisión lingüística
externa y escucha experta pendientes. Las lecciones y Créditos muestran ese estado.
El diagnóstico se limita a la primera unidad, no es prueba de nivel avanzado.
Las diez unidades posteriores del currículo siguen en preparación.

No se modifican RLS, sesiones ni datos reales. Los XP son motivacionales y calculados
en cliente; no sirven para certificación ni clasificación competitiva. Recuperación
por correo y sincronización real entre dispositivos conservan sus pendientes previos.
