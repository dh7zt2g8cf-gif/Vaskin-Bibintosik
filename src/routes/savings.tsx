import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Empty, LoadingLine, Page, fieldClass, primaryBtn } from "@/components/bib/ui";
import { monthlyNeed, monthsLeft, rubles } from "@/lib/bib/schedule";
import { useBib } from "@/lib/bib/store";
import { useHydrated } from "@/lib/bib/use-hydrated";

export const Route = createFileRoute("/savings")({ component: SavingsPage });

function SavingsPage() {
  const hydrated = useHydrated();
  const goals = useBib((s) => s.goals);
  const addGoal = useBib((s) => s.addGoal);
  const addSaved = useBib((s) => s.addSaved);
  const deleteGoal = useBib((s) => s.deleteGoal);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [by, setBy] = useState("");
  const [already, setAlready] = useState("");
  const [puts, setPuts] = useState<Record<string, string>>({});

  function save(e: FormEvent) {
    e.preventDefault();
    const name = title.trim();
    const cost = Number(price.replace(",", "."));
    const saved = Number((already || "0").replace(",", "."));
    if (!name || !Number.isFinite(cost) || cost <= 0 || !by) return;
    addGoal({ title: name, price: cost, saved: Number.isFinite(saved) && saved > 0 ? saved : 0, by });
    setTitle("");
    setPrice("");
    setBy("");
    setAlready("");
  }

  return (
    <Page
      title="Копилка"
      lede="Не банк. Просто сколько уже отложено и сколько класть в месяц, чтобы успеть к сроку."
    >
      <form onSubmit={save} className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="На что копим"
          aria-label="На что копим"
          className={fieldClass}
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          inputMode="decimal"
          placeholder="Сколько стоит, ₽"
          aria-label="Сколько стоит"
          className={fieldClass}
        />
        <label className="block text-sm text-muted">
          К какому месяцу
          <input type="month" value={by} onChange={(e) => setBy(e.target.value)} className={fieldClass} required />
        </label>
        <input
          value={already}
          onChange={(e) => setAlready(e.target.value)}
          inputMode="decimal"
          placeholder="Уже отложено, если есть"
          aria-label="Уже отложено"
          className={fieldClass}
        />
        <button type="submit" className={primaryBtn} disabled={!hydrated || !title.trim() || !price.trim() || !by}>
          Начать копилку
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {!hydrated ? <LoadingLine /> : null}
        {hydrated && goals.length === 0 ? <Empty>Пока ничего не копим.</Empty> : null}
        {hydrated
          ? goals.map((goal) => {
              const plan = monthlyNeed(goal.price, goal.saved, goal.by);
              const pct = goal.price > 0 ? Math.min(100, Math.round((goal.saved / goal.price) * 100)) : 0;
              const months = monthsLeft(goal.by);
              return (
                <article key={goal.id} className="rounded-2xl border border-line bg-card p-4 shadow-sm">
                  <h2 className="font-display text-2xl font-semibold">{goal.title}</h2>
                  <p className="mt-1 text-sm text-muted">
                    {rubles(goal.saved)} из {rubles(goal.price)}
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-blush">
                    <div className="h-full bg-caramel" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-3 text-ink">
                    {plan.left <= 0
                      ? "Хватает. Можно покупать."
                      : plan.overdue
                        ? `Срок уже прошёл. Осталось отложить ${rubles(plan.left)}.`
                        : `До срока ${months} мес. Откладывай около ${rubles(plan.perMonth)} в месяц.`}
                  </p>
                  <form
                    className="mt-3 flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const amount = Number((puts[goal.id] || "").replace(",", "."));
                      if (!Number.isFinite(amount) || amount === 0) return;
                      addSaved(goal.id, amount);
                      setPuts((prev) => ({ ...prev, [goal.id]: "" }));
                    }}
                  >
                    <input
                      value={puts[goal.id] ?? ""}
                      onChange={(e) => setPuts((prev) => ({ ...prev, [goal.id]: e.target.value }))}
                      inputMode="decimal"
                      placeholder="Отложил, ₽"
                      aria-label={`Отложить на ${goal.title}`}
                      className={fieldClass}
                    />
                    <button type="submit" className="inline-flex min-h-12 shrink-0 items-center rounded-2xl bg-caramel px-4 font-semibold text-card">
                      Внести
                    </button>
                  </form>
                  <button type="button" className="mt-2 min-h-11 text-sm text-muted" onClick={() => deleteGoal(goal.id)}>
                    Убрать цель
                  </button>
                </article>
              );
            })
          : null}
      </div>
    </Page>
  );
}
