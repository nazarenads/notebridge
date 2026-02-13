import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  notes: defineTable({
    title: v.string(),
    content: v.string(), // JSON string (TipTap document)
    plainText: v.string(), // searchable plain text
    folderId: v.optional(v.id("folders")),
    tagIds: v.array(v.id("tags")),
    isPinned: v.boolean(),
  })
    .index("by_folder", ["folderId"])
    .searchIndex("search_notes", {
      searchField: "plainText",
      filterFields: ["folderId"],
    }),

  folders: defineTable({
    name: v.string(),
    icon: v.optional(v.string()), // emoji
    parentId: v.optional(v.id("folders")),
  }).index("by_parent", ["parentId"]),

  tags: defineTable({
    name: v.string(),
    color: v.optional(v.string()),
  }).index("by_name", ["name"]),

  chatMessages: defineTable({
    noteId: v.id("notes"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  }).index("by_note", ["noteId"]),

  aiActions: defineTable({
    noteId: v.id("notes"),
    type: v.union(
      v.literal("rephrase"),
      v.literal("research"),
      v.literal("questions"),
      v.literal("diagram")
    ),
    inputText: v.string(),
    outputText: v.string(),
    accepted: v.boolean(),
  }).index("by_note", ["noteId"]),
});
