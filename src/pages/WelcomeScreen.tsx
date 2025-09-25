import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { createPlayer } from '@/lib/database';
import megaHelpLogo from '@/assets/mega-help-logo.png';

const WelcomeScreen = () => {
  const [playerName, setPlayerName] = useState('');
  const [playerPhoto, setPlayerPhoto] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPlayerPhoto(file);
    }
  };

  const handleJoinGame = async () => {
    if (playerName.trim() && !isLoading) {
      setIsLoading(true);
      
      try {
        // Crear jugador en la base de datos
        const player = await createPlayer(playerName, playerPhoto);
        
        // Guardar ID del jugador en localStorage para usar en el juego
        localStorage.setItem('playerId', player.id);
        localStorage.setItem('playerName', player.name);
        localStorage.setItem('playerPhoto', player.photo_url || '');
        
        // Navegar a la sala de espera
        navigate('/lobby');
      } catch (error) {
        console.error('Error creando jugador:', error);
        // Aquí podrías mostrar un toast de error
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-gradient-to-br from-mega-blue/10 via-transparent to-mega-yellow/10"></div>
      
      <Card className="w-full max-w-sm p-4 sm:p-6 md:p-8 backdrop-blur-sm bg-card/80 border-2 border-primary/20 shadow-2xl animate-mega-entrance relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <img 
            src={megaHelpLogo} 
            alt="MEGA HELP Logo" 
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 object-contain glow-effect"
          />
        </div>

        {/* Title */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="mega-title text-2xl sm:text-3xl md:text-4xl mb-1">MEGA</h1>
          <h2 className="mega-title text-xl sm:text-2xl md:text-3xl text-mega-green">QUIZ</h2>
          <p className="text-muted-foreground mt-2 sm:mt-4 text-xs sm:text-sm">
            El evento más grande para valorar la vida
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4 sm:space-y-6">
          <div>
            <label className="text-xs sm:text-sm font-semibold text-foreground mb-2 block">
              Tu nombre
            </label>
            <Input
              type="text"
              placeholder="Ingresa tu nombre..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="text-center text-base sm:text-lg font-medium h-11 sm:h-12"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-xs sm:text-sm font-semibold text-foreground mb-2 block">
              Foto de perfil
            </label>
            <div className="flex flex-col items-center gap-3">
              {playerPhoto && (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-primary">
                  <img
                    src={URL.createObjectURL(playerPhoto)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="text-center text-sm sm:text-base"
                disabled={isLoading}
              />
            </div>
          </div>

          <Button
            onClick={handleJoinGame}
            disabled={!playerName.trim() || isLoading}
            className="mega-button w-full text-mega-dark text-base sm:text-lg"
            size="lg"
          >
            {isLoading ? 'CREANDO PERFIL...' : 'UNIRSE A LA PARTIDA'}
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 w-4 h-4 sm:w-6 sm:h-6 bg-mega-green rounded-full opacity-30 animate-pulse delay-300"></div>
      </Card>
    </div>
  );
};

export default WelcomeScreen;