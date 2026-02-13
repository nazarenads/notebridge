"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useRef, useEffect } from "react";

interface NoteListProps {
  selectedNoteId: Id<"notes"> | null;
  selectedFolderId: Id<"folders"> | null;
  onSelectNote: (id: Id<"notes"> | null) => void;
}

export default function NoteList({
  selectedNoteId,
  selectedFolderId,
  onSelectNote,
}: NoteListProps) {
  const notes = useQuery(api.notes.list, {
    folderId: selectedFolderId ?? undefined,
  });
  const createNote = useMutation(api.notes.create);
  const updateNote = useMutation(api.notes.update);
  const removeNote = useMutation(api.notes.remove);

  const [renamingId, setRenamingId] = useState<Id<"notes"> | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [contextMenuId, setContextMenuId] = useState<Id<"notes"> | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const handleCreate = async () => {
    const id = await createNote({
      title: "Untitled",
      folderId: selectedFolderId ?? undefined,
    });
    onSelectNote(id);
  };

  const handleContextMenu = (e: React.MouseEvent, id: Id<"notes">) => {
    e.preventDefault();
    setContextMenuId(id);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const handleRenameStart = (id: Id<"notes">, currentTitle: string) => {
    setRenamingId(id);
    setRenameValue(currentTitle);
    setContextMenuId(null);
  };

  const handleRenameSubmit = async () => {
    if (renamingId && renameValue.trim()) {
      await updateNote({ id: renamingId, title: renameValue.trim() });
    }
    setRenamingId(null);
  };

  const handleDelete = async (id: Id<"notes">) => {
    setContextMenuId(null);
    await removeNote({ id });
    if (selectedNoteId === id) {
      onSelectNote(null);
    }
  };

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenuId) return;
    const handleClick = (e: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target as Node)
      ) {
        setContextMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [contextMenuId]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Notes
        </span>
        <button
          onClick={handleCreate}
          className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          title="New note (⌘+N)"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="8" y1="3" x2="8" y2="13" />
            <line x1="3" y1="8" x2="13" y2="8" />
          </svg>
        </button>
      </div>
      <div className="flex flex-col gap-0.5 px-1">
        {notes?.map((note) => (
          <div
            key={note._id}
            onContextMenu={(e) => handleContextMenu(e, note._id)}
          >
            {renamingId === note._id ? (
              <div className="px-3 py-1.5">
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRenameSubmit();
                    if (e.key === "Escape") setRenamingId(null);
                  }}
                  onBlur={handleRenameSubmit}
                  className="w-full rounded bg-zinc-800 px-2 py-1 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                />
              </div>
            ) : (
              <button
                onClick={() => onSelectNote(note._id)}
                onDoubleClick={() =>
                  handleRenameStart(note._id, note.title)
                }
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  selectedNoteId === note._id
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300"
                }`}
              >
                <div className="truncate font-medium">
                  {note.title || "Untitled"}
                </div>
                <div className="mt-0.5 truncate text-xs text-zinc-600">
                  {note.plainText?.slice(0, 60) || "No content"}
                </div>
              </button>
            )}
          </div>
        ))}
        {notes?.length === 0 && (
          <p className="px-3 py-4 text-center text-xs text-zinc-600">
            No notes yet
          </p>
        )}
      </div>

      {/* Context menu */}
      {contextMenuId && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 min-w-[140px] rounded-md border border-zinc-700 bg-zinc-800 py-1 shadow-lg"
          style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
        >
          <button
            onClick={() => {
              const note = notes?.find((n) => n._id === contextMenuId);
              if (note) handleRenameStart(note._id, note.title);
            }}
            className="w-full px-3 py-1.5 text-left text-sm text-zinc-300 hover:bg-zinc-700"
          >
            Rename
          </button>
          <button
            onClick={() => handleDelete(contextMenuId)}
            className="w-full px-3 py-1.5 text-left text-sm text-red-400 hover:bg-zinc-700"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
