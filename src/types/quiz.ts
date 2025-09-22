export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category?: string;
}

export type GamePhase = 'question' | 'break' | 'result';

export interface QuizState {
  currentQuestion: number;
  score: number;
  round: number;
  phase: GamePhase;
  timeRemaining: number;
  playerAnswer: number | null;
  showResult: boolean;
}

export interface Player {
  id: string;
  name: string;
  photo?: string;
  score: number;
  currentQuestion: number;
  joinedAt: Date;
}