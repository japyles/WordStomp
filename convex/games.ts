import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

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

export const myActiveGames = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const games = await ctx.db.query("games").collect();
    return games.filter(
      (g) =>
        g.participants.includes(userId) &&
        g.status !== "completed"
    );
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
    const now = Date.now() / 1000;
    return await ctx.db.insert("games", {
      wordList: args.wordList,
      gridSize: args.gridSize,
      category: args.category,
      participants: args.participants,
      gameState: args.gameState,
      status: "active",
      lastResumedAt: now,
      savedElapsed: 0,
    });
  },
});

export const join = mutation({
  args: {
    gameId: v.id("games"),
    color: v.string(),
  },
  handler: async (ctx, { gameId, color }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

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

export const resume = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get(gameId);
    if (!game) throw new Error("Game not found");
    if (game.status === "completed") return;

    const now = Date.now() / 1000;
    await ctx.db.patch(gameId, { lastResumedAt: now });
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
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

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

    const now = Date.now() / 1000;
    const lastResumedAt = game.lastResumedAt ?? game._creationTime;
    const savedElapsed = (game.savedElapsed ?? 0) + Math.max(0, now - lastResumedAt);
    await ctx.db.patch(gameId, {
      gameState: game.gameState,
      savedElapsed,
      lastResumedAt: now,
    });
  },
});

export const complete = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get(gameId);
    if (!game) throw new Error("Game not found");
    if (game.status === "completed") return;

    const now = Date.now() / 1000;
    const lastResumedAt = game.lastResumedAt ?? game._creationTime;
    const duration = (game.savedElapsed ?? 0) + Math.max(0, now - lastResumedAt);
    await ctx.db.patch(gameId, {
      status: "completed",
      completedAt: now,
      duration,
      savedElapsed: (game.savedElapsed ?? 0),
      lastResumedAt: now,
    });
  },
});
