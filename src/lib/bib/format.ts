export function formatWhen(ts: number) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(ts);
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 5) return "Не спится? Я тут.";
  if (h < 12) return "Доброе утро.";
  if (h < 18) return "Добрый день.";
  return "Добрый вечер.";
}

const DAY_LINES = [
  "Запиши, пока не вылетело из головы.",
  "Если думаешь о своих — я подскажу, что написать.",
  "Одно дело сегодня лучше длинного списка.",
  "Можно просто посидеть и поговорить. Без задачи.",
];

export function dayLine(now = new Date()) {
  const start = new Date(now.getFullYear(), 0, 0).getTime();
  const day = Math.floor((now.getTime() - start) / 86400000);
  return DAY_LINES[day % DAY_LINES.length];
}
