import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const create = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const conversationId = await ctx.db.insert("conversations", {
      title: args.title,
      createdAt: now,
      updatedAt: now,
    })
    return conversationId
  },
})

export const list = query({
  args: {},
  handler: async (ctx) => {
    const conversations = await ctx.db.query("conversations").order("desc").collect()
    return conversations
  },
})

export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect()
    return messages
  },
})

export const addMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      role: args.role,
      content: args.content,
      timestamp: Date.now(),
    })

    // Update conversation's updatedAt timestamp
    await ctx.db.patch(args.conversationId, {
      updatedAt: Date.now(),
    })

    return messageId
  },
})

export const updateTitle = mutation({
  args: {
    conversationId: v.id("conversations"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      title: args.title,
      updatedAt: Date.now(),
    })
  },
})

export const deleteConversation = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    // First delete all messages in the conversation
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect()
    
    for (const message of messages) {
      await ctx.db.delete(message._id)
    }
    
    // Then delete the conversation
    await ctx.db.delete(args.conversationId)
  },
})
