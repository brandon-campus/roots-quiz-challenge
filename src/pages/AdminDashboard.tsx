import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Mock data - This would come from Supabase
  const mockPlayers = [
    { id: 1, name: 'Juan Pérez', score: 1800, photo: null },
    { id: 2, name: 'María García', score: 1650, photo: null },
    { id: 3, name: 'Carlos López', score: 1500, photo: null },
    { id: 4, name: 'Ana Martínez', score: 1400, photo: null },
    { id: 5, name: 'Luis Rodríguez', score: 1200, photo: null },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="mega-title text-4xl mb-2">MEGA QUIZ</h1>
            <h2 className="text-2xl font-bold text-mega-green">Panel de Administrador</h2>
          </div>
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Volver al Inicio
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center bg-gradient-to-r from-mega-yellow/10 to-mega-orange/10 border-primary/20">
            <h3 className="text-2xl font-bold text-primary mb-2">25</h3>
            <p className="text-muted-foreground">Jugadores Activos</p>
          </Card>
          <Card className="p-6 text-center bg-gradient-to-r from-mega-blue/10 to-mega-green/10 border-secondary/20">
            <h3 className="text-2xl font-bold text-secondary mb-2">Pregunta 12</h3>
            <p className="text-muted-foreground">Progreso Actual</p>
          </Card>
          <Card className="p-6 text-center bg-gradient-to-r from-mega-green/10 to-primary/10 border-success/20">
            <h3 className="text-2xl font-bold text-success mb-2">1850</h3>
            <p className="text-muted-foreground">Puntaje Más Alto</p>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card className="p-6">
          <h3 className="text-2xl font-bold mb-6 text-center">
            🏆 Ranking de Jugadores
          </h3>
          <div className="space-y-4">
            {mockPlayers.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center gap-4 p-4 rounded-xl border ${
                  index === 0
                    ? 'bg-gradient-to-r from-primary/20 to-mega-yellow/20 border-primary'
                    : index === 1
                    ? 'bg-gradient-to-r from-secondary/20 to-mega-blue/20 border-secondary'
                    : index === 2
                    ? 'bg-gradient-to-r from-mega-orange/20 to-accent/20 border-accent'
                    : 'bg-card border-border'
                }`}
              >
                {/* Position */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                  index === 0 ? 'bg-primary text-primary-foreground' :
                  index === 1 ? 'bg-secondary text-secondary-foreground' :
                  index === 2 ? 'bg-accent text-accent-foreground' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
                </div>

                {/* Photo */}
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  {player.photo ? (
                    <img src={player.photo} alt={player.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-xl">👤</span>
                  )}
                </div>

                {/* Name */}
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{player.name}</h4>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{player.score}</div>
                  <div className="text-sm text-muted-foreground">puntos</div>
                </div>

                {/* Progress Bar */}
                <div className="w-24">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-mega-yellow rounded-full transition-all duration-500"
                      style={{ width: `${(player.score / 2000) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-center mt-8 gap-4">
          <Button className="mega-button text-mega-dark">
            Exportar Resultados
          </Button>
          <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            Reiniciar Quiz
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;