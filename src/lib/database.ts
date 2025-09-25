import { supabase } from './supabase';

// Crear un nuevo jugador
export const createPlayer = async (name: string, photoFile?: File) => {
  let photoUrl = null;
  
  // Subir foto si existe
  if (photoFile) {
    const fileExt = photoFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('player-photos')
      .upload(fileName, photoFile);
    
    if (uploadError) {
      console.error('Error subiendo foto:', uploadError);
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from('player-photos')
        .getPublicUrl(fileName);
      photoUrl = publicUrl;
    }
  }
  
  // Crear jugador en la base de datos
  const { data, error } = await supabase
    .from('players')
    .insert([{ name, photo_url: photoUrl }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creando jugador:', error);
    throw error;
  }
  
  return data;
};

// Obtener jugador por ID
export const getPlayer = async (id: string) => {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error obteniendo jugador:', error);
    throw error;
  }
  
  return data;
};
// Crear una nueva partida
export const createGame = async () => {
    const { data, error } = await supabase
      .from('games')
      .insert([{ 
        name: 'MEGA QUIZ Argentina',
        status: 'waiting',
        max_players: 12,
        current_players: 0
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creando partida:', error);
      throw error;
    }
    
    return data;
  };
  
  // Unir jugador a una partida
  export const joinGame = async (gameId: string, playerId: string) => {
    console.log('Intentando unir jugador', playerId, 'a partida', gameId);
    
    // Primero verificar si el jugador ya está en la partida
    const { data: existingSession } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('game_id', gameId)
      .eq('player_id', playerId)
      .single();
    
    if (existingSession) {
      console.log('Jugador ya existe en la partida, actualizando estado');
      // Si ya existe, actualizar el estado a activo
      const { data, error } = await supabase
        .from('game_sessions')
        .update({ status: 'active', left_at: null })
        .eq('id', existingSession.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error actualizando sesión:', error);
        throw error;
      }
      
      // Actualizar contador de jugadores en la partida
      await updatePlayerCount(gameId);
      return data;
    } else {
      console.log('Creando nueva sesión para jugador');
      // Si no existe, crear nueva sesión
      const { data, error } = await supabase
        .from('game_sessions')
        .insert([{ game_id: gameId, player_id: playerId, status: 'active' }])
        .select()
        .single();
      
      if (error) {
        console.error('Error uniéndose a la partida:', error);
        throw error;
      }
      
      // Actualizar contador de jugadores en la partida
      await updatePlayerCount(gameId);
      return data;
    }
  };

  // Actualizar contador de jugadores
  export const updatePlayerCount = async (gameId: string) => {
    const { count } = await supabase
      .from('game_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', gameId)
      .eq('status', 'active');
    
    await supabase
      .from('games')
      .update({ current_players: count || 0 })
      .eq('id', gameId);
  };

// Obtener partida activa
export const getActiveGame = async () => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'active')
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error obteniendo partida activa:', error);
    throw error;
  }
  
  return data;
};

// Obtener la última partida (cualquier estado)
export const getLatestGame = async () => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error obteniendo última partida:', error);
    throw error;
  }
  
  return data;
};

// Actualizar estado del juego
export const updateGameState = async (gameId: string, updates: any) => {
  const { data, error } = await supabase
    .from('games')
    .update(updates)
    .eq('id', gameId)
    .select()
    .single();
  
  if (error) {
    console.error('Error actualizando estado del juego:', error);
    throw error;
  }
  
  return data;
};

// Guardar respuesta del jugador
export const savePlayerAnswer = async (gameId: string, playerId: string, questionId: number, answerIndex: number, isCorrect: boolean, timeTaken: number) => {
  const { data, error } = await supabase
    .from('player_answers')
    .insert([{
      game_id: gameId,
      player_id: playerId,
      question_id: questionId,
      answer_index: answerIndex,
      is_correct: isCorrect,
      time_taken: timeTaken
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error guardando respuesta:', error);
    throw error;
  }
  
  return data;
};

// Actualizar puntaje del jugador
export const updatePlayerScore = async (gameId: string, playerId: string, scoreChange: number) => {
  const { data, error } = await supabase
    .from('player_scores')
    .upsert([{
      game_id: gameId,
      player_id: playerId,
      total_score: scoreChange,
      questions_answered: 1,
      correct_answers: scoreChange > 0 ? 1 : 0
    }], {
      onConflict: 'game_id,player_id'
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error actualizando puntaje:', error);
    throw error;
  }
  
  return data;
};

// Obtener ranking de jugadores
export const getPlayerRanking = async (gameId: string) => {
  const { data, error } = await supabase
    .from('player_scores')
    .select(`
      *,
      players (*)
    `)
    .eq('game_id', gameId)
    .order('total_score', { ascending: false });
  
  if (error) {
    console.error('Error obteniendo ranking:', error);
    throw error;
  }
  
  return data || [];
};

// Obtener jugadores conectados a una partida
export const getConnectedPlayers = async (gameId: string) => {
  const { data, error } = await supabase
    .from('game_sessions')
    .select(`
      *,
      players (*)
    `)
    .eq('game_id', gameId)
    .eq('status', 'active');
  
  if (error) {
    console.error('Error obteniendo jugadores conectados:', error);
    throw error;
  }
  
  return data || [];
};