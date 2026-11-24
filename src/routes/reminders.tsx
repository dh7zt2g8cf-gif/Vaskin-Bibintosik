import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Empty, LoadingLine, Page, fieldClass, primaryBtn } from "@/components/bib/ui";
import { formatDay } from "@/lib/bib/schedule";
import { useBib } from "@/lib/bib/store";
import { useHydrated } from "@/lib/bib/use-hydrated";

export const Route = createFileRoute("/reminders")({ component: RemindersPage });

function RemindersPage() {
  const hydrated = useHydrated();
  const reminders = useBib((s) => s.reminders);
  const addReminder = useBib((s) => s.addReminder);
  const toggleReminder = useBib((s) => s.toggleReminder);
  const deleteReminder = useBib((s) => s.deleteReminder);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [time, setTime] = useState("");
  const [showDone, setShowDone] = useState(false);

  const open = reminders.filter((r) => !r.done);
  const done = reminders.filter((r) => r.done);

  function save(e: FormEvent) {
    e.preventDefault();
    const value = title.trim();
    if (!value) return;
    addReminder(value, "", due, time);
    setTitle("");
    setDue("");
    setTime("");
  }

  return (
    <Page title="Напоминания" lede="Не будильник — записка, чтобы не забыть.">
      <form onSubmit={save} className="space-y-3">
        <label className="sr-only" htmlFor="title">
          О чём напомнить
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="О чём напомнить?"
          className={fieldClass}
        />
        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm text-muted">
            День
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={fieldClass} />
          </label>
          <label className="text-sm text-muted">
            Время
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={fieldClass} />
          </label>
        </div>
        <button type="submit" className={primaryBtn} disabled={!hydrated || !title.trim()}>
          Добавить
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {!hydrated ? <LoadingLine /> : null}
        {hydrated && open.length === 0 ? <Empty>Напоминаний пока нет.</Empty> : null}
        {hydrated
          ? open.map((item) => (
              <article key={item.id} className="rounded-2xl border border-line bg-card p-4 shadow-sm">
                <h2 className="font-semibold text-ink">{item.title}</h2>
                {item.due ? (
                  <p className="mt-1 text-sm text-muted">
                    {formatDay(item.due)}
                    {item.time ? ` · ${item.time}` : ""}
                  </p>
                ) : null}
                {item.remindAt ? <p className="mt-1 text-sm text-muted">{item.remindAt}</p> : null}
                <div className="mt-3 flex gap-4">
                  <button
                    type="button"
                    className="min-h-11 text-sm font-semibold text-caramel"
                    onClick={() => toggleReminder(item.id)}
                  >
                    Выполнено
                  </button>
                  <button
                    type="button"
                    className="min-h-11 text-sm text-muted"
                    onClick={() => deleteReminder(item.id)}
                  >
                    Удалить
                  </button>
                </div>
              </article>
            ))
          : null}
      </div>

      {hydrated && done.length > 0 ? (
        <div className="mt-8">
          <button
            type="button"
            className="min-h-11 text-sm font-semibold text-muted"
            onClick={() => setShowDone((v) => !v)}
          >
            {showDone ? "Скрыть сделанное" : `Сделано · ${done.length}`}
          </button>
          {showDone ? (
            <ul className="mt-3 space-y-2">
              {done.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-blush px-4 py-3"
                >
                  <span className="text-muted line-through">{item.title}</span>
                  <button
                    type="button"
                    className="min-h-11 shrink-0 text-sm font-semibold text-caramel"
                    onClick={() => toggleReminder(item.id)}
                  >
                    Вернуть
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </Page>
  );
}
