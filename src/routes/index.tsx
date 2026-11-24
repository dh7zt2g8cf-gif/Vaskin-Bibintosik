import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  CalendarDays,
  Gamepad2,
  ListChecks,
  MessageCircle,
  NotebookPen,
  PiggyBank,
  Users,
} from "lucide-react";
import { BibCat } from "@/components/bib/cat";
import { dayKey } from "@/lib/bib/schedule";
import { useBib } from "@/lib/bib/store";
import { useHydrated } from "@/lib/bib/use-hydrated";

export const Route = createFileRoute("/")({ component: Home });

const tiles = [
  { to: "/chat" as const, label: "Поговорить", icon: MessageCircle },
  { to: "/games" as const, label: "Игры", icon: Gamepad2 },
  { to: "/calendar" as const, label: "Календарь", icon: CalendarDays },
  { to: "/reminders" as const, label: "Напоминания", icon: Bell },
  { to: "/tasks" as const, label: "Задачи", icon: ListChecks },
  { to: "/notes" as const, label: "Заметки", icon: NotebookPen },
  { to: "/family" as const, label: "Семья", icon: Users },
  { to: "/savings" as const, label: "Копилка", icon: PiggyBank },
];

function Home() {
  const hydrated = useHydrated();
  const tasks = useBib((s) => s.tasks);
  const reminders = useBib((s) => s.reminders);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let already = false;
    try {
      already = sessionStorage.getItem("bib-open") === "1";
    } catch {
      already = false;
    }
    if (already) {
      setOpen(true);
      return;
    }
    const timer = window.setTimeout(() => setOpen(true), 2000);
    return () => window.clearTimeout(timer);
  }, []);

  function reveal() {
    setOpen(true);
    try {
      sessionStorage.setItem("bib-open", "1");
    } catch {
      /* в превью хранилище может быть закрыто */
    }
  }

  const today = dayKey();
  const todayItems = hydrated
    ? [
        ...tasks.filter((item) => !item.done && item.due === today),
        ...reminders.filter((item) => !item.done && item.due === today),
      ]
    : [];

  return (
    <main
      className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pt-8 pb-10"
      onPointerDown={reveal}
    >
      {open ? (
        <Link to="/chat" aria-label="Поговорить с Бибинтосиком" className="mx-auto w-40">
          <BibCat className="w-40" />
        </Link>
      ) : (
        <BibCat className="mx-auto w-64" />
      )}
      <h1 className="text-center font-display text-4xl font-semibold text-ink">Чем займемся сейчас?</h1>

      <div className={`${open ? "bib-now" : "bib-soon"} mt-6 grid grid-cols-2 gap-3`}>
        {tiles.map((tile) => (
          <Link
            key={tile.to}
            to={tile.to}
            className="flex min-h-24 flex-col justify-between rounded-2xl border border-line bg-card p-4 shadow-sm"
          >
            <tile.icon className="size-6 text-caramel" aria-hidden="true" />
            <span className="mt-3 font-semibold text-ink">{tile.label}</span>
          </Link>
        ))}
      </div>

      {todayItems.length > 0 ? (
        <Link to="/calendar" className="mt-4 rounded-2xl bg-blush px-4 py-3">
          <span className="text-xs font-semibold tracking-wide text-muted uppercase">Сегодня</span>
          <ul className="mt-1 space-y-1">
            {todayItems.map((item) => (
              <li key={item.id} className="font-semibold text-ink">
                {item.time ? `${item.time} · ` : ""}
                {item.title}
              </li>
            ))}
          </ul>
        </Link>
      ) : null}
    </main>
  );
}
