import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Question } from '@/types/quiz';

interface QuestionScreenProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  score: number;
  round: number;
  playerAnswer: number | null;
  showResult: boolean;
  onAnswerSubmit: (answerIndex: number) => void;
}

const QuestionScreen = ({
  question,
  questionNumber,
  totalQuestions,
  score,
  round,
  playerAnswer,
  showResult,
  onAnswerSubmit
}: QuestionScreenProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

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
    
    if (index === question.correct_answer) {
      return 'answer-correct';
    }
    
    if (playerAnswer === index && index !== question.correct_answer) {
      return 'answer-incorrect';
    }
    
    return 'quiz-answer-button opacity-50';
  };


  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
          <div className="text-center sm:text-left">
            <h1 className="mega-title text-xl sm:text-2xl lg:text-3xl">MEGA QUIZ</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">Round {round} - Pregunta {questionNumber}/{totalQuestions}</p>
          </div>
          
          <div className="text-center sm:text-right">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">{score} puntos</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="w-full bg-muted rounded-full h-2 sm:h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-mega-yellow transition-all duration-500"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <Card className="p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-2xl">
          <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-foreground leading-tight">
              {question.question_text}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="grid gap-3 sm:gap-4">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                className={`${getAnswerButtonClass(index)} min-h-[60px] sm:min-h-[70px]`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 text-primary font-bold text-base sm:text-lg flex-shrink-0">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-left flex-1 text-sm sm:text-base lg:text-lg">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Submit Button */}
          {!showResult && (
            <div className="flex justify-center mt-6 sm:mt-8">
              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className="mega-button text-mega-dark px-6 sm:px-8 lg:px-12 py-3 sm:py-4 text-base sm:text-lg lg:text-xl w-full sm:w-auto"
              >
                ENVIAR RESPUESTA
              </Button>
            </div>
          )}

          {/* Result Message */}
          {showResult && (
            <div className="text-center mt-6 sm:mt-8">
              {playerAnswer === question.correct_answer ? (
                <div className="text-success text-lg sm:text-xl lg:text-2xl font-bold animate-pulse-success">
                  ¡CORRECTO! +100 puntos
                </div>
              ) : (
                <div className="text-danger text-lg sm:text-xl lg:text-2xl font-bold animate-shake">
                  {playerAnswer === null ? '¡TIEMPO AGOTADO!' : '¡INCORRECTO!'}
                </div>
              )}
              <div className="text-muted-foreground mt-2 text-sm sm:text-base">
                La respuesta correcta era: <strong>{question.options[question.correct_answer]}</strong>
              </div>
            </div>
          )}
        </Card>


      </div>
    </div>
  );
};

export default QuestionScreen;