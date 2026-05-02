import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const pet = await ctx.db
      .query("pets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return pet;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    species: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user already has a pet
    const existing = await ctx.db
      .query("pets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) throw new Error("You already have a pet!");

    return await ctx.db.insert("pets", {
      userId,
      name: args.name,
      species: args.species,
      mood: "happy",
      hunger: 50,
      happiness: 70,
      energy: 80,
      level: 1,
      experience: 0,
      createdAt: Date.now(),
      lastInteraction: Date.now(),
    });
  },
});

export const feed = mutation({
  args: { petId: v.id("pets") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const pet = await ctx.db.get(args.petId);
    if (!pet || pet.userId !== userId) throw new Error("Pet not found");

    const newHunger = Math.min(100, pet.hunger + 25);
    const newHappiness = Math.min(100, pet.happiness + 10);
    const newExperience = pet.experience + 5;
    const newLevel = Math.floor(newExperience / 100) + 1;

    await ctx.db.patch(args.petId, {
      hunger: newHunger,
      happiness: newHappiness,
      experience: newExperience,
      level: newLevel,
      mood: newHunger > 70 ? "happy" : pet.mood,
      lastInteraction: Date.now(),
    });

    await ctx.db.insert("interactions", {
      petId: args.petId,
      userId,
      type: "feed",
      createdAt: Date.now(),
    });

    return { hunger: newHunger, happiness: newHappiness };
  },
});

export const play = mutation({
  args: { petId: v.id("pets") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const pet = await ctx.db.get(args.petId);
    if (!pet || pet.userId !== userId) throw new Error("Pet not found");

    const newHappiness = Math.min(100, pet.happiness + 20);
    const newEnergy = Math.max(0, pet.energy - 15);
    const newHunger = Math.max(0, pet.hunger - 10);
    const newExperience = pet.experience + 10;
    const newLevel = Math.floor(newExperience / 100) + 1;

    await ctx.db.patch(args.petId, {
      happiness: newHappiness,
      energy: newEnergy,
      hunger: newHunger,
      experience: newExperience,
      level: newLevel,
      mood: newHappiness > 80 ? "playful" : pet.mood,
      lastInteraction: Date.now(),
    });

    await ctx.db.insert("interactions", {
      petId: args.petId,
      userId,
      type: "play",
      createdAt: Date.now(),
    });

    return { happiness: newHappiness, energy: newEnergy };
  },
});

export const pet = mutation({
  args: { petId: v.id("pets") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const pet = await ctx.db.get(args.petId);
    if (!pet || pet.userId !== userId) throw new Error("Pet not found");

    const newHappiness = Math.min(100, pet.happiness + 15);
    const newExperience = pet.experience + 3;
    const newLevel = Math.floor(newExperience / 100) + 1;

    await ctx.db.patch(args.petId, {
      happiness: newHappiness,
      experience: newExperience,
      level: newLevel,
      mood: "happy",
      lastInteraction: Date.now(),
    });

    await ctx.db.insert("interactions", {
      petId: args.petId,
      userId,
      type: "pet",
      createdAt: Date.now(),
    });

    return { happiness: newHappiness };
  },
});

export const updateMood = mutation({
  args: { petId: v.id("pets") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const pet = await ctx.db.get(args.petId);
    if (!pet || pet.userId !== userId) throw new Error("Pet not found");

    // Decay stats over time
    const timeSinceInteraction = Date.now() - pet.lastInteraction;
    const hoursPassed = timeSinceInteraction / (1000 * 60 * 60);

    if (hoursPassed > 0.5) {
      const decay = Math.min(20, Math.floor(hoursPassed * 5));
      const newHunger = Math.max(0, pet.hunger - decay);
      const newHappiness = Math.max(0, pet.happiness - decay / 2);
      const newEnergy = Math.min(100, pet.energy + decay / 2);

      let mood = pet.mood;
      if (newHunger < 30) mood = "hungry";
      else if (newHappiness < 30) mood = "sad";
      else if (newEnergy < 30) mood = "sleepy";
      else if (newHappiness > 70) mood = "happy";

      await ctx.db.patch(args.petId, {
        hunger: newHunger,
        happiness: newHappiness,
        energy: newEnergy,
        mood,
      });
    }
  },
});
