# Plan de japonés inicial

La meta editorial propuesta es un recorrido de doce unidades y aproximadamente sesenta lecciones, con 300–400 palabras y 40–60 kanji. Es una meta de producción, no una afirmación de contenido ya disponible ni de equivalencia JLPT N5.

## Unidad piloto disponible

1. Cinco sonidos, un comienzo: reconocer あいうえお.
2. Ya puedes leer: combinar vocales y distinguir duración en いいえ.
3. Una familia nueva: reconocer かきくけこ y leer かお / こえ.
4. Tu primera conversación: escoger saludos según situación y agradecer.
5. Di quién eres: comprender はじめまして, nombre + です y cierre cortés.

Cada lección contiene objetivo, explicaciones, vocabulario, audio, cinco ejercicios con feedback y repaso. Las expresiones largas se trabajan como bloques comunicativos; no se supone dominio de todos sus kana. Diagnóstico: 0–49% recomienda vocales; 50–79% combinaciones; 80–100% saludos. No salta contenido ni otorga XP o certificación.

## Unidades aún por producir

| Unidad | Objetivo y contenido | Salida observable |
| --- | --- | --- |
| El mapa del hiragana | Familias S/T/N/H/M/Y/R/W/N, marcas sonoras y combinaciones | Leer palabras breves sin rōmaji |
| Números y tiempo | Números básicos, edad, horas y fechas | Comprender y comunicar datos sencillos |
| Un nuevo alfabeto | Katakana, préstamos y vocales largas | Reconocer nombres y palabras prestadas |
| Lo que te rodea | これ/それ/あれ, objetos y preguntas | Identificar y preguntar por objetos |
| Personas y familia | Referencias personales, familia y contexto social | Presentar a alguien sin confundir registros |
| Un día en tu vida | Verbos corteses y partículas básicas | Describir acciones habituales |
| A la mesa | Comida, bebida, cantidades y pedidos | Hacer un pedido sencillo |
| Lo que te gusta | Adjetivos y preferencias | Describir y expresar gustos |
| Por la ciudad | あります/います, ubicación y desplazamiento | Comprender indicaciones básicas |
| Pequeñas conversaciones | Integración de situaciones anteriores | Comprender un diálogo contextualizado |
| Tu siguiente paso | Repaso acumulativo y evaluación | Identificar fortalezas y objetivos siguientes |

## Revisión editorial necesaria

Un revisor competente debe comprobar naturalidad, lecturas y acento, adecuación de registros, progresión y distractores antes de publicación. Las voces sintetizadas son material provisional. La escritura libre no sustituye una fuente validada de orden de trazos.

Referencia pedagógica consultada: recursos introductorios de Irodori, The Japan Foundation, https://www.irodori.jpf.go.jp/en/resources.html. No se han copiado sus lecciones ni redistribuido sus grabaciones. Contenido del piloto original; no hay afiliación.

Mandarín reutilizará el motor de lecciones, prácticas, progreso y biblioteca. Tendrá currículo, pronunciación, caracteres y reglas específicos, no una traducción literal del curso de japonés.

## Control estructural — 2026-10-26

`src/data/course.test.ts` valida referencias, preguntas, IDs y existencia de audios
antes de compilar/publicar. No sustituye revisión pedagógica: se conservan los
indicadores `reviewed: false` del piloto.
