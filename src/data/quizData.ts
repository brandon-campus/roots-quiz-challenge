import { Question } from '@/types/quiz';

export const quizData: Question[] = [
  // Ronda 1 (Questions 1-5)
  {
    id: 1,
    question: "¿En qué provincia se realizó la declaración de la Independencia Argentina?",
    options: ["Rosario", "Córdoba", "Buenos Aires", "Tucumán"],
    correctAnswer: 3,
    category: "Historia"
  },
  {
    id: 2,
    question: "¿Cuántos planetas tiene el sistema solar?",
    options: ["7", "8", "9", "10"],
    correctAnswer: 1,
    category: "Ciencia"
  },
  {
    id: 3,
    question: "¿En qué año empezó la 1° Guerra mundial?",
    options: ["1920", "1945", "1916", "1914"],
    correctAnswer: 3,
    category: "Historia"
  },
  {
    id: 4,
    question: "¿Quién fue el primer presidente Argentino?",
    options: ["Juan M de Rosas", "Justo José de Urquiza", "José Luis Borges", "Bernardino Rivadavia"],
    correctAnswer: 3,
    category: "Historia"
  },
  {
    id: 5,
    question: "¿Cuál es la fórmula del cloruro de Magnesio?",
    options: ["ClMg", "MgCl2", "Cmg3", "MgC"],
    correctAnswer: 1,
    category: "Química"
  },

  // Ronda 2 (Questions 6-10)
  {
    id: 6,
    question: "Según el proverbio 29 ¿A quién odian los hombres sanguinarios?",
    options: ["Al Justo", "Al hombre intachable", "Al sabio", "Al envidioso"],
    correctAnswer: 1,
    category: "Biblia"
  },
  {
    id: 7,
    question: "¿Cuál es la fecha de aniversario de la Iglesia Universal del Reino de Dios?",
    options: ["9 de junio", "8 de marzo", "9 de julio", "8 de junio"],
    correctAnswer: 2,
    category: "Religión"
  },
  {
    id: 8,
    question: "¿Cuáles son los estados del agua?",
    options: ["Gaseoso, líquido", "Líquido, sólido", "Sólido, líquido, gaseoso", "Líquido, gaseoso y plasma"],
    correctAnswer: 2,
    category: "Ciencia"
  },
  {
    id: 9,
    question: "¿Cuántos países contempla América del Sur?",
    options: ["12", "13", "7", "20"],
    correctAnswer: 0,
    category: "Geografía"
  },
  {
    id: 10,
    question: "¿Cuál es la unidad básica de la materia?",
    options: ["Átomo", "Molécula", "Célula", "Elemento"],
    correctAnswer: 0,
    category: "Ciencia"
  },

  // Ronda 3 (Questions 11-15) - Ronda de tensión máxima
  {
    id: 11,
    question: "¿Si un auto viaja a una velocidad constante de 60 km/h cuanto tiempo le llevara recorrer 120 km?",
    options: ["1h30", "2 h", "1 h", "3 h"],
    correctAnswer: 1,
    category: "Matemáticas"
  },
  {
    id: 12,
    question: "¿En qué año gano Argentina su 1 copa del mundo?",
    options: ["1974", "1978", "1982", "1986"],
    correctAnswer: 1,
    category: "Deportes"
  },
  {
    id: 13,
    question: "¿Cuántos libros tiene el Antiguo testamento?",
    options: ["27", "39", "47", "28"],
    correctAnswer: 1,
    category: "Biblia"
  },
  {
    id: 14,
    question: "En la física ¿A que hace referencia las siglas MRUV?",
    options: ["Movimiento Recto Universalmente Vivo", "Movimiento Rectilíneo Uniforme Vivo", "Movimiento rectilíneo uniforme vacío", "Movimiento rectilíneo uniformemente variado"],
    correctAnswer: 3,
    category: "Física"
  },
  {
    id: 15,
    question: "¿Cuál es el día de la prevención en contra el suicidio?",
    options: ["28 de septiembre", "10 de septiembre", "11 de septiembre", "3 de septiembre"],
    correctAnswer: 1,
    category: "Salud"
  }
];