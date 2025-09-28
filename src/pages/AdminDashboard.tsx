import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { getActiveGame, getLatestGame, getPlayerRanking, getConnectedPlayers, updateGameState, createGame } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Square, 
  Plus, 
  Users, 
  Trophy, 
  Target, 
  BarChart3,
  Crown,
  Medal,
  Award,
  Activity,
  Zap
} from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-mega-blue/5 via-mega-dark/10 to-mega-yellow/5 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-mega-yellow to-mega-orange rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-mega-dark" />
              </div>
              <h1 className="mega-title text-3xl sm:text-4xl lg:text-5xl">
                MEGA QUIZ
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">Panel de Administración</p>
          </div>

          {/* No Game State */}
          <Card className="p-8 text-center bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-2xl">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-mega-blue/20 to-mega-yellow/20 rounded-full flex items-center justify-center">
              <Trophy className="w-10 h-10 text-mega-yellow" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-foreground">No hay partidas activas</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Crea una nueva partida para comenzar el MEGA QUIZ y gestionar a los jugadores en tiempo real.
            </p>
            <Button
              onClick={handleCreateNewGame}
              disabled={isLoading}
              className="mega-button text-mega-dark px-8 py-4 text-lg font-bold"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-mega-dark/30 border-t-mega-dark rounded-full animate-spin"></div>
                  CREANDO PARTIDA...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  CREAR NUEVA PARTIDA
                </div>
              )}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mega-blue/5 via-mega-dark/10 to-mega-yellow/5 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Principal */}
        <Card className="p-6 bg-card/90 backdrop-blur-sm border-2 border-primary/20 shadow-2xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Logo y Info del Juego */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-mega-yellow to-mega-orange rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-8 h-8 text-mega-dark" />
              </div>
              <div>
                <h1 className="mega-title text-2xl sm:text-3xl lg:text-4xl mb-2">
                  MEGA QUIZ
                </h1>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={game.status === 'active' ? 'default' : 'secondary'}
                    className={`px-3 py-1 text-sm font-bold ${
                      game.status === 'active' 
                        ? 'bg-mega-green text-white animate-pulse' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      game.status === 'active' ? 'bg-white animate-ping' : 'bg-muted-foreground'
                    }`}></div>
                    {game.status.toUpperCase()}
                  </Badge>
                  <span className="text-muted-foreground text-sm">
                    {game.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Panel de Control */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleCreateNewGame}
                disabled={isLoading}
                variant="outline"
                className="border-mega-blue/30 hover:bg-mega-blue/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                NUEVA
              </Button>
              <Button
                onClick={handlePauseGame}
                disabled={isLoading}
                variant="outline"
                className={`border-mega-orange/30 hover:bg-mega-orange/10 ${
                  game.status === 'active' ? 'text-mega-orange' : 'text-mega-green'
                }`}
              >
                {game.status === 'active' ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    PAUSAR
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    REANUDAR
                  </>
                )}
              </Button>
              <Button
                onClick={handleNextQuestion}
                disabled={isLoading || game.status !== 'active'}
                className="mega-button text-mega-dark font-bold"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                SIGUIENTE
              </Button>
              <Button
                onClick={handleEndGame}
                disabled={isLoading}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <Square className="w-4 h-4 mr-2" />
                TERMINAR
              </Button>
            </div>
          </div>

          {/* Progreso del Juego */}
          <Separator className="my-6" />
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-mega-blue">{game.current_question + 1}</div>
                  <div className="text-xs text-muted-foreground">Pregunta</div>
                </div>
                <div className="text-muted-foreground">/</div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-mega-yellow">15</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div className="text-muted-foreground">/</div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-mega-green">Ronda {getRoundNumber(game.current_question)}</div>
                  <div className="text-xs text-muted-foreground">Actual</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">Progreso</div>
                <div className="text-lg font-bold text-primary">
                  {Math.round((game.current_question / 15) * 100)}%
                </div>
              </div>
            </div>
            <Progress 
              value={(game.current_question / 15) * 100} 
              className="h-3 bg-muted/50"
            />
          </div>
        </Card>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Jugadores Conectados */}
          <Card className="p-6 bg-gradient-to-br from-mega-blue/10 to-mega-blue/5 border-mega-blue/20 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Jugadores</p>
                <p className="text-3xl font-bold text-mega-blue">{players.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Conectados</p>
              </div>
              <div className="w-12 h-12 bg-mega-blue/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-mega-blue" />
              </div>
            </div>
          </Card>

          {/* Pregunta Actual */}
          <Card className="p-6 bg-gradient-to-br from-mega-yellow/10 to-mega-yellow/5 border-mega-yellow/20 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Pregunta</p>
                <p className="text-3xl font-bold text-mega-yellow">{game.current_question + 1}</p>
                <p className="text-xs text-muted-foreground mt-1">de 15</p>
              </div>
              <div className="w-12 h-12 bg-mega-yellow/20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-mega-yellow" />
              </div>
            </div>
          </Card>

          {/* Ronda Actual */}
          <Card className="p-6 bg-gradient-to-br from-mega-green/10 to-mega-green/5 border-mega-green/20 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Ronda</p>
                <p className="text-3xl font-bold text-mega-green">{getRoundNumber(game.current_question)}</p>
                <p className="text-xs text-muted-foreground mt-1">Actual</p>
              </div>
              <div className="w-12 h-12 bg-mega-green/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-mega-green" />
              </div>
            </div>
          </Card>

          {/* Puntos Totales */}
          <Card className="p-6 bg-gradient-to-br from-mega-orange/10 to-mega-orange/5 border-mega-orange/20 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Puntos</p>
                <p className="text-3xl font-bold text-mega-orange">
                  {players.reduce((sum, player) => sum + player.total_score, 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Totales</p>
              </div>
              <div className="w-12 h-12 bg-mega-orange/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-mega-orange" />
              </div>
            </div>
          </Card>
        </div>

        {/* Ranking de Jugadores con Podium */}
        <Card className="p-6 bg-card/90 backdrop-blur-sm border-2 border-primary/20 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-mega-yellow" />
            <h2 className="text-2xl font-bold">Ranking de Jugadores</h2>
            <Badge variant="outline" className="ml-auto">
              {players.length} jugadores
            </Badge>
          </div>
          
          {players.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No hay jugadores conectados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {players.slice(0, 10).map((player, index) => {
                const isTopThree = index < 3;
                const getRankIcon = () => {
                  if (index === 0) return <Crown className="w-5 h-5 text-yellow-500" />;
                  if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
                  if (index === 2) return <Award className="w-5 h-5 text-amber-600" />;
                  return <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>;
                };

                return (
                  <div 
                    key={player.id} 
                    className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:shadow-md ${
                      isTopThree 
                        ? 'bg-gradient-to-r from-mega-yellow/10 to-mega-orange/10 border border-mega-yellow/20' 
                        : 'bg-muted/50 hover:bg-muted/70'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-amber-600 text-white' :
                        'bg-primary/20 text-primary'
                      }`}>
                        {getRankIcon()}
                      </div>
                      
                      {player.players.photo_url ? (
                        <img
                          src={player.players.photo_url}
                          alt={player.players.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-mega-blue to-mega-yellow flex items-center justify-center text-white font-bold text-lg border-2 border-primary/20">
                          {player.players.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      
                      <div>
                        <p className="font-semibold text-lg">{player.players.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {player.correct_answers || 0} de {player.questions_answered || 0} correctas
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-mega-green">
                        {player.total_score || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">puntos</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;