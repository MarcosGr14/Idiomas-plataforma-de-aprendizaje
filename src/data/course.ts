export type Word = {
  id: string;
  jp: string;
  reading: string;
  es: string;
  note: string;
  lesson: number;
  category: string;
};
export const words: Word[] = [
  {
    id: "a",
    jp: "あ",
    reading: "a",
    es: "Sonido a",
    note: "Una vocal abierta y breve. Mantén una duración uniforme.",
    lesson: 0,
    category: "Hiragana",
  },
  {
    id: "i",
    jp: "い",
    reading: "i",
    es: "Sonido i",
    note: "Una i breve. No la conviertas en un diptongo.",
    lesson: 0,
    category: "Hiragana",
  },
  {
    id: "u",
    jp: "う",
    reading: "u",
    es: "Sonido u",
    note: "La u japonesa suele pronunciarse con los labios menos redondeados que en español.",
    lesson: 0,
    category: "Hiragana",
  },
  {
    id: "e",
    jp: "え",
    reading: "e",
    es: "Sonido e",
    note: "Una e breve y estable.",
    lesson: 0,
    category: "Hiragana",
  },
  {
    id: "o",
    jp: "お",
    reading: "o",
    es: "Sonido o",
    note: "Una o breve. La duración puede cambiar el significado de una palabra.",
    lesson: 0,
    category: "Hiragana",
  },
  {
    id: "ai",
    jp: "あい",
    reading: "ai",
    es: "Amor",
    note: "Dos tiempos: a · i. Escucha cada vocal.",
    lesson: 1,
    category: "Primeras palabras",
  },
  {
    id: "ie",
    jp: "いえ",
    reading: "ie",
    es: "Casa",
    note: "Dos tiempos: i · e. Aquí la palabra está escrita en hiragana.",
    lesson: 1,
    category: "Primeras palabras",
  },
  {
    id: "ue",
    jp: "うえ",
    reading: "ue",
    es: "Arriba",
    note: "Dos tiempos: u · e.",
    lesson: 1,
    category: "Primeras palabras",
  },
  {
    id: "ao",
    jp: "あお",
    reading: "ao",
    es: "Azul",
    note: "Es el nombre del color. No es la forma adjetiva aoi.",
    lesson: 1,
    category: "Primeras palabras",
  },
  {
    id: "iie",
    jp: "いいえ",
    reading: "iie",
    es: "No",
    note: "Tres tiempos: i · i · e. No acortes la primera vocal larga.",
    lesson: 1,
    category: "Primeras palabras",
  },
  {
    id: "ka",
    jp: "か",
    reading: "ka",
    es: "Sonido ka",
    note: "K seguida de a. La familia continúa ki, ku, ke, ko.",
    lesson: 2,
    category: "Hiragana",
  },
  {
    id: "ki",
    jp: "き",
    reading: "ki",
    es: "Sonido ki",
    note: "La forma manuscrita puede separar el trazo inferior.",
    lesson: 2,
    category: "Hiragana",
  },
  {
    id: "ku",
    jp: "く",
    reading: "ku",
    es: "Sonido ku",
    note: "No confundas este carácter con una letra latina.",
    lesson: 2,
    category: "Hiragana",
  },
  {
    id: "ke",
    jp: "け",
    reading: "ke",
    es: "Sonido ke",
    note: "Escucha la vocal final e.",
    lesson: 2,
    category: "Hiragana",
  },
  {
    id: "ko",
    jp: "こ",
    reading: "ko",
    es: "Sonido ko",
    note: "Dos trazos. Escucha la vocal final o.",
    lesson: 2,
    category: "Hiragana",
  },
  {
    id: "konnichiwa",
    jp: "こんにちは",
    reading: "konnichiwa",
    es: "Hola / buenas tardes",
    note: "Saludo de día. El は final se pronuncia wa en esta expresión.",
    lesson: 3,
    category: "Saludos",
  },
  {
    id: "ohayou",
    jp: "おはようございます",
    reading: "ohayō gozaimasu",
    es: "Buenos días",
    note: "Saludo cortés de la mañana. La ō indica una vocal larga.",
    lesson: 3,
    category: "Saludos",
  },
  {
    id: "konbanwa",
    jp: "こんばんは",
    reading: "konbanwa",
    es: "Buenas noches (al saludar)",
    note: "Se usa al encontrarse por la noche, no para despedirse antes de dormir.",
    lesson: 3,
    category: "Saludos",
  },
  {
    id: "arigatou",
    jp: "ありがとうございます",
    reading: "arigatō gozaimasu",
    es: "Muchas gracias",
    note: "Una forma cortés de agradecer.",
    lesson: 3,
    category: "Saludos",
  },
  {
    id: "sumimasen",
    jp: "すみません",
    reading: "sumimasen",
    es: "Disculpe / perdón",
    note: "Puede servir para llamar la atención de alguien o disculparse, según el contexto.",
    lesson: 3,
    category: "Saludos",
  },
  {
    id: "hajimemashite",
    jp: "はじめまして",
    reading: "hajimemashite",
    es: "Encantado/a de conocerte",
    note: "Se dice al conocer a alguien por primera vez.",
    lesson: 4,
    category: "Presentaciones",
  },
  {
    id: "watashi",
    jp: "わたし",
    reading: "watashi",
    es: "Yo",
    note: "En contexto se suele omitir cuando ya está claro de quién se habla.",
    lesson: 4,
    category: "Presentaciones",
  },
  {
    id: "desu",
    jp: "です",
    reading: "desu",
    es: "Final cortés de identificación",
    note: "En «マルコスです» permite presentarte como Marcos. No equivale a todos los usos de ser/estar.",
    lesson: 4,
    category: "Presentaciones",
  },
  {
    id: "yoroshiku",
    jp: "よろしくおねがいします",
    reading: "yoroshiku onegaishimasu",
    es: "Un gusto / cuento contigo",
    note: "Expresión de cortesía al iniciar una relación. Su traducción depende del contexto.",
    lesson: 4,
    category: "Presentaciones",
  },
  {
    id: "marukosu",
    jp: "マルコスです",
    reading: "Marukosu desu",
    es: "Soy Marcos",
    note: "Un nombre extranjero suele escribirse en katakana. Puedes sustituirlo por tu nombre.",
    lesson: 4,
    category: "Presentaciones",
  },
];
export type Question = {
  prompt: string;
  options: string[];
  correct: number;
  explanation: string;
  jp?: string;
  listening?: string;
};
export type Lesson = {
  id: string;
  title: string;
  subtitle: string;
  symbol: string;
  minutes: number;
  objective: string;
  paragraphs: string[];
  questions: Question[];
};
export const lessons: Lesson[] = [
  {
    id: "vocales",
    title: "Cinco sonidos, un comienzo",
    subtitle: "Las vocales del japonés",
    symbol: "あ",
    minutes: 10,
    objective: "Reconocer y leer las cinco vocales en hiragana.",
    paragraphs: [
      "El japonés utiliza hiragana, katakana y kanji. Empezamos con hiragana: cada carácter representa una unidad de sonido. Hoy conocerás あ・い・う・え・お.",
      "Lee a, i, u, e, o con una duración breve y regular. La u japonesa tiene los labios menos redondeados que la española. El audio te ayuda a acercarte al sonido.",
      "La duración importa. Una vocal larga ocupa dos tiempos y puede distinguir palabras. Por ahora, escucha y reconoce cada vocal sin intentar leer a toda velocidad.",
    ],
    questions: [
      {
        prompt: "¿Qué sonido representa あ?",
        jp: "あ",
        options: ["a", "o", "e", "u"],
        correct: 0,
        explanation: "あ se lee a. お representa o.",
      },
      {
        prompt: "Elige el hiragana para «i».",
        options: ["う", "い", "お", "え"],
        correct: 1,
        explanation: "い se lee i. Observa sus dos trazos separados.",
      },
      {
        prompt: "¿Cuál se lee «u»?",
        options: ["あ", "え", "う", "い"],
        correct: 2,
        explanation:
          "う se lee u. No necesitas redondear tanto los labios como en español.",
      },
      {
        prompt: "¿Qué sonido representa え?",
        jp: "え",
        options: ["i", "a", "o", "e"],
        correct: 3,
        explanation: "え se lee e.",
      },
      {
        prompt: "Completa la secuencia: あ・い・う・え・…",
        options: ["お", "あ", "か", "こ"],
        correct: 0,
        explanation: "El orden de las vocales es a, i, u, e, o.",
      },
    ],
  },
  {
    id: "primeras-palabras",
    title: "Ya puedes leer",
    subtitle: "Palabras con las cinco vocales",
    symbol: "家",
    minutes: 10,
    objective: "Combinar vocales y distinguir su duración.",
    paragraphs: [
      "Con solo cinco caracteres ya puedes leer palabras: あい (amor), いえ (casa), うえ (arriba) y あお (azul). Lee cada carácter de izquierda a derecha.",
      "En いいえ, la primera i se prolonga: i · i · e. Son tres tiempos. La escritura te indica cuánto dura el sonido.",
      "Estas palabras también pueden escribirse con kanji. Aquí usamos hiragana para concentrarnos en la lectura. No necesitas memorizar sus kanji todavía.",
    ],
    questions: [
      {
        prompt: "¿Qué significa いえ?",
        jp: "いえ",
        options: ["Azul", "Casa", "Amor", "Arriba"],
        correct: 1,
        explanation: "いえ significa casa. Se lee i · e.",
      },
      {
        prompt: "¿Cómo se lee うえ?",
        jp: "うえ",
        options: ["ao", "ie", "ue", "ai"],
        correct: 2,
        explanation: "う aporta u y え aporta e: ue.",
      },
      {
        prompt: "¿Qué palabra significa «no»?",
        options: ["あい", "あお", "いえ", "いいえ"],
        correct: 3,
        explanation: "いいえ significa no; conserva sus tres tiempos.",
      },
      {
        prompt: "¿Cuántos tiempos tiene いいえ?",
        options: ["Tres", "Uno", "Dos", "Cuatro"],
        correct: 0,
        explanation:
          "i · i · e: tres tiempos, aunque la primera vocal suene prolongada.",
      },
      {
        prompt: "Elige la palabra «azul».",
        options: ["うえ", "あお", "あい", "いえ"],
        correct: 1,
        explanation: "あお (ao) es el nombre del color azul.",
      },
    ],
  },
  {
    id: "familia-k",
    title: "Una familia nueva",
    subtitle: "か・き・く・け・こ",
    symbol: "か",
    minutes: 12,
    objective: "Reconocer la familia K y leer combinaciones sencillas.",
    paragraphs: [
      "Añadimos una consonante a las cinco vocales: か ka, き ki, く ku, け ke, こ ko. El orden de las vocales se conserva.",
      "Al leer かお, combina ka · o: significa cara. En こえ, ko · e: significa voz. No agregues vocales entre caracteres.",
      "La forma de き puede variar entre una fuente impresa y la escritura a mano. Aprende a reconocer ambas; la práctica de trazo de esta versión es libre y no certifica el orden.",
    ],
    questions: [
      {
        prompt: "¿Qué sonido representa き?",
        jp: "き",
        options: ["ka", "ke", "ki", "ko"],
        correct: 2,
        explanation: "き se lee ki.",
      },
      {
        prompt: "Elige «ku».",
        options: ["け", "こ", "か", "く"],
        correct: 3,
        explanation: "く se lee ku.",
      },
      {
        prompt: "¿Cómo se lee かお?",
        jp: "かお",
        options: ["kao", "koa", "kai", "ako"],
        correct: 0,
        explanation: "か ka + お o = kao (cara).",
      },
      {
        prompt: "¿Qué carácter falta? か・き・く・…・こ",
        options: ["あ", "け", "お", "い"],
        correct: 1,
        explanation: "け (ke) ocupa la columna de la vocal e.",
      },
      {
        prompt: "¿Cómo se lee こえ?",
        jp: "こえ",
        options: ["keo", "koi", "koe", "kae"],
        correct: 2,
        explanation: "こ ko + え e = koe (voz).",
      },
    ],
  },
  {
    id: "saludos",
    title: "Tu primera conversación",
    subtitle: "Saludar y agradecer",
    symbol: "話",
    minutes: 12,
    objective: "Elegir un saludo apropiado para cada situación.",
    paragraphs: [
      "おはようございます es un saludo cortés de la mañana. こんにちは se usa de día y こんばんは al encontrarse por la noche.",
      "En こんにちは y こんばんは, el carácter final は se pronuncia wa. Aprende estas expresiones completas mientras amplías los kana.",
      "ありがとうございます sirve para agradecer con cortesía. すみません puede llamar la atención de alguien o expresar una disculpa. El contexto decide el matiz.",
    ],
    questions: [
      {
        prompt: "Llegas por la mañana. ¿Qué dices?",
        options: ["こんばんは", "いいえ", "すみません", "おはようございます"],
        correct: 3,
        explanation: "おはようございます es el saludo cortés de la mañana.",
      },
      {
        prompt: "¿Cómo agradeces con cortesía?",
        options: ["ありがとうございます", "こんにちは", "わたし", "こんばんは"],
        correct: 0,
        explanation:
          "ありがとうございます es una forma cortés de dar las gracias.",
      },
      {
        prompt: "En こんにちは, el は final se pronuncia…",
        options: ["ha", "wa", "ka", "a"],
        correct: 1,
        explanation: "En este saludo, は se lee wa: konnichiwa.",
      },
      {
        prompt: "Te encuentras con alguien por la noche.",
        options: ["おはようございます", "いいえ", "こんばんは", "あお"],
        correct: 2,
        explanation: "こんばんは es el saludo al encontrarse por la noche.",
      },
      {
        prompt: "Quieres llamar cortésmente la atención de alguien.",
        options: ["あい", "わたし", "いえ", "すみません"],
        correct: 3,
        explanation:
          "すみません puede equivaler a «disculpe» en esta situación.",
      },
    ],
  },
  {
    id: "presentacion",
    title: "Di quién eres",
    subtitle: "Una presentación sencilla",
    symbol: "私",
    minutes: 12,
    objective: "Comprender una presentación breve y cortés.",
    paragraphs: [
      "Una presentación sencilla empieza con はじめまして, una expresión para el primer encuentro. Después puedes decir tu nombre seguido de です.",
      "マルコスです significa «soy Marcos» en esta situación. Los nombres extranjeros suelen escribirse en katakana. Aquí puedes reconocer el ejemplo aunque aún no hayas estudiado todos esos caracteres.",
      "よろしくおねがいします cierra muchas presentaciones corteses. No tiene una traducción única: expresa una buena disposición hacia la nueva relación.",
    ],
    questions: [
      {
        prompt: "¿Qué dices al conocer a alguien por primera vez?",
        options: ["はじめまして", "こんばんは", "あお", "いいえ"],
        correct: 0,
        explanation:
          "はじめまして es una fórmula propia de un primer encuentro.",
      },
      {
        prompt: "¿Qué significa マルコスです en una presentación?",
        jp: "マルコスです",
        options: [
          "Gracias, Marcos",
          "Soy Marcos",
          "Adiós, Marcos",
          "¿Dónde está Marcos?",
        ],
        correct: 1,
        explanation:
          "El nombre seguido de です permite identificarse cortésmente.",
      },
      {
        prompt: "¿Qué escritura se suele usar para nombres extranjeros?",
        options: [
          "Solo hiragana",
          "Solo kanji",
          "Katakana",
          "Solo letras latinas",
        ],
        correct: 2,
        explanation:
          "Katakana es habitual para transcribir nombres extranjeros.",
      },
      {
        prompt: "¿Qué expresión puede cerrar una presentación?",
        options: ["うえ", "あお", "いいえ", "よろしくおねがいします"],
        correct: 3,
        explanation:
          "よろしくおねがいします expresa buena disposición hacia la relación.",
      },
      {
        prompt: "¿Qué significa わたし?",
        jp: "わたし",
        options: ["Yo", "Tú", "Casa", "Gracias"],
        correct: 0,
        explanation:
          "わたし significa yo. A menudo se omite si el contexto ya identifica a la persona.",
      },
    ],
  },
];
export const units = [
  {
    title: "Primeros encuentros",
    description: "Tus primeros sonidos, palabras y conversaciones.",
    symbol: "あ",
    available: true,
  },
  {
    title: "El mapa del hiragana",
    description: "Completa las familias de sonidos y empieza a leer.",
    symbol: "字",
  },
  {
    title: "Números y tiempo",
    description: "Edades, horas, días y fechas.",
    symbol: "時",
  },
  {
    title: "Un nuevo alfabeto",
    description: "Katakana y palabras que vienen de fuera.",
    symbol: "カ",
  },
  {
    title: "Lo que te rodea",
    description: "Objetos, lugares y preguntas sencillas.",
    symbol: "物",
  },
  {
    title: "Personas y familia",
    description: "Habla de ti y de quienes te acompañan.",
    symbol: "人",
  },
  {
    title: "Un día en tu vida",
    description: "Rutinas y verbos cotidianos.",
    symbol: "日",
  },
  {
    title: "A la mesa",
    description: "Comida, bebidas y pedidos.",
    symbol: "食",
  },
  {
    title: "Lo que te gusta",
    description: "Preferencias y adjetivos.",
    symbol: "好",
  },
  {
    title: "Por la ciudad",
    description: "Ubicaciones y desplazamientos.",
    symbol: "町",
  },
  {
    title: "Pequeñas conversaciones",
    description: "Integra lo aprendido en situaciones reales.",
    symbol: "話",
  },
  {
    title: "Tu siguiente paso",
    description: "Repaso global y evaluación del recorrido.",
    symbol: "道",
  },
];
export const placement = [
  lessons[0].questions[1],
  lessons[0].questions[3],
  lessons[1].questions[0],
  lessons[2].questions[0],
  lessons[3].questions[1],
  lessons[4].questions[1],
];
