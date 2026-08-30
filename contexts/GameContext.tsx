import React, { createContext, useContext, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Game, GameState } from '@/types/database';
import { useAuth } from './AuthContext';
import {
  getPuzzlesByCategoryAndSize,
  GridSize,
  Category,
} from '@/lib/wordSearchPuzzles';

interface GameContextType {
  currentGame: Game | null;
  loading: boolean;
  error: string | null;
  createGame: (category: Category, gridSize: GridSize) => Promise<string | null>;
  joinGame: (gameId: string) => Promise<boolean>;
  loadGame: (gameId: string) => void;
  leaveGame: () => void;
  updateGameState: (gameState: GameState) => Promise<void>;
  findWord: (word: string, positions: { row: number; col: number }[]) => Promise<void>;
  saveGame: () => Promise<boolean>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const [currentGameId, setCurrentGameId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gameQueryArgs = currentGameId ? { gameId: currentGameId as any } : "skip";
  const gameResult = useQuery(api.games.get, gameQueryArgs);
  const currentGame = (gameResult ?? null) as Game | null;

  const createGameMutation = useMutation(api.games.create);
  const joinGameMutation = useMutation(api.games.join);
  const updateStateMutation = useMutation(api.games.updateState);
  const claimWordMutation = useMutation(api.games.claimWord);
  const saveGameMutation = useMutation(api.games.save);

  const createGame = async (category: Category, gridSize: GridSize) => {
    if (!user) return null;

    setLoading(true);
    setError(null);

    try {
      const puzzles = getPuzzlesByCategoryAndSize(category, gridSize);
      const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];

      const gameState: GameState = {
        grid: puzzle.grid,
        foundWords: {},
        playerColors: {
          [user.id]: profile?.highlightColor || '#8B5CF6',
        },
      };

      const gameId = await createGameMutation({
        wordList: puzzle.words,
        gridSize,
        category,
        gameState,
        participants: [user.id as any],
      });

      setCurrentGameId(gameId);
      return gameId;
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
      await joinGameMutation({
        gameId: gameId as any,
        color: profile?.highlightColor || '#8B5CF6',
      });

      setCurrentGameId(gameId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join game');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loadGame = (gameId: string) => {
    setCurrentGameId(gameId);
    setError(null);
  };

  const leaveGame = () => {
    setCurrentGameId(undefined);
    setError(null);
  };

  const updateGameState = async (gameState: GameState) => {
    if (!currentGameId) return;

    try {
      await updateStateMutation({ gameId: currentGameId as any, gameState });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update game');
    }
  };

  const findWord = async (word: string, positions: { row: number; col: number }[]) => {
    if (!currentGameId || !user) return;

    try {
      await claimWordMutation({
        gameId: currentGameId as any,
        word,
        positions,
        color: profile?.highlightColor || '#8B5CF6',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim word');
    }
  };

  const saveGame = async (): Promise<boolean> => {
    if (!currentGameId || !user) return false;

    setLoading(true);
    setError(null);

    try {
      await saveGameMutation({ gameId: currentGameId as any });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save game');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentGame,
    loading,
    error,
    createGame,
    joinGame,
    loadGame,
    leaveGame,
    updateGameState,
    findWord,
    saveGame,
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

export const getGridDimensions = (gridSize: GridSize): { width: number; height: number } => {
  const [width, height] = gridSize.split('x').map(Number);
  return { width, height };
};
