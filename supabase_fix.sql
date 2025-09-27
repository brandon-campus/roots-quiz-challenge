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
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'questions' AND table_schema = 'public'
ORDER BY ordinal_position;

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
