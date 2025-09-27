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
