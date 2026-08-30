import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const user = await ctx.db.get(userId);
    return user ?? null;
  },
});

export const update = mutation({
  args: {
    name: v.optional(v.string()),
    highlightColor: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.highlightColor !== undefined) updates.highlightColor = args.highlightColor;
    if (args.image !== undefined) updates.image = args.image;

    await ctx.db.patch(userId, updates);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const games = await ctx.db.query("games").collect();
    const userGames = games.filter((g) => g.participants.includes(userId));

    let gamesPlayed = 0;
    let gamesWon = 0;
    let totalDuration = 0;
    let completedDurations = 0;
    let tournamentCount = 0;
    let wordsFound = 0;
    let fastWins = 0;

    for (const game of userGames) {
      gamesPlayed++;
      const foundByUser = Object.values(game.gameState.foundWords).filter(
        (w) => w.foundBy === userId
      ).length;
      wordsFound += foundByUser;

      if (game.tournamentId) {
        tournamentCount++;
      }

      if (game.status === "completed") {
        gamesWon++;
        if (game.duration !== undefined) {
          totalDuration += game.duration;
          completedDurations++;
          if (game.duration < 60) {
            fastWins++;
          }
        }
      }
    }

    const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
    const avgDuration = completedDurations > 0 ? Math.round(totalDuration / completedDurations) : 0;

    return {
      gamesWon,
      gamesPlayed,
      winRate,
      avgTime: avgDuration,
      tournaments: tournamentCount,
      wordsFound,
      fastWins,
    };
  },
});

export const getUploadUrl = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateImage = action({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("Failed to get image URL");
    await ctx.runMutation(api.users.update, { image: url });
    return url;
  },
});
