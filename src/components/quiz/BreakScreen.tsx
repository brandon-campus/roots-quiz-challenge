import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BreakScreenProps {
  round: number;
  timeRemaining: number;
  onBreakEnd: () => void;
}

const BreakScreen = ({ round, timeRemaining, onBreakEnd }: BreakScreenProps) => {
  const [timer, setTimer] = useState(timeRemaining);
  const [showContinueButton, setShowContinueButton] = useState(false);

  useEffect(() => {
    setTimer(timeRemaining);
    setShowContinueButton(false);
  }, [timeRemaining]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setShowContinueButton(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleContinue = () => {
    onBreakEnd();
  };

  const getBreakMessage = () => {
    if (round <= 3) {
      return {
        title: "¡DESCANSO!",
        subtitle: `Finalizó el Round ${round}`,
        message: "Tómate un momento para relajarte. El próximo round comenzará pronto.",
        emoji: "☕"
      };
    } else {
      return {
        title: "¡ROUND FINAL!",
        subtitle: "Preparándose para la siguiente pregunta...",
        message: "Cada pregunta cuenta. ¡Mantén la concentración!",
        emoji: "🔥"
      };
    }
  };

  const breakInfo = getBreakMessage();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-mega-blue/5 to-transparent rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-mega-yellow/5 to-transparent rounded-full animate-pulse delay-1000"></div>
      </div>

      <Card className="w-full max-w-2xl p-12 text-center bg-card/90 backdrop-blur-sm border-2 border-primary/20 shadow-2xl animate-mega-entrance relative z-10">
        {/* Large Emoji */}
        <div className="text-8xl mb-6 animate-pulse">
          {breakInfo.emoji}
        </div>

        {/* Title */}
        <h1 className="mega-title text-5xl mb-4">
          {breakInfo.title}
        </h1>

        {/* Subtitle */}
        <h2 className="text-2xl font-bold text-mega-green mb-6">
          {breakInfo.subtitle}
        </h2>

        {/* Message */}
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          {breakInfo.message}
        </p>

        {/* Timer or Continue Button */}
        {!showContinueButton ? (
          <div className="space-y-6">
            {/* Countdown Timer */}
            <div className="relative mx-auto w-32 h-32">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  strokeDasharray={`${(timer / 60) * 100}, 100`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-primary mb-1">
                  {timer}
                </span>
                <span className="text-xs text-muted-foreground">
                  segundos
                </span>
              </div>
            </div>

            <div className="text-muted-foreground">
              Esperando para continuar...
            </div>
          </div>
        ) : (
          <div className="animate-mega-entrance">
            <Button
              onClick={handleContinue}
              className="mega-button text-mega-dark px-12 py-4 text-xl"
            >
              CONTINUAR
            </Button>
          </div>
        )}

        {/* Decorative elements */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-primary/20 rounded-full animate-ping"></div>
        <div className="absolute -bottom-6 left-1/4 w-8 h-8 bg-mega-green/30 rounded-full animate-pulse delay-500"></div>
        <div className="absolute -bottom-6 right-1/4 w-8 h-8 bg-mega-orange/30 rounded-full animate-pulse delay-1000"></div>
      </Card>
    </div>
  );
};

export default BreakScreen;