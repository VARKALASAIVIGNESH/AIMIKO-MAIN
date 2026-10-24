import { useEffect, useState } from "react";
import { FileText, Plus, Trash2, Pencil, X, Save, CloudCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAimiko, Note } from "@/context/AimikoContext";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";

export default function Notes() {
  const navigate = useNavigate();
  const { notes: localNotes, addNote, updateNote, deleteNote } = useAimiko();
  const [liveNotes, setLiveNotes] = useState<Array<{ id: number | string; title: string; content: string; folder?: string; tags_json?: string[]; updated_at?: string }>>([]);
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [isSynced, setIsSynced] = useState(false);

  // Fetch live notes from backend on mount
  useEffect(() => {
    const token = localStorage.getItem("aimiko_token");
    if (token) {
      api.buddy.getNotes().then((data) => {
        if (data && Array.isArray(data)) {
          setLiveNotes(data);
          setIsSynced(true);
        }
      }).catch(() => {
        // Fallback to local context notes
        setLiveNotes(localNotes.map((n) => ({ id: n.id, title: n.title, content: n.content, updated_at: n.updatedAt })));
      });
    } else {
      setLiveNotes(localNotes.map((n) => ({ id: n.id, title: n.title, content: n.content, updated_at: n.updatedAt })));
    }
  }, [localNotes]);

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      setIsComposing(true);
    }
  }, [selectedNote]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    const token = localStorage.getItem("aimiko_token");

    if (token) {
      try {
        if (selectedNote && typeof selectedNote.id === "number") {
          const updated = await api.buddy.updateNote(selectedNote.id, {
            title: title.trim(),
            content: content.trim(),
          });
          setLiveNotes((prev) => prev.map((n) => (n.id === selectedNote.id ? updated : n)));
        } else {
          const created = await api.buddy.createNote({
            title: title.trim(),
            content: content.trim(),
            folder: "General",
          });
          setLiveNotes((prev) => [created, ...prev]);
        }
      } catch (err) {
        // Fallback to local state
        if (selectedNote) {
          updateNote(String(selectedNote.id), title.trim(), content.trim());
        } else {
          addNote(title.trim(), content.trim());
        }
      }
    } else {
      if (selectedNote) {
        updateNote(String(selectedNote.id), title.trim(), content.trim());
      } else {
        addNote(title.trim(), content.trim());
      }
    }

    setSelectedNote(null);
    setTitle("");
    setContent("");
    setIsComposing(false);
  };

  const handleDelete = async (noteId: number | string) => {
    const token = localStorage.getItem("aimiko_token");
    if (token && typeof noteId === "number") {
      try {
        await api.buddy.deleteNote(noteId);
        setLiveNotes((prev) => prev.filter((n) => n.id !== noteId));
      } catch {
        deleteNote(String(noteId));
      }
    } else {
      deleteNote(String(noteId));
      setLiveNotes((prev) => prev.filter((n) => n.id !== noteId));
    }
  };

  const handleCancel = () => {
    setSelectedNote(null);
    setTitle("");
    setContent("");
    setIsComposing(false);
  };

  return (
    <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-6 animate-pop-in">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notes</h1>
            <p className="text-sm text-muted-foreground mt-1">Capture ideas, save AI responses, keep organized.</p>
          </div>
          {!isComposing && (
            <Button onClick={() => setIsComposing(true)} className="rounded-xl press">
              <Plus className="mr-2 h-4 w-4" />
              New Note
            </Button>
          )}
        </div>

        {/* Compose panel */}
        {isComposing && (
          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground text-sm">
                {selectedNote ? "Edit Note" : "New Note"}
              </h2>
              <button onClick={handleCancel} className="h-7 w-7 rounded-lg bg-secondary hover:bg-muted flex items-center justify-center transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/60"
              autoFocus
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={7}
              placeholder="Write your note here..."
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none leading-relaxed custom-scrollbar placeholder:text-muted-foreground/60"
            />
            <div className="flex gap-2">
              <Button onClick={handleSave} className="rounded-xl press">
                <Save className="mr-2 h-4 w-4" />
                {selectedNote ? "Update Note" : "Save Note"}
              </Button>
              <Button onClick={handleCancel} variant="outline" className="rounded-xl press">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Notes grid */}
        {liveNotes.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {liveNotes.map((note) => (
              <div
                key={note.id}
                className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-border/90 transition-all duration-200 group space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <h3 className="font-semibold text-foreground text-sm leading-snug truncate">{note.title}</h3>
                  </div>
                  <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setSelectedNote(note)}
                      className="h-7 w-7 rounded-lg bg-secondary hover:bg-muted flex items-center justify-center transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="h-7 w-7 rounded-lg bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4 whitespace-pre-wrap">{note.content}</p>
                <p className="text-[10px] text-muted-foreground/60">
                  {note.updated_at ? new Date(note.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Today"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          !isComposing && (
            <div className="text-center py-20 space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground text-sm">No notes yet. Hit "New Note" to get started.</p>
            </div>
          )
        )}

      </div>
    </div>
  );
}
