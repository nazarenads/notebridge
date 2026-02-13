import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

async function getUserId(ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity.subject;
}

export const list = query({
  args: { folderId: v.optional(v.id("folders")) },
  handler: async (ctx, { folderId }) => {
    const userId = await getUserId(ctx);
    const allNotes = await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    if (folderId) {
      return allNotes.filter((n) => n.folderId === folderId);
    }
    return allNotes;
  },
});

export const get = query({
  args: { id: v.id("notes") },
  handler: async (ctx, { id }) => {
    const userId = await getUserId(ctx);
    const note = await ctx.db.get(id);
    if (!note || note.userId !== userId) {
      return null;
    }
    return note;
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    const userId = await getUserId(ctx);
    return ctx.db
      .query("notes")
      .withSearchIndex("search_notes", (q) =>
        q.search("plainText", query).eq("userId", userId)
      )
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
    const userId = await getUserId(ctx);
    return ctx.db.insert("notes", {
      title,
      content: content ?? "{}",
      plainText: "",
      folderId,
      tagIds: [],
      isPinned: false,
      userId,
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
    const userId = await getUserId(ctx);
    const note = await ctx.db.get(id);
    if (!note || note.userId !== userId) {
      throw new Error("Note not found");
    }
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
    const userId = await getUserId(ctx);
    const note = await ctx.db.get(id);
    if (!note || note.userId !== userId) {
      throw new Error("Note not found");
    }
    await ctx.db.delete(id);
  },
});
