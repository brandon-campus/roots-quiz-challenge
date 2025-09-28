export interface Question {
  id: number;
  question_text: string;
  options: string[];
  correct_answer: number;
  category?: string;
  order_index: number;
  game_id: string;
}

export type GamePhase = 'question' | 'break' | 'result';

export interface QuizState {
  currentQuestion: number;
  score: number;
  round: number;
  phase: GamePhase;
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