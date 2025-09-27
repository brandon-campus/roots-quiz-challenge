import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getActiveGame, getLatestGame, getPlayerRanking, getConnectedPlayers, updateGameState, createGame } from '@/lib/database';
import { supabase } from '@/lib/supabase';

const AdminDashboard = () => {
  // Función para calcular el número de ronda según la nueva estructura
  const getRoundNumber = (questionIndex: number): number => {
    if (questionIndex < 6) return 1;        // Preguntas 1-6: Ronda 1
    if (questionIndex < 12) return 2;       // Preguntas 7-12: Ronda 2
    if (questionIndex === 12) return 3;     // Pregunta 13: Ronda 3
    if (questionIndex === 13) return 4;     // Pregunta 14: Ronda 4
    if (questionIndex === 14) return 5;     // Pregunta 15: Ronda 5 (Final)
    return 1; // Default
  };
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadGameData();
    setupRealtimeSubscription();
  }, []);

  const loadGameData = async () => {
    try {
      // Primero intentar obtener partida activa
      let currentGame = await getActiveGame();
      
      // Si no hay partida activa, obtener la última partida
      if (!currentGame) {
        currentGame = await getLatestGame();
      }
      
      setGame(currentGame);
      
      if (currentGame) {
        // Cargar ranking de jugadores con puntajes
        const ranking = await getPlayerRanking(currentGame.id);
        setPlayers(ranking);
      }
    } catch (error) {
      console.error('Error cargando datos del juego:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('admin-dashboard')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'games' },
        (payload) => {
          console.log('Cambio en estado del juego:', payload);
          setGame(payload.new);
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'player_scores' },
        (payload) => {
          console.log('Cambio en puntajes:', payload);
          loadGameData(); // Recargar datos
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'game_sessions' },
        (payload) => {
          console.log('Cambio en sesiones:', payload);
          loadGameData(); // Recargar datos
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleNextQuestion = async () => {
    if (!game) return;
    
    setIsLoading(true);
    try {
      const nextQuestion = game.current_question + 1;
      await updateGameState(game.id, {
        current_question: nextQuestion,
        phase: 'question',
        time_remaining: 20
      });
    } catch (error) {
      console.error('Error avanzando pregunta:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseGame = async () => {
    if (!game) return;
    
    setIsLoading(true);
    try {
      await updateGameState(game.id, {
        status: game.status === 'active' ? 'paused' : 'active'
      });
    } catch (error) {
      console.error('Error pausando juego:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndGame = async () => {
    if (!game) return;
    
    setIsLoading(true);
    try {
      await updateGameState(game.id, {
        status: 'finished',
        finished_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error terminando juego:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewGame = async () => {
    setIsLoading(true);
    try {
      const newGame = await createGame();
      setGame(newGame);
      setPlayers([]);
    } catch (error) {
      console.error('Error creando nueva partida:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Card className="p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Dashboard de Administración</h1>
          <p className="text-muted-foreground mb-4">No hay partidas disponibles</p>
          <Button
            onClick={handleCreateNewGame}
            disabled={isLoading}
            className="mega-button"
          >
            {isLoading ? 'CREANDO...' : 'CREAR NUEVA PARTIDA'}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold">Dashboard de Administración</h1>
              <p className="text-muted-foreground">
                Partida: {game.name} - Estado: <Badge variant={game.status === 'active' ? 'default' : 'secondary'}>{game.status}</Badge>
              </p>
          </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreateNewGame}
                disabled={isLoading}
                variant="outline"
              >
                NUEVA PARTIDA
              </Button>
              <Button
                onClick={handlePauseGame}
                disabled={isLoading}
                variant="outline"
              >
                {game.status === 'active' ? 'PAUSAR' : 'REANUDAR'}
              </Button>
              <Button
                onClick={handleNextQuestion}
                disabled={isLoading || game.status !== 'active'}
                className="mega-button"
              >
                SIGUIENTE PREGUNTA
              </Button>
              <Button
                onClick={handleEndGame}
                disabled={isLoading}
                variant="destructive"
              >
                TERMINAR JUEGO
              </Button>
            </div>
        </div>

          {/* Game Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Pregunta {game.current_question + 1} de 15</span>
              <span>Ronda {getRoundNumber(game.current_question)}</span>
            </div>
            <Progress value={(game.current_question / 15) * 100} className="h-2" />
                </div>
        </Card>

        {/* Players Ranking */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Ranking de Jugadores</h2>
          <div className="space-y-3">
            {players.map((player, index) => (
              <div key={player.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  {player.players.photo_url ? (
                    <img
                      src={player.players.photo_url}
                      alt={player.players.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                      {player.players.name.charAt(0)}
                    </div>
                  )}
                  <span className="font-medium">{player.players.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-mega-green">{player.total_score || 0}</div>
                  <div className="text-sm text-muted-foreground">
                    {player.correct_answers || 0}/{player.questions_answered || 0} correctas
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Game Statistics */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Estadísticas del Juego</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-mega-blue">{players.length}</div>
              <div className="text-sm text-muted-foreground">Jugadores Conectados</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-mega-yellow">{game.current_question + 1}</div>
              <div className="text-sm text-muted-foreground">Pregunta Actual</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-mega-green">
                {players.reduce((sum, player) => sum + player.total_score, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Puntos Totales</div>
            </div>
        </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;