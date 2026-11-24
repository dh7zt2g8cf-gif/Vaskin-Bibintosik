import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { Empty, LoadingLine, Page, fieldClass, primaryBtn } from "@/components/bib/ui";
import { formatDay } from "@/lib/bib/schedule";
import { useBib } from "@/lib/bib/store";
import { useHydrated } from "@/lib/bib/use-hydrated";

export const Route = createFileRoute("/tasks")({ component: TasksPage });

function TasksPage() {
  const hydrated = useHydrated();
  const tasks = useBib((s) => s.tasks);
  const addTask = useBib((s) => s.addTask);
  const toggleTask = useBib((s) => s.toggleTask);
  const deleteTask = useBib((s) => s.deleteTask);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [time, setTime] = useState("");

  const ordered = [...tasks].sort((a, b) => Number(a.done) - Number(b.done));

  function save(e: FormEvent) {
    e.preventDefault();
    const value = title.trim();
    if (!value) return;
    addTask(value, due, time);
    setTitle("");
    setDue("");
    setTime("");
  }

  return (
    <Page title="Задачи" lede="Короткий список. Отметил — и можно выдохнуть.">
      <form onSubmit={save} className="space-y-3">
        <label className="sr-only" htmlFor="task">
          Новая задача
        </label>
        <input
          id="task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Новая задача…"
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

      <ul className="mt-6 space-y-2">
        {!hydrated ? <LoadingLine /> : null}
        {hydrated && tasks.length === 0 ? <Empty>Задач пока нет.</Empty> : null}
        {hydrated
          ? ordered.map((task) => (
              <li
                key={task.id}
                className="flex items-center gap-3 rounded-2xl border border-line bg-card px-3 py-2 shadow-sm"
              >
                <button
                  type="button"
                  aria-label={task.done ? "Вернуть в дела" : "Отметить сделанным"}
                  onClick={() => toggleTask(task.id)}
                  className={
                    task.done
                      ? "inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-caramel text-card"
                      : "inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-soft text-transparent"
                  }
                >
                  <Check className="size-5" aria-hidden="true" />
                </button>
                <span className={task.done ? "min-w-0 flex-1 text-muted line-through" : "min-w-0 flex-1 text-ink"}>
                  <span className="block">{task.title}</span>
                  {task.due ? (
                    <span className="block text-sm text-muted no-underline">
                      {formatDay(task.due)}
                      {task.time ? ` · ${task.time}` : ""}
                    </span>
                  ) : null}
                </span>
                <button
                  type="button"
                  aria-label="Удалить задачу"
                  onClick={() => deleteTask(task.id)}
                  className="inline-flex size-11 items-center justify-center text-muted"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </li>
            ))
          : null}
      </ul>
    </Page>
  );
}
