import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import megaHelpLogo from '@/assets/mega-help-logo.png';

const WelcomeScreen = () => {
  const [playerName, setPlayerName] = useState('');
  const [playerPhoto, setPlayerPhoto] = useState<File | null>(null);
  const navigate = useNavigate();

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPlayerPhoto(file);
    }
  };

  const handleJoinGame = () => {
    if (playerName.trim()) {
      // Here we would normally save to Supabase
      localStorage.setItem('playerName', playerName);
      if (playerPhoto) {
        const reader = new FileReader();
        reader.onload = (e) => {
          localStorage.setItem('playerPhoto', e.target?.result as string);
        };
        reader.readAsDataURL(playerPhoto);
      }
      navigate('/quiz');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-mega-blue/10 via-transparent to-mega-yellow/10"></div>
      
      <Card className="w-full max-w-md p-8 backdrop-blur-sm bg-card/80 border-2 border-primary/20 shadow-2xl animate-mega-entrance relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src={megaHelpLogo} 
            alt="MEGA HELP Logo" 
            className="w-32 h-32 object-contain glow-effect"
          />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="mega-title text-4xl mb-2">MEGA</h1>
          <h2 className="mega-title text-3xl text-mega-green">QUIZ</h2>
          <p className="text-muted-foreground mt-4 text-sm">
            El evento más grande para valorar la vida
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Tu nombre
            </label>
            <Input
              type="text"
              placeholder="Ingresa tu nombre..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="text-center text-lg font-medium h-12"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Foto de perfil
            </label>
            <div className="flex flex-col items-center gap-3">
              {playerPhoto && (
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary">
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
                className="text-center"
              />
            </div>
          </div>

          <Button
            onClick={handleJoinGame}
            disabled={!playerName.trim()}
            className="mega-button w-full text-mega-dark"
            size="lg"
          >
            UNIRSE A LA PARTIDA
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-mega-green rounded-full opacity-30 animate-pulse delay-300"></div>
      </Card>
    </div>
  );
};

export default WelcomeScreen;