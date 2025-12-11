import React, { createContext, useContext, useEffect, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Database, GameState } from '@/types/database';
import { useAuth } from './AuthContext';
import { 
  getPuzzlesByCategoryAndSize,
  GridSize,
  Category
} from '@/lib/wordSearchPuzzles';

type Game = Database['public']['Tables']['games']['Row'];

interface GameContextType {
  currentGame: Game | null;
  gameChannel: RealtimeChannel | null;
  loading: boolean;
  error: string | null;
  createGame: (category: Category, gridSize: GridSize) => Promise<string | null>;
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

  const createGame = async (category: Category, gridSize: GridSize) => {
    if (!user) return null;

    setLoading(true);
    setError(null);

    try {
      // Get a random puzzle for the selected category and grid size
      const puzzles = getPuzzlesByCategoryAndSize(category, gridSize);
      const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
      
      const gameState: GameState = {
        grid: puzzle.grid,
        foundWords: {},
        playerColors: {
          [user.id]: profile?.highlight_color || '#8B5CF6',
        },
      };

      const { data, error } = await supabase
        .from('games')
        .insert({
          word_list: puzzle.words,
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

// Helper function to convert GridSize to width and height
export const getGridDimensions = (gridSize: GridSize): { width: number; height: number } => {
  const [width, height] = gridSize.split('x').map(Number);
  return { width, height };
};
