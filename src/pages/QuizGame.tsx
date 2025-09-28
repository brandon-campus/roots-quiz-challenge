import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionScreen from '@/components/quiz/QuestionScreen';
import BreakScreen from '@/components/quiz/BreakScreen';
import { getQuestionsForGame, getQuestionByOrder } from '@/lib/seedQuestions';
import { QuizState, GamePhase } from '@/types/quiz';
import { getActiveGame, savePlayerAnswer, updatePlayerScore, getConnectedPlayers } from '@/lib/database';
import { supabase } from '@/lib/supabase';

// Función para calcular el número de ronda según la nueva estructura
const getRoundNumber = (questionIndex: number): number => {
  if (questionIndex < 6) return 1;        // Preguntas 1-6: Ronda 1
  if (questionIndex < 12) return 2;       // Preguntas 7-12: Ronda 2
  if (questionIndex === 12) return 3;     // Pregunta 13: Ronda 3
  if (questionIndex === 13) return 4;     // Pregunta 14: Ronda 4
  if (questionIndex === 14) return 5;     // Pregunta 15: Ronda 5 (Final)
  return 1; // Default
};

const QuizGame = () => {
  const navigate = useNavigate();
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    score: 0,
    round: 1,
    phase: 'question' as GamePhase,
    playerAnswer: null,
    showResult: false
  });
  const [game, setGame] = useState(null);
  const [questions, setQuestions] = useState([]);
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
      
      // Cargar preguntas desde la base de datos
      console.log('Cargando preguntas para el juego:', activeGame.id);
      console.log('Estado del juego:', activeGame);
      
      try {
        const gameQuestions = await getQuestionsForGame(activeGame.id);
        
        if (!gameQuestions || gameQuestions.length === 0) {
          console.error('No se encontraron preguntas para el juego:', activeGame.id);
          console.log('Intentando esperar un momento para que se creen las preguntas...');
          
          // Esperar 2 segundos y reintentar (el trigger puede tardar un poco)
          await new Promise(resolve => setTimeout(resolve, 2000));
          const retryQuestions = await getQuestionsForGame(activeGame.id);
          
          if (!retryQuestions || retryQuestions.length === 0) {
            console.error('Segundo intento fallido. No hay preguntas disponibles.');
            alert('Error: No se encontraron preguntas para este juego. El trigger automático puede no estar funcionando. Verifica la configuración de la base de datos.');
            navigate('/lobby');
            return;
          }
          
          console.log('Preguntas encontradas en segundo intento:', retryQuestions.length);
          setQuestions(retryQuestions);
        } else {
          console.log('Preguntas cargadas exitosamente:', gameQuestions.length);
          setQuestions(gameQuestions);
        }
      } catch (questionError) {
        console.error('Error cargando preguntas:', questionError);
        alert('Error de conexión al cargar preguntas. Verifica tu conexión y la configuración de Supabase.');
        navigate('/lobby');
        return;
      }
      
      setQuizState(prev => ({
        ...prev,
        currentQuestion: activeGame.current_question,
        phase: activeGame.phase || 'question',
        round: getRoundNumber(activeGame.current_question)
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
              round: getRoundNumber(payload.new.current_question)
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
    if (!game || !playerId || !questions || questions.length === 0) return;
    
    const currentQ = questions[quizState.currentQuestion];
    if (!currentQ) {
      console.error('Pregunta no encontrada en el índice:', quizState.currentQuestion);
      return;
    }
    const isCorrect = answerIndex === currentQ.correct_answer;
    const timeTaken = 0; // Sin temporizador
    
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
      
      if (nextQuestion >= questions.length) {
        // Quiz finished
        navigate('/');
        return;
      }

      // Check if we need a break
      const shouldBreak = (nextQuestion === 6) ||               // Después de 6 preguntas (primera ronda)
                         (nextQuestion === 12) ||               // Después de 12 preguntas (segunda ronda)
                         (nextQuestion === 13) ||               // Después de pregunta 13
                         (nextQuestion === 14);                 // Después de pregunta 14

      if (shouldBreak) {
        setQuizState(prev => ({
          ...prev,
          phase: 'break',
          playerAnswer: null,
          showResult: false
        }));
      } else {
        setQuizState(prev => ({
          ...prev,
          currentQuestion: nextQuestion,
          phase: 'question',
          playerAnswer: null,
          showResult: false,
          round: getRoundNumber(nextQuestion)
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
      round: getRoundNumber(nextQuestion)
    }));
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

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold mb-2">Cargando preguntas...</div>
          <div className="text-muted-foreground">Preparando el quiz</div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[quizState.currentQuestion];
  if (!currentQuestion && quizState.phase === 'question') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold mb-2">Error en pregunta</div>
          <div className="text-muted-foreground">No se pudo cargar la pregunta actual</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {quizState.phase === 'question' ? (
        <QuestionScreen
          question={currentQuestion}
          questionNumber={quizState.currentQuestion + 1}
          totalQuestions={questions.length}
          score={quizState.score}
          round={quizState.round}
          playerAnswer={quizState.playerAnswer}
          showResult={quizState.showResult}
          onAnswerSubmit={handleAnswerSubmit}
        />
      ) : (
        <BreakScreen
          round={quizState.round}
          onBreakEnd={handleBreakEnd}
        />
      )}
    </div>
  );
};

export default QuizGame;