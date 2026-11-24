import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Empty, LoadingLine, Page, fieldClass, primaryBtn } from "@/components/bib/ui";
import { ageOn, nearestOccasion, RELATIONS, yearsWord } from "@/lib/bib/people";
import { formatDay } from "@/lib/bib/schedule";
import { useBib } from "@/lib/bib/store";
import { useHydrated } from "@/lib/bib/use-hydrated";

export const Route = createFileRoute("/family")({ component: FamilyPage });

function FamilyPage() {
  const hydrated = useHydrated();
  const family = useBib((s) => s.family);
  const addMember = useBib((s) => s.addMember);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [birthday, setBirthday] = useState("");
  const [notes, setNotes] = useState("");

  function save(e: FormEvent) {
    e.preventDefault();
    const value = name.trim();
    if (!value) return;
    addMember({ name: value, relation, notes: notes.trim(), birthday });
    setName("");
    setRelation("");
    setBirthday("");
    setNotes("");
  }

  return (
    <Page title="Семья" lede="Люди, про которых легко забыть позвонить. Здесь — что о них помнить.">
      <form onSubmit={save} className="space-y-3">
        <label className="sr-only" htmlFor="name">
          Имя
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Имя"
          className={fieldClass}
        />
        <label className="block text-sm text-muted" htmlFor="relation">
          Кем приходится
          <select
            id="relation"
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            className={fieldClass}
          >
            <option value="">Выбери</option>
            {RELATIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-muted" htmlFor="birthday">
          Дата рождения
          <input
            id="birthday"
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="sr-only" htmlFor="about">
          Что важно помнить
        </label>
        <textarea
          id="about"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Что важно помнить о человеке"
          rows={3}
          className={fieldClass}
        />
        <button type="submit" className={primaryBtn} disabled={!hydrated || !name.trim()}>
          Добавить
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {!hydrated ? <LoadingLine /> : null}
        {hydrated && family.length === 0 ? <Empty>Пока никого нет.</Empty> : null}
        {hydrated
          ? family.map((member) => (
              <article key={member.id} className="rounded-2xl border border-line bg-card p-4 shadow-sm">
                <h2 className="font-display text-2xl font-semibold">{member.name}</h2>
                <p className="text-sm text-muted">{member.relation || "Близкий человек"}</p>
                {member.birthday ? (
                  <p className="mt-1 text-sm text-ink">
                    {formatDay(member.birthday)}
                    {ageOn(member.birthday) !== null
                      ? ` · ${ageOn(member.birthday)} ${yearsWord(ageOn(member.birthday) ?? 0)}`
                      : ""}
                  </p>
                ) : null}
                {(() => {
                  const occasion = nearestOccasion(member);
                  return occasion && occasion.days <= 90 ? (
                    <p className="mt-1 text-sm text-caramel">
                      {occasion.label}
                      {occasion.days === 0 ? " сегодня" : ` · ${formatDay(occasion.date)}`}
                    </p>
                  ) : null;
                })()}
                {member.notes ? <p className="mt-2 text-ink">{member.notes}</p> : null}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    to="/family/$id"
                    params={{ id: member.id }}
                    search={{ kind: "message" }}
                    className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-blush px-2 text-center text-sm font-semibold text-ink"
                  >
                    Что написать
                  </Link>
                  <Link
                    to="/family/$id"
                    params={{ id: member.id }}
                    search={{ kind: "gift" }}
                    className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-blush px-2 text-center text-sm font-semibold text-ink"
                  >
                    Что подарить
                  </Link>
                </div>
              </article>
            ))
          : null}
      </div>
    </Page>
  );
}
