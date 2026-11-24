export function dayKey(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function formatDay(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(new Date(y, m - 1, d));
}

export function monthLabel(year: number, monthIndex: number) {
  const raw = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(
    new Date(year, monthIndex, 1),
  );
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function monthCells(year: number, monthIndex: number) {
  const first = new Date(year, monthIndex, 1);
  const lead = (first.getDay() + 6) % 7;
  const count = new Date(year, monthIndex + 1, 0).getDate();
  const cells: Array<{ key: string; day: number } | null> = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= count; day++) {
    cells.push({ day, key: dayKey(new Date(year, monthIndex, day)) });
  }
  return cells;
}

export function rubles(value: number) {
  return `${new Intl.NumberFormat("ru-RU").format(Math.round(value))} ₽`;
}

export function monthsLeft(by: string, now = new Date()) {
  if (!/^\d{4}-\d{2}$/.test(by)) return 0;
  const [y, m] = by.split("-").map(Number);
  return (y - now.getFullYear()) * 12 + (m - (now.getMonth() + 1)) + 1;
}

export function monthlyNeed(price: number, saved: number, by: string, now = new Date()) {
  const left = Math.max(0, price - saved);
  const months = monthsLeft(by, now);
  if (left === 0) return { left, months, perMonth: 0, overdue: months < 1 };
  if (months < 1) return { left, months, perMonth: left, overdue: true };
  return { left, months, perMonth: Math.ceil(left / months), overdue: false };
}
