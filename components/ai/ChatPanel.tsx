"use client";

import { Id } from "@/convex/_generated/dataModel";

interface ChatPanelProps {
  noteId: Id<"notes"> | null;
}

export default function ChatPanel({ noteId }: ChatPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-300">AI Assistant</h2>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        {noteId ? (
          <div className="space-y-2">
            <div className="text-2xl">✦</div>
            <p className="text-sm text-zinc-400">
              Select text in the editor to use AI features, or ask a question
              about your note.
            </p>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            Open a note to start chatting with AI
          </p>
        )}
      </div>

      <div className="border-t border-zinc-800 p-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={
              noteId ? "Ask about this note..." : "Open a note first"
            }
            disabled={!noteId}
            className="flex-1 rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
          />
          <button
            disabled={!noteId}
            className="rounded-lg bg-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
