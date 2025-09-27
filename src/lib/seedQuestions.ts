import { supabase } from './supabase';

export const questionsData = [
  // Ronda 1 (Questions 1-6)
  {
    question_text: "¿En qué provincia se realizó la declaración de la Independencia Argentina?",
    options: ["Rosario", "Córdoba", "Buenos Aires", "Tucumán"],
    correct_answer: 3,
    category: "Historia",
    order_index: 1
  },
  {
    question_text: "¿Cuántos planetas tiene el sistema solar?",
    options: ["7", "8", "9", "10"],
    correct_answer: 1,
    category: "Ciencia",
    order_index: 2
  },
  {
    question_text: "¿En qué año empezó la 1° Guerra mundial?",
    options: ["1920", "1945", "1916", "1914"],
    correct_answer: 3,
    category: "Historia",
    order_index: 3
  },
  {
    question_text: "¿Quién fue el primer presidente Argentino?",
    options: ["Juan M de Rosas", "Justo José de Urquiza", "José Luis Borges", "Bernardino Rivadavia"],
    correct_answer: 3,
    category: "Historia",
    order_index: 4
  },
  {
    question_text: "¿Cuál es la fórmula del cloruro de Magnesio?",
    options: ["ClMg", "MgCl2", "Cmg3", "MgC"],
    correct_answer: 1,
    category: "Química",
    order_index: 5
  },
  {
    question_text: "Según el proverbio 29 ¿A quién odian los hombres sanguinarios?",
    options: ["Al Justo", "Al hombre intachable", "Al sabio", "Al envidioso"],
    correct_answer: 1,
    category: "Biblia",
    order_index: 6
  },

  // Ronda 2 (Questions 7-12)
  {
    question_text: "¿Cuál es la fecha de aniversario de la Iglesia Universal del Reino de Dios?",
    options: ["9 de junio", "8 de marzo", "9 de julio", "8 de junio"],
    correct_answer: 2,
    category: "Religión",
    order_index: 7
  },
  {
    question_text: "¿Cuáles son los estados del agua?",
    options: ["Gaseoso, líquido", "Líquido, sólido", "Sólido, líquido, gaseoso", "Líquido, gaseoso y plasma"],
    correct_answer: 2,
    category: "Ciencia",
    order_index: 8
  },
  {
    question_text: "¿Cuántos países contempla América del Sur?",
    options: ["12", "13", "7", "20"],
    correct_answer: 0,
    category: "Geografía",
    order_index: 9
  },
  {
    question_text: "¿Cuál es la unidad básica de la materia?",
    options: ["Átomo", "Molécula", "Célula", "Elemento"],
    correct_answer: 0,
    category: "Ciencia",
    order_index: 10
  },
  {
    question_text: "¿Si un auto viaja a una velocidad constante de 60 km/h cuanto tiempo le llevara recorrer 120 km?",
    options: ["1h30", "2 h", "1 h", "3 h"],
    correct_answer: 1,
    category: "Matemáticas",
    order_index: 11
  },
  {
    question_text: "¿En qué año gano Argentina su 1 copa del mundo?",
    options: ["1974", "1978", "1982", "1986"],
    correct_answer: 1,
    category: "Deportes",
    order_index: 12
  },

  // Ronda 3-5 (Questions 13-15)
  {
    question_text: "¿Cuántos libros tiene el Antiguo testamento?",
    options: ["27", "39", "47", "28"],
    correct_answer: 1,
    category: "Biblia",
    order_index: 13
  },
  {
    question_text: "En la física ¿A que hace referencia las siglas MRUV?",
    options: ["Movimiento Recto Universalmente Vivo", "Movimiento Rectilíneo Uniforme Vivo", "Movimiento rectilíneo uniforme vacío", "Movimiento rectilíneo uniformemente variado"],
    correct_answer: 3,
    category: "Física",
    order_index: 14
  },
  {
    question_text: "¿Cuál es el día de la prevención en contra el suicidio?",
    options: ["28 de septiembre", "10 de septiembre", "11 de septiembre", "3 de septiembre"],
    correct_answer: 1,
    category: "Salud",
    order_index: 15
  }
];

// Función para insertar las preguntas en la base de datos
export const seedQuestions = async (gameId: string) => {
  try {
    console.log('Iniciando migración de preguntas para el juego:', gameId);
    
    // Insertar todas las preguntas para este juego
    const questionsWithGameId = questionsData.map(q => ({
      ...q,
      game_id: gameId
    }));

    const { data, error } = await supabase
      .from('questions')
      .insert(questionsWithGameId)
      .select();

    if (error) {
      console.error('Error insertando preguntas:', error);
      throw error;
    }

    console.log('Preguntas insertadas exitosamente:', data?.length);
    return data;
  } catch (error) {
    console.error('Error en seedQuestions:', error);
    throw error;
  }
};

// Función para obtener preguntas de un juego específico usando consulta directa
export const getQuestionsForGame = async (gameId: string) => {
  try {
    console.log('Obteniendo preguntas para el juego:', gameId);
    
    // Usar consulta directa en lugar de RPC para evitar errores 406
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('game_id', gameId)
      .order('order_index', { ascending: true });
    
    if (error) {
      console.error('Error obteniendo preguntas:', error);
      throw error;
    }
    
    console.log('Preguntas obtenidas exitosamente:', data?.length);
    return data || [];
  } catch (error) {
    console.error('Error en getQuestionsForGame:', error);
    throw error;
  }
};

// Función para obtener una pregunta específica por orden usando consulta directa
export const getQuestionByOrder = async (gameId: string, orderIndex: number) => {
  try {
    console.log('Obteniendo pregunta', orderIndex, 'para el juego:', gameId);
    
    // Usar consulta directa en lugar de RPC
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('game_id', gameId)
      .eq('order_index', orderIndex)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error obteniendo pregunta:', error);
      throw error;
    }
    
    console.log('Pregunta obtenida:', data ? 'Sí' : 'No');
    return data;
  } catch (error) {
    console.error('Error en getQuestionByOrder:', error);
    throw error;
  }
};
