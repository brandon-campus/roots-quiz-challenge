import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionScreen from '@/components/quiz/QuestionScreen';
import BreakScreen from '@/components/quiz/BreakScreen';
import { quizData } from '@/data/quizData';
import { QuizState, GamePhase } from '@/types/quiz';
import { getActiveGame, savePlayerAnswer, updatePlayerScore, getConnectedPlayers } from '@/lib/database';
import { supabase } from '@/lib/supabase';

const QuizGame = () => {
  const navigate = useNavigate();
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    score: 0,
    round: 1,
    phase: 'question' as GamePhase,
    timeRemaining: 20,
    playerAnswer: null,
    showResult: false
  });
  const [game, setGame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const playerId = localStorage.getItem('playerId');
  const playerName = localStorage.getItem('playerName');

  // Check if player is registered and load game
  useEffect(() => {
    if (!playerId || !playerName) {
      navigate('/');
      return;
    }

    initializeGame();
    setupRealtimeSubscription();
  }, [navigate, playerId, playerName]);

  const initializeGame = async () => {
    try {
      const activeGame = await getActiveGame();
      if (!activeGame) {
        navigate('/lobby');
        return;
      }
      
      setGame(activeGame);
      setQuizState(prev => ({
        ...prev,
        currentQuestion: activeGame.current_question,
        phase: activeGame.phase || 'question',
        timeRemaining: activeGame.time_remaining || 20,
        round: Math.floor(activeGame.current_question / 5) + 1
      }));
    } catch (error) {
      console.error('Error cargando juego:', error);
      navigate('/lobby');
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('quiz-game')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'games' },
        (payload) => {
          console.log('Cambio en estado del juego:', payload);
          if (payload.new) {
            setGame(payload.new);
            setQuizState(prev => ({
              ...prev,
              currentQuestion: payload.new.current_question,
              phase: payload.new.phase || 'question',
              timeRemaining: payload.new.time_remaining || 20,
              round: Math.floor(payload.new.current_question / 5) + 1
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleAnswerSubmit = async (answerIndex: number) => {
    if (!game || !playerId) return;
    
    const currentQ = quizData[quizState.currentQuestion];
    const isCorrect = answerIndex === currentQ.correctAnswer;
    const timeTaken = 20 - quizState.timeRemaining; // Tiempo que tardó en responder
    
    // Guardar respuesta en la base de datos
    try {
      await savePlayerAnswer(
        game.id,
        playerId,
        currentQ.id,
        answerIndex,
        isCorrect,
        timeTaken
      );

      // Actualizar puntaje del jugador
      await updatePlayerScore(
        game.id,
        playerId,
        isCorrect ? 100 : 0
      );
    } catch (error) {
      console.error('Error guardando respuesta:', error);
    }
    
    setQuizState(prev => ({
      ...prev,
      playerAnswer: answerIndex,
      showResult: true,
      score: prev.score + (isCorrect ? 100 : 0)
    }));

    // Show result for 3 seconds, then move to next question or break
    setTimeout(() => {
      const nextQuestion = quizState.currentQuestion + 1;
      
      if (nextQuestion >= quizData.length) {
        // Quiz finished
        navigate('/');
        return;
      }

      // Check if we need a break
      const shouldBreak = (nextQuestion % 5 === 0) ||           // Después de cada 5 preguntas (rondas 1 y 2)
                         (nextQuestion >= 11);                  // Después de cada pregunta en ronda 3

      if (shouldBreak) {
        setQuizState(prev => ({
          ...prev,
          phase: 'break',
          timeRemaining: 60,
          playerAnswer: null,
          showResult: false
        }));
      } else {
        setQuizState(prev => ({
          ...prev,
          currentQuestion: nextQuestion,
          phase: 'question',
          timeRemaining: 20,
          playerAnswer: null,
          showResult: false,
          round: Math.floor(nextQuestion / 5) + 1
        }));
      }
    }, 3000);
  };

  const handleBreakEnd = () => {
    const nextQuestion = quizState.currentQuestion + 1;
    setQuizState(prev => ({
      ...prev,
      currentQuestion: nextQuestion,
      phase: 'question',
      timeRemaining: 20,
      round: Math.floor(nextQuestion / 5) + 1
    }));
  };

  const handleTimeUp = () => {
    if (quizState.phase === 'question' && !quizState.showResult) {
      handleAnswerSubmit(-1); // -1 indicates no answer/time up
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold mb-2">Cargando juego...</div>
          <div className="text-muted-foreground">Conectando con la partida</div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold mb-2">No hay partida activa</div>
          <div className="text-muted-foreground">Redirigiendo al lobby...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {quizState.phase === 'question' ? (
        <QuestionScreen
          question={quizData[quizState.currentQuestion]}
          questionNumber={quizState.currentQuestion + 1}
          totalQuestions={quizData.length}
          timeRemaining={quizState.timeRemaining}
          score={quizState.score}
          round={quizState.round}
          playerAnswer={quizState.playerAnswer}
          showResult={quizState.showResult}
          onAnswerSubmit={handleAnswerSubmit}
          onTimeUp={handleTimeUp}
        />
      ) : (
        <BreakScreen
          round={quizState.round}
          timeRemaining={quizState.timeRemaining}
          onBreakEnd={handleBreakEnd}
        />
      )}
    </div>
  );
};

export default QuizGame;