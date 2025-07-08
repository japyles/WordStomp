import React, { createContext, useContext, useEffect, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Database, GameState } from '@/types/database';
import { useAuth } from './AuthContext';

type Game = Database['public']['Tables']['games']['Row'];

interface GameContextType {
  currentGame: Game | null;
  gameChannel: RealtimeChannel | null;
  loading: boolean;
  error: string | null;
  createGame: (category: string, gridSize: { width: number; height: number }) => Promise<string | null>;
  joinGame: (gameId: string) => Promise<boolean>;
  leaveGame: () => void;
  updateGameState: (gameState: GameState) => Promise<void>;
  findWord: (word: string, positions: { row: number; col: number }[]) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [gameChannel, setGameChannel] = useState<RealtimeChannel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (gameChannel) {
        supabase.removeChannel(gameChannel);
      }
    };
  }, [gameChannel]);

  const createGame = async (category: string, gridSize: { width: number; height: number }) => {
    if (!user) return null;

    setLoading(true);
    setError(null);

    try {
      // Generate word list and grid
      const wordList = generateWordList(category);
      const grid = generateGrid(gridSize.width, gridSize.height, wordList);

      const gameState: GameState = {
        grid,
        foundWords: {},
        playerColors: {
          [user.id]: profile?.highlight_color || '#8B5CF6',
        },
      };

      const { data, error } = await supabase
        .from('games')
        .insert({
          word_list: wordList,
          grid_size: gridSize,
          category,
          participants: [user.id],
          game_state: gameState,
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentGame(data);
      setupGameChannel(data.id);
      return data.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const joinGame = async (gameId: string) => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      // Get current game
      const { data: game, error: fetchError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (fetchError) throw fetchError;

      // Add user to participants
      const updatedParticipants = [...game.participants, user.id];
      const updatedGameState = {
        ...game.game_state,
        playerColors: {
          ...game.game_state.playerColors,
          [user.id]: profile?.highlight_color || '#8B5CF6',
        },
      };

      const { error: updateError } = await supabase
        .from('games')
        .update({
          participants: updatedParticipants,
          game_state: updatedGameState,
        })
        .eq('id', gameId);

      if (updateError) throw updateError;

      setCurrentGame({ ...game, participants: updatedParticipants, game_state: updatedGameState });
      setupGameChannel(gameId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join game');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const leaveGame = () => {
    if (gameChannel) {
      supabase.removeChannel(gameChannel);
      setGameChannel(null);
    }
    setCurrentGame(null);
    setError(null);
  };

  const setupGameChannel = (gameId: string) => {
    const channel = supabase
      .channel(`game:${gameId}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
        (payload) => {
          setCurrentGame(payload.new as Game);
        }
      )
      .subscribe();

    setGameChannel(channel);
  };

  const updateGameState = async (gameState: GameState) => {
    if (!currentGame) return;

    const { error } = await supabase
      .from('games')
      .update({ game_state: gameState })
      .eq('id', currentGame.id);

    if (error) {
      setError(error.message);
    }
  };

  const findWord = async (word: string, positions: { row: number; col: number }[]) => {
    if (!currentGame || !user) return;

    const updatedGameState = {
      ...currentGame.game_state,
      foundWords: {
        ...currentGame.game_state.foundWords,
        [word]: {
          foundBy: user.id,
          positions,
          color: profile?.highlight_color || '#8B5CF6',
        },
      },
    };

    await updateGameState(updatedGameState);
  };

  const value = {
    currentGame,
    gameChannel,
    loading,
    error,
    createGame,
    joinGame,
    leaveGame,
    updateGameState,
    findWord,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

// Helper functions
function generateWordList(category: string): string[] {
  const wordLists = {
    animals: ['CAT', 'DOG', 'BIRD', 'FISH', 'LION', 'BEAR', 'WOLF', 'DEER'],
    colors: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'ORANGE', 'PURPLE', 'PINK', 'BROWN'],
    sports: ['SOCCER', 'TENNIS', 'GOLF', 'SWIM', 'RUN', 'JUMP', 'BIKE', 'SURF'],
    food: ['PIZZA', 'BURGER', 'SALAD', 'SOUP', 'CAKE', 'BREAD', 'RICE', 'PASTA'],
  };

  return wordLists[category as keyof typeof wordLists] || wordLists.animals;
}

function generateGrid(width: number, height: number, words: string[]): string[][] {
  const grid: string[][] = Array(height).fill(null).map(() => Array(width).fill(''));
  
  // Fill with random letters initially
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }
  }

  // Place words in grid
  words.forEach(word => {
    const placed = placeWordInGrid(grid, word, width, height);
    if (!placed) {
      console.warn(`Could not place word: ${word}`);
    }
  });

  return grid;
}

function placeWordInGrid(grid: string[][], word: string, width: number, height: number): boolean {
  const directions = [
    { dx: 0, dy: 1 },   // horizontal
    { dx: 1, dy: 0 },   // vertical
    { dx: 1, dy: 1 },   // diagonal down-right
    { dx: 1, dy: -1 },  // diagonal up-right
  ];

  for (let attempts = 0; attempts < 100; attempts++) {
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const startRow = Math.floor(Math.random() * height);
    const startCol = Math.floor(Math.random() * width);

    if (canPlaceWord(grid, word, startRow, startCol, direction.dx, direction.dy, width, height)) {
      // Place the word
      for (let i = 0; i < word.length; i++) {
        grid[startRow + i * direction.dx][startCol + i * direction.dy] = word[i];
      }
      return true;
    }
  }

  return false;
}

function canPlaceWord(
  grid: string[][],
  word: string,
  startRow: number,
  startCol: number,
  dx: number,
  dy: number,
  width: number,
  height: number
): boolean {
  // Check if word fits in grid
  const endRow = startRow + (word.length - 1) * dx;
  const endCol = startCol + (word.length - 1) * dy;

  if (endRow < 0 || endRow >= height || endCol < 0 || endCol >= width) {
    return false;
  }

  // Check if positions are available or match existing letters
  for (let i = 0; i < word.length; i++) {
    const row = startRow + i * dx;
    const col = startCol + i * dy;
    const currentLetter = grid[row][col];
    
    if (currentLetter !== '' && currentLetter !== word[i]) {
      return false;
    }
  }

  return true;
}