import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { parentId: v.optional(v.id("folders")) },
  handler: async (ctx, { parentId }) => {
    if (parentId) {
      return ctx.db
        .query("folders")
        .withIndex("by_parent", (q) => q.eq("parentId", parentId))
        .collect();
    }
    // Return root-level folders (no parent)
    return ctx.db
      .query("folders")
      .withIndex("by_parent", (q) => q.eq("parentId", undefined))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    icon: v.optional(v.string()),
    parentId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("folders", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("folders"),
    name: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(id, updates);
    }
  },
});

export const remove = mutation({
  args: { id: v.id("folders") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
