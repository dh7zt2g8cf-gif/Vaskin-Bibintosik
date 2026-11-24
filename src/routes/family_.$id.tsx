import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { LoadingLine, fieldClass, primaryBtn } from "@/components/bib/ui";
import { ageOn, nearestOccasion, RELATIONS, yearsWord } from "@/lib/bib/people";
import { formatDay } from "@/lib/bib/schedule";
import { useBib } from "@/lib/bib/store";
import { suggestFor, type SuggestKind } from "@/lib/bib/suggest";
import { useHydrated } from "@/lib/bib/use-hydrated";

type Search = { kind: SuggestKind };

export const Route = createFileRoute("/family_/$id")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    kind: search.kind === "gift" ? "gift" : "message",
  }),
  component: MemberPage,
});

function MemberPage() {
  const { id } = Route.useParams();
  const { kind } = Route.useSearch();
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const member = useBib((s) => s.family.find((m) => m.id === id));
  const updateMember = useBib((s) => s.updateMember);
  const deleteMember = useBib((s) => s.deleteMember);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [birthday, setBirthday] = useState("");
  const [notes, setNotes] = useState("");
  const [turn, setTurn] = useState(0);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (!member) return;
    setName(member.name);
    setRelation(member.relation);
    setBirthday(member.birthday ?? "");
    setNotes(member.notes);
  }, [member]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-lg px-5 pt-8">
        <LoadingLine />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="mx-auto max-w-lg px-5 pt-10">
        <p className="text-muted">Такого человека уже нет в тетрадке.</p>
        <Link to="/family" className="mt-4 inline-flex min-h-11 items-center font-semibold text-caramel">
          К семье
        </Link>
      </div>
    );
  }

  const suggestion = suggestFor(
    { ...member, name: name.trim() || member.name, relation, notes, birthday },
    kind,
    turn,
  );
  const dirty =
    name.trim() !== member.name ||
    relation !== member.relation ||
    birthday !== (member.birthday ?? "") ||
    notes.trim() !== member.notes;

  return (
    <div className="mx-auto min-h-dvh w-full max-w-lg px-5 pt-6 pb-28">
      <Link to="/family" className="mb-5 inline-flex min-h-11 items-center text-sm font-medium text-muted">
        ← Назад к семье
      </Link>
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        {kind === "gift" ? "Идея подарка" : "Что написать"}
      </h1>
      <p className="mt-2 text-muted">{member.name}</p>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => {
            setTurn(0);
            void navigate({ to: "/family/$id", params: { id }, search: { kind: "message" } });
          }}
          className={
            kind === "message"
              ? "inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-caramel px-3 font-semibold text-card"
              : "inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-blush px-3 font-semibold text-ink"
          }
        >
          Письмо
        </button>
        <button
          type="button"
          onClick={() => {
            setTurn(0);
            void navigate({ to: "/family/$id", params: { id }, search: { kind: "gift" } });
          }}
          className={
            kind === "gift"
              ? "inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-caramel px-3 font-semibold text-card"
              : "inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-blush px-3 font-semibold text-ink"
          }
        >
          Подарок
        </button>
      </div>

      <blockquote className="mt-4 rounded-2xl bg-blush p-5 font-display text-xl leading-snug text-ink">
        {suggestion}
      </blockquote>
      <button
        type="button"
        className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-caramel"
        onClick={() => setTurn((n) => n + 1)}
      >
        <RefreshCw className="size-4" aria-hidden="true" />
        Другая идея
      </button>

      <form
        className="mt-8 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const nextName = name.trim();
          if (!nextName) return;
          updateMember(id, {
            name: nextName,
            relation,
            notes: notes.trim(),
            birthday,
          });
        }}
      >
        <h2 className="font-semibold">Карточка</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} aria-label="Имя" />
        <label className="block text-sm text-muted">
          Кем приходится
          <select value={relation} onChange={(e) => setRelation(e.target.value)} className={fieldClass}>
            <option value="">Выбери</option>
            {RELATIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
            {relation && !(RELATIONS as readonly string[]).includes(relation) ? (
              <option value={relation}>{relation}</option>
            ) : null}
          </select>
        </label>
        <label className="block text-sm text-muted">
          Дата рождения
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className={fieldClass}
          />
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Что важно помнить"
          rows={3}
          className={fieldClass}
          aria-label="Что важно помнить"
        />
        <button type="submit" className={primaryBtn} disabled={!dirty || !name.trim()}>
          Сохранить карточку
        </button>
      </form>

      <div className="mt-6">
        {confirm ? (
          <button
            type="button"
            className="min-h-11 text-sm font-semibold text-caramel"
            onClick={() => {
              deleteMember(id);
              void navigate({ to: "/family" });
            }}
          >
            Точно убрать {member.name}
          </button>
        ) : (
          <button type="button" className="min-h-11 text-sm text-muted" onClick={() => setConfirm(true)}>
            Убрать из семьи
          </button>
        )}
      </div>
    </div>
  );
}
