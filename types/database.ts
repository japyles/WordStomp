export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          email: string;
          created_at: string;
          highlight_color: string;
          avatar_url?: string;
        };
        Insert: {
          id: string;
          username: string;
          email: string;
          highlight_color?: string;
          avatar_url?: string;
        };
        Update: {
          username?: string;
          highlight_color?: string;
          avatar_url?: string;
        };
      };
      games: {
        Row: {
          id: string;
          word_list: string[];
          grid_size: { width: number; height: number };
          category: string;
          start_time?: string;
          end_time?: string;
          participants: string[];
          game_state: GameState;
          tournament_id?: string;
          created_at: string;
          status: 'waiting' | 'active' | 'completed';
        };
        Insert: {
          id?: string;
          word_list: string[];
          grid_size: { width: number; height: number };
          category: string;
          participants: string[];
          game_state: GameState;
          tournament_id?: string;
          status?: 'waiting' | 'active' | 'completed';
        };
        Update: {
          start_time?: string;
          end_time?: string;
          participants?: string[];
          game_state?: GameState;
          status?: 'waiting' | 'active' | 'completed';
        };
      };
      tournaments: {
        Row: {
          id: string;
          name: string;
          start_time: string;
          end_time: string;
          participants: string[];
          current_round: number;
          max_rounds: number;
          created_at: string;
          status: 'upcoming' | 'active' | 'completed';
        };
        Insert: {
          id?: string;
          name: string;
          start_time: string;
          end_time: string;
          participants: string[];
          max_rounds: number;
          status?: 'upcoming' | 'active' | 'completed';
        };
        Update: {
          participants?: string[];
          current_round?: number;
          status?: 'upcoming' | 'active' | 'completed';
        };
      };
      user_stats: {
        Row: {
          id: string;
          user_id: string;
          total_games: number;
          games_won: number;
          games_lost: number;
          longest_streak: number;
          current_streak: number;
          fastest_time: number;
          average_time: number;
          words_found: number;
          tournaments_won: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          total_games?: number;
          games_won?: number;
          games_lost?: number;
          longest_streak?: number;
          current_streak?: number;
          fastest_time?: number;
          average_time?: number;
          words_found?: number;
          tournaments_won?: number;
        };
        Update: {
          total_games?: number;
          games_won?: number;
          games_lost?: number;
          longest_streak?: number;
          current_streak?: number;
          fastest_time?: number;
          average_time?: number;
          words_found?: number;
          tournaments_won?: number;
        };
      };
      leaderboards: {
        Row: {
          id: string;
          type: 'all-time' | 'tournament' | 'weekly';
          user_id: string;
          score: number;
          rank: number;
          streak: number;
          tournament_id?: string;
          created_at: string;
        };
        Insert: {
          type: 'all-time' | 'tournament' | 'weekly';
          user_id: string;
          score: number;
          rank: number;
          streak: number;
          tournament_id?: string;
        };
        Update: {
          score?: number;
          rank?: number;
          streak?: number;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'challenge' | 'tournament' | 'achievement';
          title: string;
          message: string;
          read_status: boolean;
          metadata?: any;
          created_at: string;
        };
        Insert: {
          user_id: string;
          type: 'challenge' | 'tournament' | 'achievement';
          title: string;
          message: string;
          metadata?: any;
        };
        Update: {
          read_status?: boolean;
        };
      };
    };
  };
}

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