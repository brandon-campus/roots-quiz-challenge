import { Question } from '@/types/quiz';

export const quizData: Question[] = [
  // Round 1 (Questions 1-5)
  {
    id: 1,
    question: "¿En qué año fue sancionada la primera Constitución Argentina?",
    options: ["1853", "1810", "1816", "1862"],
    correctAnswer: 0,
    category: "Historia"
  },
  {
    id: 2,
    question: "¿Cuál es el río más largo de Argentina?",
    options: ["Río Paraná", "Río de la Plata", "Río Uruguay", "Río Colorado"],
    correctAnswer: 0,
    category: "Geografía"
  },
  {
    id: 3,
    question: "¿Quién escribió 'Martín Fierro'?",
    options: ["Jorge Luis Borges", "José Hernández", "Domingo Sarmiento", "Leopoldo Lugones"],
    correctAnswer: 1,
    category: "Literatura"
  },
  {
    id: 4,
    question: "¿En qué provincia se encuentra el Cerro Aconcagua?",
    options: ["San Juan", "Mendoza", "La Rioja", "Catamarca"],
    correctAnswer: 1,
    category: "Geografía"
  },
  {
    id: 5,
    question: "¿Cuál es la capital de la provincia de Tucumán?",
    options: ["San Miguel de Tucumán", "Tafí Viejo", "Concepción", "Banda del Río Salí"],
    correctAnswer: 0,
    category: "Geografía"
  },

  // Round 2 (Questions 6-10)
  {
    id: 6,
    question: "¿En qué año se celebró el primer Mundial de Fútbol en Argentina?",
    options: ["1974", "1978", "1982", "1986"],
    correctAnswer: 1,
    category: "Deportes"
  },
  {
    id: 7,
    question: "¿Cuál es el nombre del himno nacional argentino?",
    options: ["Himno Nacional Argentino", "Canción Patria", "Marcha de la Patria", "Oíd mortales"],
    correctAnswer: 0,
    category: "Historia"
  },
  {
    id: 8,
    question: "¿Qué significa la palabra 'Argentina'?",
    options: ["Tierra del fuego", "Plateada", "Hermosa", "Grande"],
    correctAnswer: 1,
    category: "Historia"
  },
  {
    id: 9,
    question: "¿Cuál es la danza nacional de Argentina?",
    options: ["Tango", "Zamba", "Pericón", "Chacarera"],
    correctAnswer: 0,
    category: "Cultura"
  },
  {
    id: 10,
    question: "¿En qué año se declaró la Independencia de Argentina?",
    options: ["1810", "1816", "1820", "1825"],
    correctAnswer: 1,
    category: "Historia"
  },

  // Round 3 (Questions 11-15)
  {
    id: 11,
    question: "¿Cuál es el plato típico argentino más conocido mundialmente?",
    options: ["Empanadas", "Asado", "Milanesas", "Locro"],
    correctAnswer: 1,
    category: "Gastronomía"
  },
  {
    id: 12,
    question: "¿Quién fue el primer presidente de Argentina?",
    options: ["Juan Domingo Perón", "Bernardino Rivadavia", "Bartolomé Mitre", "Domingo Sarmiento"],
    correctAnswer: 1,
    category: "Historia"
  },
  {
    id: 13,
    question: "¿Cuál es la moneda oficial de Argentina?",
    options: ["Peso argentino", "Austral", "Peso convertible", "Real"],
    correctAnswer: 0,
    category: "Economía"
  },
  {
    id: 14,
    question: "¿En qué océano se encuentra Argentina?",
    options: ["Océano Pacífico", "Océano Atlántico", "Océano Índico", "Mar Mediterráneo"],
    correctAnswer: 1,
    category: "Geografía"
  },
  {
    id: 15,
    question: "¿Cuál es el ave nacional de Argentina?",
    options: ["Cóndor", "Hornero", "Carancho", "Benteveo"],
    correctAnswer: 1,
    category: "Naturaleza"
  },

  // Round 4 - Final Round (Questions 16-20)
  {
    id: 16,
    question: "¿Cuántas provincias tiene Argentina?",
    options: ["22", "23", "24", "25"],
    correctAnswer: 1,
    category: "Geografía"
  },
  {
    id: 17,
    question: "¿Qué científico argentino ganó el Premio Nobel de Medicina en 1984?",
    options: ["César Milstein", "Luis Federico Leloir", "Bernardo Houssay", "Carlos Saavedra Lamas"],
    correctAnswer: 0,
    category: "Ciencia"
  },
  {
    id: 18,
    question: "¿En qué año fue creada la Universidad de Córdoba?",
    options: ["1613", "1621", "1634", "1640"],
    correctAnswer: 0,
    category: "Historia"
  },
  {
    id: 19,
    question: "¿Cuál es el parque nacional más antiguo de Argentina?",
    options: ["Nahuel Huapi", "Iguazú", "Los Glaciares", "Tierra del Fuego"],
    correctAnswer: 0,
    category: "Naturaleza"
  },
  {
    id: 20,
    question: "¿Qué escritor argentino ganó el Premio Nobel de Literatura?",
    options: ["Jorge Luis Borges", "Julio Cortázar", "Adolfo Bioy Casares", "Ninguno de los anteriores"],
    correctAnswer: 3,
    category: "Literatura"
  }
];