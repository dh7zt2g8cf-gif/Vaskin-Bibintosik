import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Empty, LoadingLine, Page, fieldClass, primaryBtn, quietBtn } from "@/components/bib/ui";
import { formatWhen } from "@/lib/bib/format";
import { useBib } from "@/lib/bib/store";
import { useHydrated } from "@/lib/bib/use-hydrated";

export const Route = createFileRoute("/notes")({ component: NotesPage });

function NotesPage() {
  const hydrated = useHydrated();
  const notes = useBib((s) => s.notes);
  const addNote = useBib((s) => s.addNote);
  const updateNote = useBib((s) => s.updateNote);
  const deleteNote = useBib((s) => s.deleteNote);
  const [content, setContent] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  function save(e: FormEvent) {
    e.preventDefault();
    const value = content.trim();
    if (!value) return;
    addNote(value);
    setContent("");
  }

  return (
    <Page title="Заметки" lede="Короткие вещи, которые не хочется держать в голове.">
      <form onSubmit={save} className="space-y-3">
        <label className="sr-only" htmlFor="note">
          Текст заметки
        </label>
        <textarea
          id="note"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Что записать?"
          rows={4}
          className={fieldClass}
        />
        <button type="submit" className={primaryBtn} disabled={!hydrated || !content.trim()}>
          Сохранить
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {!hydrated ? <LoadingLine /> : null}
        {hydrated && notes.length === 0 ? <Empty>Пока заметок нет.</Empty> : null}
        {hydrated
          ? notes.map((note) => (
              <article key={note.id} className="rounded-2xl border border-line bg-card p-4 shadow-sm">
                {editing === note.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const value = draft.trim();
                      if (!value) return;
                      updateNote(note.id, value);
                      setEditing(null);
                    }}
                    className="space-y-3"
                  >
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      rows={4}
                      className={fieldClass}
                    />
                    <div className="flex gap-2">
                      <button type="submit" className={primaryBtn}>
                        Готово
                      </button>
                      <button type="button" className={quietBtn} onClick={() => setEditing(null)}>
                        Отмена
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap text-ink">{note.content}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <time className="text-xs text-muted" dateTime={new Date(note.createdAt).toISOString()}>
                        {formatWhen(note.createdAt)}
                      </time>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          className="min-h-11 text-sm font-semibold text-caramel"
                          onClick={() => {
                            setEditing(note.id);
                            setDraft(note.content);
                          }}
                        >
                          Править
                        </button>
                        <button
                          type="button"
                          className="min-h-11 text-sm text-muted"
                          onClick={() => deleteNote(note.id)}
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </article>
            ))
          : null}
      </div>
    </Page>
  );
}
