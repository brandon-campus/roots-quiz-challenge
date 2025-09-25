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
    const { data, error } = await supabase
      .from('game_sessions')
      .insert([{ game_id: gameId, player_id: playerId }])
      .select()
      .single();
    
    if (error) {
      console.error('Error uniéndose a la partida:', error);
      throw error;
    }
    
    return data;
  };