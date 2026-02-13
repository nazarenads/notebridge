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
  args: { parentId: v.optional(v.id("folders")) },
  handler: async (ctx, { parentId }) => {
    const userId = await getUserId(ctx);
    const allFolders = await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    if (parentId) {
      return allFolders.filter((f) => f.parentId === parentId);
    }
    // Return root-level folders (no parent)
    return allFolders.filter((f) => f.parentId === undefined);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    icon: v.optional(v.string()),
    parentId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    return ctx.db.insert("folders", { ...args, userId });
  },
});

export const update = mutation({
  args: {
    id: v.id("folders"),
    name: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const userId = await getUserId(ctx);
    const folder = await ctx.db.get(id);
    if (!folder || folder.userId !== userId) {
      throw new Error("Folder not found");
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
  args: { id: v.id("folders") },
  handler: async (ctx, { id }) => {
    const userId = await getUserId(ctx);
    const folder = await ctx.db.get(id);
    if (!folder || folder.userId !== userId) {
      throw new Error("Folder not found");
    }
    await ctx.db.delete(id);
  },
});
