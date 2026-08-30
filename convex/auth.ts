import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { ConvexError } from "convex/values";
import { DataModel } from "./_generated/dataModel";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password<DataModel>({
      profile: async (params, ctx) => {
        const email = (params.email as string | undefined)?.toLowerCase().trim() ?? "";
        const name = (params.name as string | undefined)?.trim();

        if (params.flow === "signUp") {
          const existing = await ctx.db
            .query("users")
            .withIndex("email", (q) => q.eq("email", email))
            .unique();
          if (existing) {
            throw new ConvexError("An account with this email already exists.");
          }
        }

        return {
          email,
          name,
        };
      },
    }),
  ],
});
