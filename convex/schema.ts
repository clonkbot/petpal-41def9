import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  pets: defineTable({
    userId: v.id("users"),
    name: v.string(),
    species: v.string(), // "cat", "dog", "bunny", "blob"
    mood: v.string(), // "happy", "hungry", "sleepy", "playful", "sad"
    hunger: v.number(), // 0-100
    happiness: v.number(), // 0-100
    energy: v.number(), // 0-100
    level: v.number(),
    experience: v.number(),
    createdAt: v.number(),
    lastInteraction: v.number(),
  }).index("by_user", ["userId"]),

  interactions: defineTable({
    petId: v.id("pets"),
    userId: v.id("users"),
    type: v.string(), // "feed", "play", "chat", "pet"
    message: v.optional(v.string()),
    response: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_pet", ["petId"]).index("by_user", ["userId"]),

  chatMessages: defineTable({
    petId: v.id("pets"),
    userId: v.id("users"),
    role: v.string(), // "user" or "pet"
    content: v.string(),
    createdAt: v.number(),
  }).index("by_pet", ["petId"]),
});
