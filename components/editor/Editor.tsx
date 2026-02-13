"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCallback, useEffect, useRef, useState } from "react";

const lowlight = createLowlight(common);

interface EditorProps {
  noteId: Id<"notes"> | null;
  initialContent: string;
  initialTitle: string;
}

export default function Editor({
  noteId,
  initialContent,
  initialTitle,
}: EditorProps) {
  const updateNote = useMutation(api.notes.update);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastNoteIdRef = useRef<Id<"notes"> | null>(null);
  const [localTitle, setLocalTitle] = useState(initialTitle);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none focus:outline-none min-h-[calc(100vh-10rem)] px-8 py-4",
      },
    },
    onUpdate: ({ editor }) => {
      if (!noteId) return;
      // Debounce saves — wait 500ms after last keystroke
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        const json = JSON.stringify(editor.getJSON());
        const plainText = editor.getText();
        updateNote({ id: noteId, content: json, plainText });
      }, 500);
    },
  });

  // Load content only when switching to a different note
  useEffect(() => {
    if (!editor) return;
    if (noteId === lastNoteIdRef.current) return;
    lastNoteIdRef.current = noteId;

    setLocalTitle(initialTitle);

    if (initialContent) {
      try {
        editor.commands.setContent(JSON.parse(initialContent));
      } catch {
        editor.commands.clearContent();
      }
    } else {
      editor.commands.clearContent();
    }
  }, [noteId, initialContent, initialTitle, editor]);

  const handleTitleInput = useCallback(
    (newTitle: string) => {
      setLocalTitle(newTitle);
      if (!noteId) return;
      if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
      titleTimerRef.current = setTimeout(() => {
        updateNote({ id: noteId, title: newTitle });
      }, 500);
    },
    [noteId, updateNote]
  );

  // Flush pending saves on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    };
  }, []);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        editor?.commands.focus();
      }
    },
    [editor]
  );

  if (!noteId) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-500">
        <p>Select a note or create a new one</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <input
        type="text"
        value={localTitle}
        onChange={(e) => handleTitleInput(e.target.value)}
        onKeyDown={handleTitleKeyDown}
        placeholder="Untitled"
        className="w-full bg-transparent px-8 pt-8 pb-2 text-3xl font-bold text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
      />
      <EditorContent editor={editor} />
    </div>
  );
}
