import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const gameStateValidator = v.object({
  grid: v.array(v.array(v.string())),
  foundWords: v.record(
    v.string(),
    v.object({
      foundBy: v.id("users"),
      positions: v.array(
        v.object({
          row: v.number(),
          col: v.number(),
        })
      ),
      color: v.string(),
    })
  ),
  playerColors: v.record(v.string(), v.string()),
});

export const get = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    return await ctx.db.get(gameId);
  },
});

export const create = mutation({
  args: {
    wordList: v.array(v.string()),
    gridSize: v.string(),
    category: v.string(),
    gameState: gameStateValidator,
    participants: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("games", {
      wordList: args.wordList,
      gridSize: args.gridSize,
      category: args.category,
      participants: args.participants,
      gameState: args.gameState,
      status: "waiting",
    });
  },
});

export const join = mutation({
  args: {
    gameId: v.id("games"),
    color: v.string(),
  },
  handler: async (ctx, { gameId, color }) => {
    const userId = ctx.userId;
    if (!userId) throw new Error("Not authenticated");

    const game = await ctx.db.get(gameId);
    if (!game) throw new Error("Game not found");
    if (game.participants.includes(userId)) return;

    await ctx.db.patch(gameId, {
      participants: [...game.participants, userId],
      gameState: {
        ...game.gameState,
        playerColors: {
          ...game.gameState.playerColors,
          [userId]: color,
        },
      },
    });
  },
});

export const updateState = mutation({
  args: {
    gameId: v.id("games"),
    gameState: gameStateValidator,
  },
  handler: async (ctx, { gameId, gameState }) => {
    const game = await ctx.db.get(gameId);
    if (!game) throw new Error("Game not found");
    await ctx.db.patch(gameId, { gameState });
  },
});

export const claimWord = mutation({
  args: {
    gameId: v.id("games"),
    word: v.string(),
    positions: v.array(
      v.object({
        row: v.number(),
        col: v.number(),
      })
    ),
    color: v.string(),
  },
  handler: async (ctx, { gameId, word, positions, color }) => {
    const userId = ctx.userId;
    if (!userId) throw new Error("Not authenticated");

    const game = await ctx.db.get(gameId);
    if (!game) throw new Error("Game not found");

    await ctx.db.patch(gameId, {
      gameState: {
        ...game.gameState,
        foundWords: {
          ...game.gameState.foundWords,
          [word]: { foundBy: userId, positions, color },
        },
      },
    });
  },
});

export const save = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get(gameId);
    if (!game) throw new Error("Game not found");
    await ctx.db.patch(gameId, { gameState: game.gameState });
  },
});
