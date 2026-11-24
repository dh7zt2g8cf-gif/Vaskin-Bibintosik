import { createFileRoute, Link } from "@tanstack/react-router";
import { Page } from "@/components/bib/ui";

export const Route = createFileRoute("/games")({ component: GamesPage });

const games = [
  {
    to: "/games/throw" as const,
    title: "Пенёк",
    text: "Бросай колышек в крутящийся пенёк и не задень те, что уже торчат.",
  },
  {
    to: "/games/sort" as const,
    title: "Кладовая",
    text: "Меняй соседние запасы местами и собирай три одинаковых.",
  },
  {
    to: "/games/jam" as const,
    title: "Выезд",
    text: "Выведи машины по очереди, чтобы каждый сел в свою.",
  },
];

function GamesPage() {
  return (
    <Page title="Игры" lede="Три короткие. Можно на минуту, можно подольше.">
      <div className="space-y-3">
        {games.map((game) => (
          <Link
            key={game.to}
            to={game.to}
            className="block rounded-2xl border border-line bg-card p-4 shadow-sm"
          >
            <h2 className="font-display text-2xl font-semibold">{game.title}</h2>
            <p className="mt-1 text-muted">{game.text}</p>
          </Link>
        ))}
      </div>
    </Page>
  );
}
