"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface NoteListProps {
  selectedNoteId: Id<"notes"> | null;
  selectedFolderId: Id<"folders"> | null;
  onSelectNote: (id: Id<"notes">) => void;
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

  const handleCreate = async () => {
    const id = await createNote({
      title: "Untitled",
      folderId: selectedFolderId ?? undefined,
    });
    onSelectNote(id);
  };

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
          <button
            key={note._id}
            onClick={() => onSelectNote(note._id)}
            className={`rounded-md px-3 py-2 text-left text-sm transition-colors ${
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
        ))}
        {notes?.length === 0 && (
          <p className="px-3 py-4 text-center text-xs text-zinc-600">
            No notes yet
          </p>
        )}
      </div>
    </div>
  );
}
