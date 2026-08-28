import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = ctx.userId;
    if (!userId) return null;
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
    const userId = ctx.userId;
    if (!userId) throw new Error("Not authenticated");

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.highlightColor !== undefined) updates.highlightColor = args.highlightColor;
    if (args.image !== undefined) updates.image = args.image;

    await ctx.db.patch(userId, updates);
  },
});
