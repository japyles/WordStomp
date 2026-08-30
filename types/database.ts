export interface GameState {
  grid: string[][];
  foundWords: {
    [word: string]: {
      foundBy: string;
      positions: { row: number; col: number }[];
      color: string;
    };
  };
  playerColors: { [userId: string]: string };
}

export interface WordPosition {
  word: string;
  start: { row: number; col: number };
  end: { row: number; col: number };
  direction: 'horizontal' | 'vertical' | 'diagonal';
}

export interface UserProfile {
  _id: string;
  _creationTime: number;
  name?: string;
  email?: string;
  image?: string;
  highlightColor?: string;
}

export interface Game {
  _id: string;
  _creationTime: number;
  wordList: string[];
  gridSize: string;
  category: string;
  participants: string[];
  gameState: GameState;
  status: 'waiting' | 'active' | 'completed';
  tournamentId?: string;
  completedAt?: number;
  duration?: number;
}
