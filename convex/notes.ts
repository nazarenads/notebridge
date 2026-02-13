import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { folderId: v.optional(v.id("folders")) },
  handler: async (ctx, { folderId }) => {
    if (folderId) {
      return ctx.db
        .query("notes")
        .withIndex("by_folder", (q) => q.eq("folderId", folderId))
        .order("desc")
        .collect();
    }
    return ctx.db.query("notes").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("notes") },
  handler: async (ctx, { id }) => {
    return ctx.db.get(id);
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    return ctx.db
      .query("notes")
      .withSearchIndex("search_notes", (q) => q.search("plainText", query))
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.optional(v.string()),
    folderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, { title, content, folderId }) => {
    return ctx.db.insert("notes", {
      title,
      content: content ?? "{}",
      plainText: "",
      folderId,
      tagIds: [],
      isPinned: false,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("notes"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    plainText: v.optional(v.string()),
    folderId: v.optional(v.id("folders")),
    isPinned: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...fields }) => {
    // Filter out undefined values
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
  args: { id: v.id("notes") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
