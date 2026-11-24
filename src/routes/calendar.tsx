import { useMemo, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Empty, Page, fieldClass, primaryBtn } from "@/components/bib/ui";
import { dayKey, formatDay, monthCells, monthLabel } from "@/lib/bib/schedule";
import { useBib } from "@/lib/bib/store";
import { useHydrated } from "@/lib/bib/use-hydrated";

export const Route = createFileRoute("/calendar")({ component: CalendarPage });

const WEEK = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

function CalendarPage() {
  const hydrated = useHydrated();
  const tasks = useBib((s) => s.tasks);
  const reminders = useBib((s) => s.reminders);
  const addTask = useBib((s) => s.addTask);
  const addReminder = useBib((s) => s.addReminder);
  const toggleTask = useBib((s) => s.toggleTask);
  const toggleReminder = useBib((s) => s.toggleReminder);
  const today = dayKey();
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState(today);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [kind, setKind] = useState<"task" | "reminder">("task");
  const [notice, setNotice] = useState("");

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const cells = useMemo(() => monthCells(year, month), [year, month]);

  const marked = new Set(
    [...tasks, ...reminders].filter((item) => item.due && !item.done).map((item) => item.due),
  );

  const onDay = [
    ...tasks
      .filter((item) => item.due === selected)
      .map((item) => ({ ...item, kind: "task" as const })),
    ...reminders
      .filter((item) => item.due === selected)
      .map((item) => ({ ...item, kind: "reminder" as const })),
  ].sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));

  function save(e: FormEvent) {
    e.preventDefault();
    const value = title.trim();
    if (!value) return;
    if (kind === "task") addTask(value, selected, time);
    else addReminder(value, time ? `${formatDay(selected)}, ${time}` : formatDay(selected), selected, time);
    setTitle("");
    setTime("");
  }

  async function allowNotes() {
    if (typeof Notification === "undefined") {
      setNotice("Этот браузер не показывает уведомления.");
      return;
    }
    const result = await Notification.requestPermission();
    setNotice(
      result === "granted"
        ? "Хорошо. Напомню, пока приложение открыто."
        : "Без разрешения останется список на сегодня, без сигнала.",
    );
  }

  return (
    <Page title="Календарь" lede="Дела на день. Если указано время — Бибинтосик напомнит, пока приложение открыто.">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Предыдущий месяц"
          className="inline-flex size-11 items-center justify-center rounded-full text-ink"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <p className="font-display text-2xl font-semibold">{monthLabel(year, month)}</p>
        <button
          type="button"
          aria-label="Следующий месяц"
          className="inline-flex size-11 items-center justify-center rounded-full text-ink"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold tracking-wide text-muted uppercase">
        {WEEK.map((name) => (
          <span key={name}>{name}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((cell, index) =>
          cell ? (
            <button
              key={cell.key}
              type="button"
              onClick={() => setSelected(cell.key)}
              className={
                cell.key === selected
                  ? "relative inline-flex min-h-11 items-center justify-center rounded-full bg-caramel font-semibold text-card"
                  : cell.key === today
                    ? "relative inline-flex min-h-11 items-center justify-center rounded-full bg-blush font-semibold text-ink"
                    : "relative inline-flex min-h-11 items-center justify-center rounded-full text-ink"
              }
            >
              {cell.day}
              {marked.has(cell.key) ? (
                <span className="absolute bottom-1 size-1 rounded-full bg-soft" aria-hidden="true" />
              ) : null}
            </button>
          ) : (
            <span key={`empty-${index}`} />
          ),
        )}
      </div>

      <h2 className="mt-6 font-display text-2xl font-semibold">{formatDay(selected)}</h2>
      {!hydrated ? null : onDay.length === 0 ? (
        <Empty>На этот день пусто.</Empty>
      ) : (
        <ul className="mt-3 space-y-2">
          {onDay.map((item) => (
            <li key={`${item.kind}-${item.id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-card px-4 py-3">
              <div>
                <p className={item.done ? "text-muted line-through" : "font-semibold text-ink"}>{item.title}</p>
                <p className="text-sm text-muted">
                  {item.kind === "task" ? "Задача" : "Напоминание"}
                  {item.time ? ` · ${item.time}` : ""}
                </p>
              </div>
              <button
                type="button"
                className="min-h-11 shrink-0 text-sm font-semibold text-caramel"
                onClick={() => (item.kind === "task" ? toggleTask(item.id) : toggleReminder(item.id))}
              >
                {item.done ? "Вернуть" : "Готово"}
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={save} className="mt-4 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Дело на этот день"
          className={fieldClass}
          aria-label="Дело на этот день"
        />
        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm text-muted">
            Время
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={fieldClass} />
          </label>
          <label className="text-sm text-muted">
            Это
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value === "reminder" ? "reminder" : "task")}
              className={fieldClass}
            >
              <option value="task">Задача</option>
              <option value="reminder">Напоминание</option>
            </select>
          </label>
        </div>
        <button type="submit" className={primaryBtn} disabled={!title.trim()}>
          Поставить на день
        </button>
      </form>

      <button type="button" className="mt-4 min-h-11 text-sm font-semibold text-caramel" onClick={() => void allowNotes()}>
        Разрешить уведомления
      </button>
      {notice ? <p className="text-sm text-muted">{notice}</p> : null}
    </Page>
  );
}
