"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";

interface FolderTreeProps {
  selectedFolderId: Id<"folders"> | null;
  onSelectFolder: (id: Id<"folders"> | null) => void;
}

export default function FolderTree({
  selectedFolderId,
  onSelectFolder,
}: FolderTreeProps) {
  const folders = useQuery(api.folders.list, {});
  const createFolder = useMutation(api.folders.create);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const handleCreate = async () => {
    if (!newFolderName.trim()) return;
    await createFolder({ name: newFolderName.trim() });
    setNewFolderName("");
    setIsCreating(false);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Folders
        </span>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          title="New folder"
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

      {isCreating && (
        <div className="px-3 pb-2">
          <input
            autoFocus
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") setIsCreating(false);
            }}
            onBlur={() => {
              if (newFolderName.trim()) handleCreate();
              else setIsCreating(false);
            }}
            placeholder="Folder name..."
            className="w-full rounded bg-zinc-800 px-2 py-1 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
          />
        </div>
      )}

      <div className="flex flex-col gap-0.5 px-1">
        <button
          onClick={() => onSelectFolder(null)}
          className={`rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
            selectedFolderId === null
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300"
          }`}
        >
          All Notes
        </button>
        {folders?.map((folder) => (
          <button
            key={folder._id}
            onClick={() => onSelectFolder(folder._id)}
            className={`rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
              selectedFolderId === folder._id
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300"
            }`}
          >
            {folder.icon ? `${folder.icon} ` : "📁 "}
            {folder.name}
          </button>
        ))}
      </div>
    </div>
  );
}
