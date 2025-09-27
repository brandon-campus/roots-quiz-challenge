-- =====================================================
-- COMANDOS INDIVIDUALES PARA EJECUTAR PASO A PASO
-- =====================================================

-- PASO 1: Crear tabla questions
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

-- PASO 2: Crear índices
CREATE INDEX idx_questions_game_id ON questions(game_id);
CREATE INDEX idx_questions_order ON questions(order_index);
CREATE INDEX idx_questions_game_order ON questions(game_id, order_index);

-- PASO 3: Habilitar RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- PASO 4: Crear políticas de seguridad
CREATE POLICY "Allow read access to questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Allow insert access to questions" ON questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update access to questions" ON questions FOR UPDATE USING (true);

-- PASO 5: Insertar preguntas manualmente (reemplaza 'GAME_UUID_AQUI' con un UUID real)
-- Primero necesitas crear un juego y obtener su UUID, luego ejecutar esto:

-- Ejemplo de inserción (reemplaza 'tu-game-uuid-aqui' con el UUID real del juego):
/*
INSERT INTO questions (question_text, options, correct_answer, category, order_index, game_id) VALUES
('¿En qué provincia se realizó la declaración de la Independencia Argentina?', 
 '["Rosario", "Córdoba", "Buenos Aires", "Tucumán"]', 3, 'Historia', 1, 'tu-game-uuid-aqui'),

('¿Cuántos planetas tiene el sistema solar?', 
 '["7", "8", "9", "10"]', 1, 'Ciencia', 2, 'tu-game-uuid-aqui'),

('¿En qué año empezó la 1° Guerra mundial?', 
 '["1920", "1945", "1916", "1914"]', 3, 'Historia', 3, 'tu-game-uuid-aqui'),

('¿Quién fue el primer presidente Argentino?', 
 '["Juan M de Rosas", "Justo José de Urquiza", "José Luis Borges", "Bernardino Rivadavia"]', 3, 'Historia', 4, 'tu-game-uuid-aqui'),

('¿Cuál es la fórmula del cloruro de Magnesio?', 
 '["ClMg", "MgCl2", "Cmg3", "MgC"]', 1, 'Química', 5, 'tu-game-uuid-aqui'),

('Según el proverbio 29 ¿A quién odian los hombres sanguinarios?', 
 '["Al Justo", "Al hombre intachable", "Al sabio", "Al envidioso"]', 1, 'Biblia', 6, 'tu-game-uuid-aqui'),

('¿Cuál es la fecha de aniversario de la Iglesia Universal del Reino de Dios?', 
 '["9 de junio", "8 de marzo", "9 de julio", "8 de junio"]', 2, 'Religión', 7, 'tu-game-uuid-aqui'),

('¿Cuáles son los estados del agua?', 
 '["Gaseoso, líquido", "Líquido, sólido", "Sólido, líquido, gaseoso", "Líquido, gaseoso y plasma"]', 2, 'Ciencia', 8, 'tu-game-uuid-aqui'),

('¿Cuántos países contempla América del Sur?', 
 '["12", "13", "7", "20"]', 0, 'Geografía', 9, 'tu-game-uuid-aqui'),

('¿Cuál es la unidad básica de la materia?', 
 '["Átomo", "Molécula", "Célula", "Elemento"]', 0, 'Ciencia', 10, 'tu-game-uuid-aqui'),

('¿Si un auto viaja a una velocidad constante de 60 km/h cuanto tiempo le llevara recorrer 120 km?', 
 '["1h30", "2 h", "1 h", "3 h"]', 1, 'Matemáticas', 11, 'tu-game-uuid-aqui'),

('¿En qué año gano Argentina su 1 copa del mundo?', 
 '["1974", "1978", "1982", "1986"]', 1, 'Deportes', 12, 'tu-game-uuid-aqui'),

('¿Cuántos libros tiene el Antiguo testamento?', 
 '["27", "39", "47", "28"]', 1, 'Biblia', 13, 'tu-game-uuid-aqui'),

('En la física ¿A que hace referencia las siglas MRUV?', 
 '["Movimiento Recto Universalmente Vivo", "Movimiento Rectilíneo Uniforme Vivo", "Movimiento rectilíneo uniforme vacío", "Movimiento rectilíneo uniformemente variado"]', 3, 'Física', 14, 'tu-game-uuid-aqui'),

('¿Cuál es el día de la prevención en contra el suicidio?', 
 '["28 de septiembre", "10 de septiembre", "11 de septiembre", "3 de septiembre"]', 1, 'Salud', 15, 'tu-game-uuid-aqui');
*/
