import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getActiveGame, updateGameState } from '@/lib/database';

interface GameContextType {
  game: any;
  currentQuestion: number;
  phase: 'question' | 'break' | 'result';
  timeRemaining: number;
  isLoading: boolean;
  updateGame: (updates: any) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [game, setGame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeGame();
    setupRealtimeSubscription();
  }, []);

  const initializeGame = async () => {
    try {
      const activeGame = await getActiveGame();
      setGame(activeGame);
    } catch (error) {
      console.error('Error inicializando juego:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('game-state')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'games' },
        (payload) => {
          console.log('Cambio en estado del juego:', payload);
          setGame(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateGame = async (updates: any) => {
    if (!game) return;
    
    try {
      const updatedGame = await updateGameState(game.id, updates);
      setGame(updatedGame);
    } catch (error) {
      console.error('Error actualizando juego:', error);
      throw error;
    }
  };

  const value: GameContextType = {
    game,
    currentQuestion: game?.current_question || 0,
    phase: game?.phase || 'question',
    timeRemaining: game?.time_remaining || 20,
    isLoading,
    updateGame
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
