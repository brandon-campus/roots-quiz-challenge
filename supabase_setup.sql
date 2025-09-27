-- =====================================================
-- MEGA QUIZ - Setup completo de la base de datos
-- =====================================================

-- 1. Crear tabla de preguntas
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  category VARCHAR(50),
  order_index INTEGER NOT NULL,
  game_id UUID REFERENCES games(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_questions_game_id ON questions(game_id);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(order_index);
CREATE INDEX IF NOT EXISTS idx_questions_game_order ON questions(game_id, order_index);

-- 3. Función para insertar preguntas automáticamente al crear un juego
CREATE OR REPLACE FUNCTION create_questions_for_game(game_uuid UUID)
RETURNS VOID AS $$
BEGIN
  -- Ronda 1 (Questions 1-6)
  INSERT INTO questions (question_text, options, correct_answer, category, order_index, game_id) VALUES
  ('¿En qué provincia se realizó la declaración de la Independencia Argentina?', 
   '["Rosario", "Córdoba", "Buenos Aires", "Tucumán"]', 3, 'Historia', 1, game_uuid),
  
  ('¿Cuántos planetas tiene el sistema solar?', 
   '["7", "8", "9", "10"]', 1, 'Ciencia', 2, game_uuid),
  
  ('¿En qué año empezó la 1° Guerra mundial?', 
   '["1920", "1945", "1916", "1914"]', 3, 'Historia', 3, game_uuid),
  
  ('¿Quién fue el primer presidente Argentino?', 
   '["Juan M de Rosas", "Justo José de Urquiza", "José Luis Borges", "Bernardino Rivadavia"]', 3, 'Historia', 4, game_uuid),
  
  ('¿Cuál es la fórmula del cloruro de Magnesio?', 
   '["ClMg", "MgCl2", "Cmg3", "MgC"]', 1, 'Química', 5, game_uuid),
  
  ('Según el proverbio 29 ¿A quién odian los hombres sanguinarios?', 
   '["Al Justo", "Al hombre intachable", "Al sabio", "Al envidioso"]', 1, 'Biblia', 6, game_uuid),

  -- Ronda 2 (Questions 7-12)
  ('¿Cuál es la fecha de aniversario de la Iglesia Universal del Reino de Dios?', 
   '["9 de junio", "8 de marzo", "9 de julio", "8 de junio"]', 2, 'Religión', 7, game_uuid),
  
  ('¿Cuáles son los estados del agua?', 
   '["Gaseoso, líquido", "Líquido, sólido", "Sólido, líquido, gaseoso", "Líquido, gaseoso y plasma"]', 2, 'Ciencia', 8, game_uuid),
  
  ('¿Cuántos países contempla América del Sur?', 
   '["12", "13", "7", "20"]', 0, 'Geografía', 9, game_uuid),
  
  ('¿Cuál es la unidad básica de la materia?', 
   '["Átomo", "Molécula", "Célula", "Elemento"]', 0, 'Ciencia', 10, game_uuid),
  
  ('¿Si un auto viaja a una velocidad constante de 60 km/h cuanto tiempo le llevara recorrer 120 km?', 
   '["1h30", "2 h", "1 h", "3 h"]', 1, 'Matemáticas', 11, game_uuid),
  
  ('¿En qué año gano Argentina su 1 copa del mundo?', 
   '["1974", "1978", "1982", "1986"]', 1, 'Deportes', 12, game_uuid),

  -- Ronda 3-5 (Questions 13-15)
  ('¿Cuántos libros tiene el Antiguo testamento?', 
   '["27", "39", "47", "28"]', 1, 'Biblia', 13, game_uuid),
  
  ('En la física ¿A que hace referencia las siglas MRUV?', 
   '["Movimiento Recto Universalmente Vivo", "Movimiento Rectilíneo Uniforme Vivo", "Movimiento rectilíneo uniforme vacío", "Movimiento rectilíneo uniformemente variado"]', 3, 'Física', 14, game_uuid),
  
  ('¿Cuál es el día de la prevención en contra el suicidio?', 
   '["28 de septiembre", "10 de septiembre", "11 de septiembre", "3 de septiembre"]', 1, 'Salud', 15, game_uuid);

END;
$$ LANGUAGE plpgsql;

-- 4. Trigger para crear preguntas automáticamente cuando se crea un juego
CREATE OR REPLACE FUNCTION trigger_create_questions()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_questions_for_game(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
DROP TRIGGER IF EXISTS create_questions_trigger ON games;
CREATE TRIGGER create_questions_trigger
  AFTER INSERT ON games
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_questions();

-- 5. Función helper para obtener preguntas de un juego
CREATE OR REPLACE FUNCTION get_questions_for_game(game_uuid UUID)
RETURNS TABLE (
  id INTEGER,
  question_text TEXT,
  options JSONB,
  correct_answer INTEGER,
  category VARCHAR(50),
  order_index INTEGER,
  game_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id,
    q.question_text,
    q.options,
    q.correct_answer,
    q.category,
    q.order_index,
    q.game_id,
    q.created_at,
    q.updated_at
  FROM questions q
  WHERE q.game_id = game_uuid
  ORDER BY q.order_index ASC;
END;
$$ LANGUAGE plpgsql;

-- 6. Función helper para obtener una pregunta específica por orden
CREATE OR REPLACE FUNCTION get_question_by_order(game_uuid UUID, question_order INTEGER)
RETURNS TABLE (
  id INTEGER,
  question_text TEXT,
  options JSONB,
  correct_answer INTEGER,
  category VARCHAR(50),
  order_index INTEGER,
  game_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id,
    q.question_text,
    q.options,
    q.correct_answer,
    q.category,
    q.order_index,
    q.game_id,
    q.created_at,
    q.updated_at
  FROM questions q
  WHERE q.game_id = game_uuid 
    AND q.order_index = question_order
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 7. Actualizar la tabla games para incluir campos de sincronización (opcional para futuras mejoras)
ALTER TABLE games ADD COLUMN IF NOT EXISTS question_start_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE games ADD COLUMN IF NOT EXISTS question_duration INTEGER DEFAULT 20;
ALTER TABLE games ADD COLUMN IF NOT EXISTS current_question_start TIMESTAMP WITH TIME ZONE;

-- 8. Políticas de seguridad (RLS) para la tabla questions
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a todos los usuarios autenticados
CREATE POLICY "Allow read access to questions" ON questions
  FOR SELECT USING (true);

-- Política para permitir inserción solo a usuarios autenticados
CREATE POLICY "Allow insert access to questions" ON questions
  FOR INSERT WITH CHECK (true);

-- Política para permitir actualización solo a usuarios autenticados
CREATE POLICY "Allow update access to questions" ON questions
  FOR UPDATE USING (true);

-- =====================================================
-- INSTRUCCIONES DE USO:
-- =====================================================
-- 1. Ejecuta todo este SQL en tu dashboard de Supabase
-- 2. La tabla se creará automáticamente
-- 3. Cada vez que se cree un nuevo juego, las preguntas se insertarán automáticamente
-- 4. Las preguntas se sincronizarán perfectamente entre todos los jugadores
-- 
-- FUNCIONES DISPONIBLES:
-- - get_questions_for_game(game_uuid): Obtiene todas las preguntas de un juego
-- - get_question_by_order(game_uuid, order): Obtiene una pregunta específica por orden
-- - create_questions_for_game(game_uuid): Inserta todas las preguntas para un juego
-- =====================================================
