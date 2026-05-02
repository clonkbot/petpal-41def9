import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMessages = query({
  args: { petId: v.id("pets") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("chatMessages")
      .withIndex("by_pet", (q) => q.eq("petId", args.petId))
      .order("asc")
      .take(50);
  },
});

export const addUserMessage = mutation({
  args: {
    petId: v.id("pets"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("chatMessages", {
      petId: args.petId,
      userId,
      role: "user",
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

export const addPetMessage = mutation({
  args: {
    petId: v.id("pets"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Also add interaction and boost happiness
    const pet = await ctx.db.get(args.petId);
    if (pet) {
      const newHappiness = Math.min(100, pet.happiness + 5);
      const newExperience = pet.experience + 2;
      await ctx.db.patch(args.petId, {
        happiness: newHappiness,
        experience: newExperience,
        lastInteraction: Date.now(),
      });
    }

    await ctx.db.insert("interactions", {
      petId: args.petId,
      userId,
      type: "chat",
      message: args.content,
      createdAt: Date.now(),
    });

    return await ctx.db.insert("chatMessages", {
      petId: args.petId,
      userId,
      role: "pet",
      content: args.content,
      createdAt: Date.now(),
    });
  },
});
