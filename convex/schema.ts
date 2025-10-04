import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  conversations: defineTable({
    title: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_created_at", ["createdAt"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    timestamp: v.number(),
  }).index("by_conversation", ["conversationId", "timestamp"]),
})
