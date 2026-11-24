import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Send, Trash2 } from "lucide-react";
import { companionReply } from "@/lib/bib/reply";
import { useBib } from "@/lib/bib/store";
import { useHydrated } from "@/lib/bib/use-hydrated";
import { fieldClass, LoadingLine } from "@/components/bib/ui";
import { BibCat } from "@/components/bib/cat";

export const Route = createFileRoute("/chat")({ component: ChatPage });

function ChatPage() {
  const hydrated = useHydrated();
  const messages = useBib((s) => s.messages);
  const family = useBib((s) => s.family);
  const addMessage = useBib((s) => s.addMessage);
  const resetChat = useBib((s) => s.resetChat);
  const [text, setText] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, hydrated]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    box.style.height = "0px";
    box.style.height = `${Math.min(box.scrollHeight, 128)}px`;
  }, [text]);

  function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = String(new FormData(e.currentTarget).get("message") ?? "").trim();
    if (!value || !hydrated) return;
    addMessage("user", value);
    const history = useBib.getState().messages;
    const reply = companionReply(
      value,
      history,
      family.map((m) => m.name),
    );
    addMessage("assistant", reply);
    setText("");
    setConfirmReset(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-lg flex-col">
      <header className="flex items-center gap-3 border-b border-line bg-paper px-4 py-3">
        <Link
          to="/"
          aria-label="Назад"
          className="inline-flex size-11 items-center justify-center rounded-full text-muted"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </Link>
        <BibCat className="h-14 w-auto" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-2xl leading-none font-semibold">Бибинтосик</h1>
          <p className="mt-1 text-sm text-muted">Рядом, можно просто писать</p>
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-sm font-semibold text-muted"
          onClick={() => setConfirmReset(true)}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Очистить
        </button>
      </header>

      {confirmReset ? (
        <div className="flex items-center justify-between gap-3 bg-blush px-4 py-3">
          <p className="text-sm text-ink">Стереть всю переписку?</p>
          <div className="flex gap-2">
            <button
              type="button"
              className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-muted"
              onClick={() => setConfirmReset(false)}
            >
              Оставить
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center rounded-full bg-caramel px-3 text-sm font-semibold text-card"
              onClick={() => {
                resetChat();
                setConfirmReset(false);
              }}
            >
              Стереть
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {!hydrated ? <LoadingLine /> : null}
        {hydrated
          ? messages.map((msg) =>
              msg.role === "assistant" ? (
                <div key={msg.id} className="flex items-end gap-2">
                  <BibCat className="mb-1 h-10 w-auto" />
                  <p className="max-w-[80%] rounded-2xl rounded-bl-md bg-blush px-4 py-3 font-display text-lg leading-snug break-words whitespace-pre-wrap text-ink">
                    {msg.content}
                  </p>
                </div>
              ) : (
                <div key={msg.id} className="flex justify-end">
                  <p className="max-w-[80%] rounded-2xl rounded-br-md bg-caramel px-4 py-3 break-words whitespace-pre-wrap text-card">
                    {msg.content}
                  </p>
                </div>
              ),
            )
          : null}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="flex items-end gap-2 border-t border-line bg-paper px-4 py-3">
        <label className="sr-only" htmlFor="message">
          Сообщение
        </label>
        <textarea
          ref={boxRef}
          id="message"
          name="message"
          value={text}
          rows={1}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Напиши Бибинтосику…"
          autoComplete="off"
          disabled={!hydrated}
          className={`${fieldClass} max-h-32 min-w-0 flex-1 resize-none`}
        />
        <button
          type="submit"
          aria-label="Отправить"
          disabled={!hydrated || !text.trim()}
          className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-caramel text-card transition-colors hover:bg-caramel-deep disabled:opacity-40"
        >
          <Send className="size-5" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
