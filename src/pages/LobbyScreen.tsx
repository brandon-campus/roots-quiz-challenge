import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createGame, joinGame } from '@/lib/database';
import { supabase } from '@/lib/supabase';

const LobbyScreen = () => {
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const playerId = localStorage.getItem('playerId');
  const playerName = localStorage.getItem('playerName');
  const playerPhoto = localStorage.getItem('playerPhoto');

  useEffect(() => {
    if (!playerId) {
      navigate('/');
      return;
    }

    initializeGame();
    setupRealtimeSubscription();
  }, []);

  const initializeGame = async () => {
    try {
      // Buscar si ya existe una partida activa
      const { data: existingGame } = await supabase
        .from('games')
        .select('*')
        .eq('status', 'waiting')
        .single();

      let gameId;
      if (existingGame) {
        gameId = existingGame.id;
        setGame(existingGame);
      } else {
        // Crear nueva partida
        const newGame = await createGame();
        gameId = newGame.id;
        setGame(newGame);
      }

      // Unir jugador a la partida
      await joinGame(gameId, playerId);
      
      // Cargar jugadores conectados
      loadPlayers(gameId);
    } catch (error) {
      console.error('Error inicializando partida:', error);
    }
  };

  const loadPlayers = async (gameId) => {
    const { data } = await supabase
      .from('game_sessions')
      .select(`
        *,
        players (*)
      `)
      .eq('game_id', gameId)
      .eq('status', 'active');

    setPlayers(data || []);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('game-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'game_sessions' },
        (payload) => {
          console.log('Cambio en game_sessions:', payload);
          if (game) {
            loadPlayers(game.id);
          }
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'games' },
        (payload) => {
          console.log('Cambio en games:', payload);
          if (payload.new.status === 'active') {
            navigate('/quiz');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const startGame = async () => {
    if (!game) return;
    
    setIsLoading(true);
    try {
      await supabase
        .from('games')
        .update({ 
          status: 'active',
          started_at: new Date().toISOString()
        })
        .eq('id', game.id);
    } catch (error) {
      console.error('Error iniciando partida:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canStartGame = game && players.length >= 2; // Mínimo 2 jugadores para empezar

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">MEGA QUIZ Argentina</h1>
            <p className="text-muted-foreground">
              Esperando jugadores... ({players.length}/12)
            </p>
          </div>

          {/* Lista de jugadores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {players.map((session) => (
              <div key={session.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                {session.players.photo_url ? (
                  <img
                    src={session.players.photo_url}
                    alt={session.players.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    {session.players.name.charAt(0)}
                  </div>
                )}
                <span className="font-medium">{session.players.name}</span>
                <Badge variant="secondary">Conectado</Badge>
              </div>
            ))}
          </div>

          {/* Botón para iniciar */}
          {canStartGame && (
            <div className="text-center">
              <Button
                onClick={startGame}
                disabled={isLoading}
                className="mega-button"
                size="lg"
              >
                {isLoading ? 'INICIANDO...' : 'INICIAR PARTIDA'}
              </Button>
            </div>
          )}

          {!canStartGame && (
            <div className="text-center text-muted-foreground">
              <p>Esperando más jugadores para iniciar...</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default LobbyScreen;
