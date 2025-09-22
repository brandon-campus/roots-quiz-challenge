import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionScreen from '@/components/quiz/QuestionScreen';
import BreakScreen from '@/components/quiz/BreakScreen';
import { quizData } from '@/data/quizData';
import { QuizState, GamePhase } from '@/types/quiz';

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

  // Check if player is registered
  useEffect(() => {
    const playerName = localStorage.getItem('playerName');
    if (!playerName) {
      navigate('/');
    }
  }, [navigate]);

  const handleAnswerSubmit = (answerIndex: number) => {
    const currentQ = quizData[quizState.currentQuestion];
    const isCorrect = answerIndex === currentQ.correctAnswer;
    
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
      const shouldBreak = (nextQuestion % 5 === 0) || 
                         (nextQuestion >= 15); // Last round has breaks after each question

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