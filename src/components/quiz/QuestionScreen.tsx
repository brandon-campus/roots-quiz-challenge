import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Question } from '@/types/quiz';

interface QuestionScreenProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  timeRemaining: number;
  score: number;
  round: number;
  playerAnswer: number | null;
  showResult: boolean;
  onAnswerSubmit: (answerIndex: number) => void;
  onTimeUp: () => void;
}

const QuestionScreen = ({
  question,
  questionNumber,
  totalQuestions,
  timeRemaining,
  score,
  round,
  playerAnswer,
  showResult,
  onAnswerSubmit,
  onTimeUp
}: QuestionScreenProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timer, setTimer] = useState(timeRemaining);

  useEffect(() => {
    setTimer(timeRemaining);
  }, [timeRemaining]);

  useEffect(() => {
    if (!showResult && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer, showResult, onTimeUp]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (!showResult) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer !== null) {
      onAnswerSubmit(selectedAnswer);
    }
  };

  const getAnswerButtonClass = (index: number) => {
    if (!showResult) {
      return selectedAnswer === index 
        ? 'quiz-answer-button border-primary bg-primary/10' 
        : 'quiz-answer-button';
    }
    
    if (index === question.correctAnswer) {
      return 'answer-correct';
    }
    
    if (playerAnswer === index && index !== question.correctAnswer) {
      return 'answer-incorrect';
    }
    
    return 'quiz-answer-button opacity-50';
  };

  const getTimerColor = () => {
    if (timer > 10) return 'text-primary';
    if (timer > 5) return 'text-mega-orange';
    return 'text-danger';
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-left">
            <h1 className="mega-title text-3xl">MEGA QUIZ</h1>
            <p className="text-muted-foreground">Round {round} - Pregunta {questionNumber}/{totalQuestions}</p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{score} puntos</div>
            <div className={`text-3xl font-bold ${getTimerColor()}`}>
              {timer}s
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-mega-yellow transition-all duration-500"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <Card className="p-8 mb-8 bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
              {question.question}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="grid gap-4">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                className={getAnswerButtonClass(index)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary font-bold text-lg">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-left flex-1">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Submit Button */}
          {!showResult && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className="mega-button text-mega-dark px-12 py-4 text-xl"
              >
                ENVIAR RESPUESTA
              </Button>
            </div>
          )}

          {/* Result Message */}
          {showResult && (
            <div className="text-center mt-8">
              {playerAnswer === question.correctAnswer ? (
                <div className="text-success text-2xl font-bold animate-pulse-success">
                  ¡CORRECTO! +100 puntos
                </div>
              ) : (
                <div className="text-danger text-2xl font-bold animate-shake">
                  {playerAnswer === null ? '¡TIEMPO AGOTADO!' : '¡INCORRECTO!'}
                </div>
              )}
              <div className="text-muted-foreground mt-2">
                La respuesta correcta era: <strong>{question.options[question.correctAnswer]}</strong>
              </div>
            </div>
          )}
        </Card>

        {/* Decorative Timer Ring */}
        <div className="fixed top-10 right-10">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="2"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={timer > 10 ? "hsl(var(--primary))" : timer > 5 ? "hsl(var(--mega-orange))" : "hsl(var(--danger))"}
                strokeWidth="2"
                strokeDasharray={`${(timer / 20) * 100}, 100`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-lg font-bold ${getTimerColor()}`}>
                {timer}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionScreen;