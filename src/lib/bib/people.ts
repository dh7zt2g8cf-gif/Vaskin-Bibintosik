export const RELATIONS = [
  "мама",
  "папа",
  "жена",
  "муж",
  "сестра",
  "брат",
  "дочь",
  "сын",
  "бабушка",
  "дедушка",
] as const;

export type PersonBits = { relation: string; birthday?: string; name: string };

export function genderOf(relation: string): "ж" | "м" | "" {
  const r = relation.toLowerCase().replaceAll("ё", "е");
  if (/мам|жен|сестр|доч|бабуш|подруг/.test(r)) return "ж";
  if (/пап|муж|брат|сын|дедуш/.test(r) || /(^|\s)друг\b/.test(r)) return "м";
  return "";
}

export function yearsWord(n: number) {
  const a = n % 100;
  const b = n % 10;
  if (a > 10 && a < 20) return "лет";
  if (b === 1) return "год";
  if (b > 1 && b < 5) return "года";
  return "лет";
}

function start(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function dayKey(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function daysBetween(target: Date, now: Date) {
  return Math.round((start(target).getTime() - start(now).getTime()) / 86400000);
}

function nextAnnual(month: number, day: number, now: Date) {
  let date = new Date(now.getFullYear(), month - 1, day);
  if (daysBetween(date, now) < 0) date = new Date(now.getFullYear() + 1, month - 1, day);
  return date;
}

function lastSunday(year: number, monthIndex: number) {
  const last = new Date(year, monthIndex + 1, 0);
  return new Date(year, monthIndex, last.getDate() - last.getDay());
}

function nthSunday(year: number, monthIndex: number, n: number) {
  const first = new Date(year, monthIndex, 1);
  const add = (7 - first.getDay()) % 7;
  return new Date(year, monthIndex, 1 + add + (n - 1) * 7);
}

function nextOf(make: (year: number) => Date, now: Date) {
  let date = make(now.getFullYear());
  if (daysBetween(date, now) < 0) date = make(now.getFullYear() + 1);
  return date;
}

export function ageOn(birthday: string | undefined, now = new Date()) {
  if (!birthday || !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) return null;
  const [y, m, d] = birthday.split("-").map(Number);
  if (!y || !m || !d) return null;
  let age = now.getFullYear() - y;
  if ((now.getMonth() + 1) * 100 + now.getDate() < m * 100 + d) age -= 1;
  return age >= 0 && age < 130 ? age : null;
}

export type Occasion = { label: string; date: string; days: number };

export function nearestOccasion(person: PersonBits, now = new Date()): Occasion | null {
  const gender = genderOf(person.relation);
  const r = person.relation.toLowerCase();
  const candidates: { label: string; date: Date }[] = [];

  if (person.birthday && /^\d{4}-\d{2}-\d{2}$/.test(person.birthday)) {
    const [, m, d] = person.birthday.split("-").map(Number);
    if (m && d) candidates.push({ label: "День рождения", date: nextAnnual(m, d, now) });
  }
  if (gender === "ж") candidates.push({ label: "8 Марта", date: nextAnnual(3, 8, now) });
  if (gender === "м") candidates.push({ label: "23 Февраля", date: nextAnnual(2, 23, now) });
  if (/мам|бабуш/.test(r)) {
    candidates.push({
      label: "День матери",
      date: nextOf((year) => lastSunday(year, 10), now),
    });
  }
  if (/пап|дедуш/.test(r)) {
    candidates.push({
      label: "День отца",
      date: nextOf((year) => nthSunday(year, 9, 3), now),
    });
  }

  let best: Occasion | null = null;
  for (const item of candidates) {
    const days = daysBetween(item.date, now);
    if (days < 0) continue;
    if (!best || days < best.days) best = { label: item.label, date: dayKey(item.date), days };
  }
  return best;
}

export function ageGiftLines(person: PersonBits) {
  const n = person.name;
  const age = ageOn(person.birthday);
  const occasion = nearestOccasion(person);
  const lines: string[] = [];
  if (occasion && occasion.days <= 60) {
    const when = occasion.days === 0 ? "сегодня" : `через ${occasion.days} дней`;
    lines.push(
      `${occasion.label} — ${when}. Лучше одна точная вещь и тёплые слова, чем набор на всякий случай.`,
    );
  }
  if (age === null) return lines;
  if (age < 7) {
    lines.push(`Сейчас около ${age} ${yearsWord(age)}. Книжка, мягкая игрушка или то, во что вы поиграете вместе.`);
  } else if (age < 13) {
    lines.push(`Около ${age} ${yearsWord(age)}. Уже не «для малышей»: набор по интересу, книга или билет куда-то вместе.`);
  } else if (age < 18) {
    lines.push(
      `Подростку (${age}) не дари «как ребёнку». Лучше то, что можно выбрать самому, или впечатление без нравоучения.`,
    );
  } else if (age < 30) {
    lines.push(`В ${age} заходит опыт и удобная вещь, которой пользуются каждый день, а не пыльный сувенир.`);
  } else if (age < 60) {
    lines.push(`В ${age} ценят время и качество: хороший чай, ужин вместе или вещь, которую ${n} давно откладывает.`);
  } else {
    lines.push(
      `В ${age} лучше тепло и внимание: удобный плед, любимый вкус и визит, а не «полезная» коробка без тебя.`,
    );
  }
  return lines;
}
