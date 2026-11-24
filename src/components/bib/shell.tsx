import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BibCat } from "@/components/bib/cat";
import { useBib } from "@/lib/bib/store";
import { dayKey } from "@/lib/bib/schedule";
import { useHydrated } from "@/lib/bib/use-hydrated";

export function CompanionDock() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path === "/" || path === "/chat" || path.startsWith("/games")) return null;
  return (
    <Link
      to="/chat"
      aria-label="Открыть чат с Бибинтосиком"
      className="fixed right-3 bottom-3 z-40 w-24"
    >
      <BibCat className="w-24" />
    </Link>
  );
}

type Ping = { id: string; title: string };

export function DueWatcher() {
  const hydrated = useHydrated();
  const tasks = useBib((s) => s.tasks);
  const reminders = useBib((s) => s.reminders);
  const fired = useBib((s) => s.fired);
  const markFired = useBib((s) => s.markFired);
  const [pings, setPings] = useState<Ping[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    const look = () => {
      const today = dayKey();
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      const due = [
        ...reminders.filter((r) => !r.done).map((r) => ({ ...r, kind: "reminder" as const })),
        ...tasks.filter((t) => !t.done).map((t) => ({ ...t, kind: "task" as const })),
      ];
      const fresh: Ping[] = [];
      for (const item of due) {
        if (!item.due || item.due !== today || !item.time) continue;
        const [h, m] = item.time.split(":").map(Number);
        if (!Number.isFinite(h) || !Number.isFinite(m)) continue;
        if (h * 60 + m > minutes) continue;
        const key = `${item.kind}:${item.id}:${today}`;
        if (fired.includes(key)) continue;
        markFired(key);
        fresh.push({ id: key, title: item.title });
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("Бибинтосик", { body: item.title });
        }
      }
      if (fresh.length) setPings((prev) => [...fresh, ...prev].slice(0, 3));
    };
    look();
    const timer = window.setInterval(look, 20000);
    return () => window.clearInterval(timer);
  }, [hydrated, tasks, reminders, fired, markFired]);

  if (!pings.length) return null;
  return (
    <div className="fixed inset-x-4 top-4 z-50 mx-auto max-w-lg rounded-2xl border border-line bg-card p-4 shadow-md">
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">Сейчас</p>
      <ul className="mt-2 space-y-1">
        {pings.map((ping) => (
          <li key={ping.id} className="font-semibold text-ink">
            {ping.title}
          </li>
        ))}
      </ul>
      <button type="button" className="mt-3 min-h-11 text-sm font-semibold text-caramel" onClick={() => setPings([])}>
        Понятно
      </button>
    </div>
  );
}
