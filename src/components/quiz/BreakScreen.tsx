import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BreakScreenProps {
  round: number;
  onBreakEnd: () => void;
}

const BreakScreen = ({ round, onBreakEnd }: BreakScreenProps) => {

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
    <div className="min-h-screen bg-background flex items-center justify-center p-3 sm:p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-mega-blue/5 to-transparent rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-mega-yellow/5 to-transparent rounded-full animate-pulse delay-1000"></div>
      </div>

      <Card className="w-full max-w-sm sm:max-w-lg lg:max-w-2xl p-6 sm:p-8 lg:p-12 text-center bg-card/90 backdrop-blur-sm border-2 border-primary/20 shadow-2xl animate-mega-entrance relative z-10">
        {/* Large Emoji */}
        <div className="text-4xl sm:text-6xl lg:text-8xl mb-4 sm:mb-6 animate-pulse">
          {breakInfo.emoji}
        </div>

        {/* Title */}
        <h1 className="mega-title text-2xl sm:text-3xl lg:text-5xl mb-2 sm:mb-4">
          {breakInfo.title}
        </h1>

        {/* Subtitle */}
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-mega-green mb-4 sm:mb-6">
          {breakInfo.subtitle}
        </h2>

        {/* Message */}
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-xs sm:max-w-md mx-auto">
          {breakInfo.message}
        </p>

        {/* Continue Button */}
        <div className="animate-mega-entrance">
          <Button
            onClick={handleContinue}
            className="mega-button text-mega-dark px-8 sm:px-10 lg:px-12 py-3 sm:py-4 text-base sm:text-lg lg:text-xl w-full sm:w-auto"
          >
            CONTINUAR
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-3 sm:-top-6 left-1/2 transform -translate-x-1/2 w-8 h-8 sm:w-12 sm:h-12 bg-primary/20 rounded-full animate-ping"></div>
        <div className="absolute -bottom-3 sm:-bottom-6 left-1/4 w-6 h-6 sm:w-8 sm:h-8 bg-mega-green/30 rounded-full animate-pulse delay-500"></div>
        <div className="absolute -bottom-3 sm:-bottom-6 right-1/4 w-6 h-6 sm:w-8 sm:h-8 bg-mega-orange/30 rounded-full animate-pulse delay-1000"></div>
      </Card>
    </div>
  );
};

export default BreakScreen;