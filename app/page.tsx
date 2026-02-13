"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { SignIn, UserButton } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import FolderTree from "@/components/sidebar/FolderTree";
import NoteList from "@/components/sidebar/NoteList";
import Editor from "@/components/editor/Editor";
import ChatPanel from "@/components/ai/ChatPanel";

export default function Home() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="text-sm text-zinc-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 bg-zinc-950">
        <h1 className="text-2xl font-bold text-zinc-100">NoteBridge</h1>
        <p className="text-sm text-zinc-400">
          AI-powered note-taking for software engineers
        </p>
        <SignIn routing="hash" />
      </div>
    );
  }

  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  const [selectedNoteId, setSelectedNoteId] = useState<Id<"notes"> | null>(
    null
  );
  const [selectedFolderId, setSelectedFolderId] =
    useState<Id<"folders"> | null>(null);
  const [aiPanelOpen, setAiPanelOpen] = useState(true);

  const note = useQuery(
    api.notes.get,
    selectedNoteId ? { id: selectedNoteId } : "skip"
  );

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="flex w-60 flex-shrink-0 flex-col border-r border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <h1 className="text-sm font-bold tracking-wide text-zinc-200">
            NoteBridge
          </h1>
          <UserButton />
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <FolderTree
            selectedFolderId={selectedFolderId}
            onSelectFolder={setSelectedFolderId}
          />
          <div className="my-2 border-t border-zinc-800" />
          <NoteList
            selectedNoteId={selectedNoteId}
            selectedFolderId={selectedFolderId}
            onSelectNote={setSelectedNoteId}
          />
        </div>
      </aside>

      {/* Editor */}
      <main className="flex-1 overflow-hidden bg-zinc-950">
        <div className="flex h-full flex-col">
          {/* Toolbar area */}
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
            <div className="text-xs text-zinc-500">
              {note ? note.title : "No note selected"}
            </div>
            <button
              onClick={() => setAiPanelOpen(!aiPanelOpen)}
              className="rounded px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              title="Toggle AI panel (⌘+J)"
            >
              {aiPanelOpen ? "Hide AI" : "Show AI"}
            </button>
          </div>
          {/* Editor content */}
          <div className="flex-1 overflow-hidden">
            <Editor
              noteId={selectedNoteId}
              initialContent={note?.content ?? ""}
              initialTitle={note?.title ?? ""}
            />
          </div>
        </div>
      </main>

      {/* AI Panel */}
      {aiPanelOpen && (
        <aside className="w-80 flex-shrink-0 border-l border-zinc-800 bg-zinc-900">
          <ChatPanel noteId={selectedNoteId} />
        </aside>
      )}
    </div>
  );
}
