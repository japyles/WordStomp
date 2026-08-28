import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const foundWordValidator = v.object({
  foundBy: v.id("users"),
  positions: v.array(
    v.object({
      row: v.number(),
      col: v.number(),
    })
  ),
  color: v.string(),
});

const gameStateValidator = v.object({
  grid: v.array(v.array(v.string())),
  foundWords: v.record(v.string(), foundWordValidator),
  playerColors: v.record(v.string(), v.string()),
});

const gameStatusValidator = v.union(
  v.literal("waiting"),
  v.literal("active"),
  v.literal("completed")
);

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    highlightColor: v.optional(v.string()),
  }).index("email", ["email"]),
  games: defineTable({
    wordList: v.array(v.string()),
    gridSize: v.string(),
    category: v.string(),
    participants: v.array(v.id("users")),
    gameState: gameStateValidator,
    status: gameStatusValidator,
    tournamentId: v.optional(v.string()),
  }),
});
