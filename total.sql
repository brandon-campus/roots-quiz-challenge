-- Tabla de jugadores
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de partidas
CREATE TABLE games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL DEFAULT 'MEGA QUIZ Argentina',
  status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'paused', 'finished')),
  current_question INTEGER DEFAULT 0,
  current_round INTEGER DEFAULT 1,
  phase VARCHAR(20) DEFAULT 'question' CHECK (phase IN ('question', 'break', 'result')),
  time_remaining INTEGER DEFAULT 20,
  max_players INTEGER DEFAULT 12,
  current_players INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de sesiones de jugadores en partidas
CREATE TABLE game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'disconnected', 'finished')),
  UNIQUE(game_id, player_id)
);

-- Tabla de respuestas de jugadores
CREATE TABLE player_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL,
  answer_index INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_taken INTEGER,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de puntajes de jugadores
CREATE TABLE player_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  total_score INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  current_round INTEGER DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, player_id)
);

-- Tabla de eventos del juego (para logs)
CREATE TABLE game_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  data JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Habilitar RLS en todas las tablas
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;

-- Políticas para players (cualquiera puede crear y leer)
CREATE POLICY "Allow all operations on players" ON players
FOR ALL USING (true) WITH CHECK (true);

-- Políticas para games (cualquiera puede crear y leer)
CREATE POLICY "Allow all operations on games" ON games
FOR ALL USING (true) WITH CHECK (true);

-- Políticas para game_sessions (cualquiera puede crear y leer)
CREATE POLICY "Allow all operations on game_sessions" ON game_sessions
FOR ALL USING (true) WITH CHECK (true);

-- Políticas para player_answers (cualquiera puede crear y leer)
CREATE POLICY "Allow all operations on player_answers" ON player_answers
FOR ALL USING (true) WITH CHECK (true);

-- Políticas para player_scores (cualquiera puede crear y leer)
CREATE POLICY "Allow all operations on player_scores" ON player_scores
FOR ALL USING (true) WITH CHECK (true);

-- Políticas para game_events (cualquiera puede crear y leer)
CREATE POLICY "Allow all operations on game_events" ON game_events
FOR ALL USING (tr
-- Política para permitir subir fotos
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'player-photos');

-- Política para permitir leer fotos
CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT USING (bucket_id = 'player-photos');
-- Política para permitir subir fotos
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'player-photos');

-- Política para permitir leer fotos
CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT USING (bucket_id = 'player-photos');
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE player_answers;
ALTER PUBLICATION supabase_realtime ADD TABLE player_scores;
ALTER PUBLICATION supabase_realtime ADD TABLE game_events;

-- Crear tabla de preguntas
CREATE TABLE questions (
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

-- Crear índices para mejor rendimiento
CREATE INDEX idx_questions_game_id ON questions(game_id);
CREATE INDEX idx_questions_order ON questions(order_index);
CREATE INDEX idx_questions_game_order ON questions(game_id, order_index);

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

-- =====================================================
-- FIX PARA ERRORES 406 - Configuración simplificada
-- =====================================================

-- 1. Verificar que la tabla questions existe
SELECT COUNT(*) as table_exists FROM information_schema.tables 
WHERE table_name = 'questions' AND table_schema = 'public';

-- 2. Verificar políticas RLS actuales
SELECT * FROM pg_policies WHERE tablename = 'questions';

-- 3. Eliminar políticas existentes y recrear más permisivas
DROP POLICY IF EXISTS "Allow read access to questions" ON questions;
DROP POLICY IF EXISTS "Allow insert access to questions" ON questions;
DROP POLICY IF EXISTS "Allow update access to questions" ON questions;

-- 4. Crear políticas más permisivas
CREATE POLICY "Enable read access for all users" ON questions
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON questions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON questions
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 5. Verificar que RLS esté habilitado
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- 6. Verificar estructura de la tabla
\d questions;

-- 7. Verificar que el trigger funcione
SELECT * FROM pg_trigger WHERE tgname = 'create_questions_trigger';

-- 8. Probar inserción manual de preguntas (reemplaza UUID_DEL_JUEGO con un UUID real)
-- INSERT INTO questions (question_text, options, correct_answer, category, order_index, game_id) 
-- VALUES ('Pregunta de prueba', '["A", "B", "C", "D"]', 0, 'Test', 1, 'UUID_DEL_JUEGO');

-- 9. Verificar preguntas existentes
SELECT game_id, COUNT(*) as total_questions FROM questions GROUP BY game_id;

-- =====================================================
-- COMANDOS PARA DEBUGGING:
-- =====================================================
-- Ver todos los juegos:
-- SELECT id, name, status, created_at FROM games ORDER BY created_at DESC LIMIT 5;

-- Ver preguntas de un juego específico:
-- SELECT order_index, question_text, category FROM questions WHERE game_id = 'TU_GAME_ID' ORDER BY order_index;

-- Verificar permisos:
-- SELECT has_table_privilege('questions', 'SELECT') as can_select,
--        has_table_privilege('questions', 'INSERT') as can_insert;
-- =====================================================
-- =====================================================
-- FIX SIMPLE PARA ERRORES 406 - Sin comandos problemáticos
-- =====================================================

-- 1. Eliminar políticas existentes y recrear más permisivas
DROP POLICY IF EXISTS "Allow read access to questions" ON questions;
DROP POLICY IF EXISTS "Allow insert access to questions" ON questions;
DROP POLICY IF EXISTS "Allow update access to questions" ON questions;
DROP POLICY IF EXISTS "Enable read access for all users" ON questions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON questions;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON questions;

-- 2. Crear políticas muy permisivas para testing
CREATE POLICY "questions_select_policy" ON questions
  FOR SELECT USING (true);

CREATE POLICY "questions_insert_policy" ON questions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "questions_update_policy" ON questions
  FOR UPDATE USING (true);

-- 3. Asegurar que RLS esté habilitado
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- 4. Verificar que existan juegos
SELECT id, name, status, created_at FROM games ORDER BY created_at DESC LIMIT 3;

-- 5. Verificar preguntas existentes
SELECT game_id, COUNT(*) as total_questions FROM questions GROUP BY game_id;

-- 6. Si no hay preguntas, insertar manualmente para el último juego creado
-- (Ejecuta esto solo si la consulta anterior no muestra preguntas)

-- Primero obtén el ID del último juego:
-- SELECT id FROM games ORDER BY created_at DESC LIMIT 1;

-- Luego reemplaza 'GAME_ID_AQUI' con el ID real y ejecuta:
/*
INSERT INTO questions (question_text, options, correct_answer, category, order_index, game_id) VALUES
('¿En qué provincia se realizó la declaración de la Independencia Argentina?', 
 '["Rosario", "Córdoba", "Buenos Aires", "Tucumán"]', 3, 'Historia', 1, 'GAME_ID_AQUI'),
('¿Cuántos planetas tiene el sistema solar?', 
 '["7", "8", "9", "10"]', 1, 'Ciencia', 2, 'GAME_ID_AQUI'),
('¿En qué año empezó la 1° Guerra mundial?', 
 '["1920", "1945", "1916", "1914"]', 3, 'Historia', 3, 'GAME_ID_AQUI'),
('¿Quién fue el primer presidente Argentino?', 
 '["Juan M de Rosas", "Justo José de Urquiza", "José Luis Borges", "Bernardino Rivadavia"]', 3, 'Historia', 4, 'GAME_ID_AQUI'),
('¿Cuál es la fórmula del cloruro de Magnesio?', 
 '["ClMg", "MgCl2", "Cmg3", "MgC"]', 1, 'Química', 5, 'GAME_ID_AQUI'),
('Según el proverbio 29 ¿A quién odian los hombres sanguinarios?', 
 '["Al Justo", "Al hombre intachable", "Al sabio", "Al envidioso"]', 1, 'Biblia', 6, 'GAME_ID_AQUI'),
('¿Cuál es la fecha de aniversario de la Iglesia Universal del Reino de Dios?', 
 '["9 de junio", "8 de marzo", "9 de julio", "8 de junio"]', 2, 'Religión', 7, 'GAME_ID_AQUI'),
('¿Cuáles son los estados del agua?', 
 '["Gaseoso, líquido", "Líquido, sólido", "Sólido, líquido, gaseoso", "Líquido, gaseoso y plasma"]', 2, 'Ciencia', 8, 'GAME_ID_AQUI'),
('¿Cuántos países contempla América del Sur?', 
 '["12", "13", "7", "20"]', 0, 'Geografía', 9, 'GAME_ID_AQUI'),
('¿Cuál es la unidad básica de la materia?', 
 '["Átomo", "Molécula", "Célula", "Elemento"]', 0, 'Ciencia', 10, 'GAME_ID_AQUI'),
('¿Si un auto viaja a una velocidad constante de 60 km/h cuanto tiempo le llevara recorrer 120 km?', 
 '["1h30", "2 h", "1 h", "3 h"]', 1, 'Matemáticas', 11, 'GAME_ID_AQUI'),
('¿En qué año gano Argentina su 1 copa del mundo?', 
 '["1974", "1978", "1982", "1986"]', 1, 'Deportes', 12, 'GAME_ID_AQUI'),
('¿Cuántos libros tiene el Antiguo testamento?', 
 '["27", "39", "47", "28"]', 1, 'Biblia', 13, 'GAME_ID_AQUI'),
('En la física ¿A que hace referencia las siglas MRUV?', 
 '["Movimiento Recto Universalmente Vivo", "Movimiento Rectilíneo Uniforme Vivo", "Movimiento rectilíneo uniforme vacío", "Movimiento rectilíneo uniformemente variado"]', 3, 'Física', 14, 'GAME_ID_AQUI'),
('¿Cuál es el día de la prevención en contra el suicidio?', 
 '["28 de septiembre", "10 de septiembre", "11 de septiembre", "3 de septiembre"]', 1, 'Salud', 15, 'GAME_ID_AQUI');
*/
-- =====================================================
-- FIX COMPLETO PARA ERRORES 406 - Todas las tablas
-- =====================================================

-- PASO 1: Arreglar políticas de la tabla GAMES
DROP POLICY IF EXISTS "Enable read access for all users" ON games;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON games;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON games;

CREATE POLICY "games_select_policy" ON games
  FOR SELECT USING (true);

CREATE POLICY "games_insert_policy" ON games
  FOR INSERT WITH CHECK (true);

CREATE POLICY "games_update_policy" ON games
  FOR UPDATE USING (true);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- PASO 2: Arreglar políticas de la tabla QUESTIONS
DROP POLICY IF EXISTS "Allow read access to questions" ON questions;
DROP POLICY IF EXISTS "Allow insert access to questions" ON questions;
DROP POLICY IF EXISTS "Allow update access to questions" ON questions;
DROP POLICY IF EXISTS "questions_select_policy" ON questions;
DROP POLICY IF EXISTS "questions_insert_policy" ON questions;
DROP POLICY IF EXISTS "questions_update_policy" ON questions;

CREATE POLICY "questions_select_policy" ON questions
  FOR SELECT USING (true);

CREATE POLICY "questions_insert_policy" ON questions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "questions_update_policy" ON questions
  FOR UPDATE USING (true);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- PASO 3: Arreglar otras tablas
-- Tabla players
CREATE POLICY "players_select_policy" ON players
  FOR SELECT USING (true);
CREATE POLICY "players_insert_policy" ON players
  FOR INSERT WITH CHECK (true);
CREATE POLICY "players_update_policy" ON players
  FOR UPDATE USING (true);
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Tabla game_sessions
CREATE POLICY "game_sessions_select_policy" ON game_sessions
  FOR SELECT USING (true);
CREATE POLICY "game_sessions_insert_policy" ON game_sessions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "game_sessions_update_policy" ON game_sessions
  FOR UPDATE USING (true);
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Tabla player_scores
CREATE POLICY "player_scores_select_policy" ON player_scores
  FOR SELECT USING (true);
CREATE POLICY "player_scores_insert_policy" ON player_scores
  FOR INSERT WITH CHECK (true);
CREATE POLICY "player_scores_update_policy" ON player_scores
  FOR UPDATE USING (true);
ALTER TABLE player_scores ENABLE ROW LEVEL SECURITY;

-- Tabla player_answers
CREATE POLICY "player_answers_select_policy" ON player_answers
  FOR SELECT USING (true);
CREATE POLICY "player_answers_insert_policy" ON player_answers
  FOR INSERT WITH CHECK (true);
CREATE POLICY "player_answers_update_policy" ON player_answers
  FOR UPDATE USING (true);
ALTER TABLE player_answers ENABLE ROW LEVEL SECURITY;

-- PASO 4: Verificar que todo funcione
SELECT 'Configuración completada' as resultado;
SELECT id, name, status, current_question, phase, time_remaining 
FROM games 
WHERE status = 'active' 
LIMIT 1;