import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/games_/sort")({ component: SortPage });

const LEVELS = [
  { moves: 18, goal: 80 },
  { moves: 16, goal: 140 },
  { moves: 15, goal: 200 },
  { moves: 14, goal: 280 },
  { moves: 12, goal: 360 },
];

const GOODS = [
  { name: "Чай", className: "bg-caramel text-card" },
  { name: "Мёд", className: "bg-soft text-ink" },
  { name: "Нить", className: "bg-ink text-card" },
  { name: "Лист", className: "bg-leaf text-card" },
  { name: "Том", className: "bg-blush text-ink" },
];

type Board = number[][];

function fresh(): Board {
  const board = Array.from({ length: 7 }, () => Array.from({ length: 7 }, () => 0));
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      let kind = 0;
      do {
        kind = Math.floor(Math.random() * GOODS.length);
      } while (
        (c >= 2 && board[r][c - 1] === kind && board[r][c - 2] === kind) ||
        (r >= 2 && board[r - 1][c] === kind && board[r - 2][c] === kind)
      );
      board[r][c] = kind;
    }
  }
  return board;
}

function clone(board: Board): Board {
  return board.map((row) => row.slice());
}

function collect(board: Board) {
  const marked = new Set<string>();
  const rows = new Set<number>();
  const cols = new Set<number>();
  for (let r = 0; r < 7; r++) {
    let c = 0;
    while (c < 7) {
      const kind = board[r][c];
      let end = c + 1;
      while (end < 7 && board[r][end] === kind) end++;
      if (kind >= 0 && end - c >= 3) {
        for (let i = c; i < end; i++) marked.add(`${r},${i}`);
        if (end - c >= 4) rows.add(r);
      }
      c = end;
    }
  }
  for (let c = 0; c < 7; c++) {
    let r = 0;
    while (r < 7) {
      const kind = board[r][c];
      let end = r + 1;
      while (end < 7 && board[end][c] === kind) end++;
      if (kind >= 0 && end - r >= 3) {
        for (let i = r; i < end; i++) marked.add(`${i},${c}`);
        if (end - r >= 4) cols.add(c);
      }
      r = end;
    }
  }
  rows.forEach((r) => {
    for (let c = 0; c < 7; c++) marked.add(`${r},${c}`);
  });
  cols.forEach((c) => {
    for (let r = 0; r < 7; r++) marked.add(`${r},${c}`);
  });
  return marked;
}

function settle(board: Board) {
  const next = clone(board);
  let score = 0;
  for (let guard = 0; guard < 12; guard++) {
    const marked = collect(next);
    if (!marked.size) break;
    score += marked.size * 10;
    for (let c = 0; c < 7; c++) {
      const stack: number[] = [];
      for (let r = 6; r >= 0; r--) {
        if (!marked.has(`${r},${c}`)) stack.push(next[r][c]);
      }
      for (let r = 6; r >= 0; r--) next[r][c] = stack[6 - r] ?? Math.floor(Math.random() * GOODS.length);
    }
  }
  return { board: next, score };
}

function SortPage() {
  const [level, setLevel] = useState(0);
  const [board, setBoard] = useState<Board>(fresh);
  const [picked, setPicked] = useState<{ r: number; c: number } | null>(null);
  const [moves, setMoves] = useState(LEVELS[0].moves);
  const [score, setScore] = useState(0);
  const goal = LEVELS[level]?.goal ?? LEVELS[LEVELS.length - 1].goal;
  const done = score >= goal;
  const stuck = moves <= 0 && !done;
  const label = useMemo(() => (level < LEVELS.length ? `Полка ${level + 1}` : "Полка"), [level]);

  function restart(nextLevel = level) {
    const spec = LEVELS[Math.min(nextLevel, LEVELS.length - 1)];
    setLevel(Math.min(nextLevel, LEVELS.length - 1));
    setBoard(fresh());
    setPicked(null);
    setMoves(spec.moves);
    setScore(0);
  }

  function tap(r: number, c: number) {
    if (done || stuck) return;
    if (!picked) {
      setPicked({ r, c });
      return;
    }
    const near = Math.abs(picked.r - r) + Math.abs(picked.c - c) === 1;
    if (!near) {
      setPicked({ r, c });
      return;
    }
    const swapped = clone(board);
    const hold = swapped[r][c];
    swapped[r][c] = swapped[picked.r][picked.c];
    swapped[picked.r][picked.c] = hold;
    if (!collect(swapped).size) {
      setPicked({ r, c });
      return;
    }
    const settled = settle(swapped);
    setBoard(settled.board);
    setScore((value) => value + settled.score);
    setMoves((value) => value - 1);
    setPicked(null);
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pt-6 pb-10">
      <Link to="/games" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted">
        <ArrowLeft className="size-4" aria-hidden="true" />
        К играм
      </Link>
      <div className="mt-3 flex items-end justify-between gap-3">
        <h1 className="font-display text-4xl font-semibold">Кладовая</h1>
        <p className="text-right text-sm text-muted">
          {label}
          <span className="block">
            {score}/{goal} · ходы {moves}
          </span>
        </p>
      </div>
      <p className="mt-2 text-muted">Два одинаковых не считаются. Нужно три в ряд. Четыре очищают всю линию.</p>

      <div className="mt-5 grid grid-cols-7 gap-1">
        {board.map((row, r) =>
          row.map((kind, c) => {
            const good = GOODS[kind];
            const on = picked?.r === r && picked?.c === c;
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                aria-label={good.name}
                onClick={() => tap(r, c)}
                className={`flex aspect-square items-center justify-center rounded-xl text-xs font-semibold ${good.className} ${on ? "ring-2 ring-ink" : ""}`}
              >
                {good.name}
              </button>
            );
          }),
        )}
      </div>

      {done ? (
        <button type="button" className="mt-5 min-h-12 rounded-2xl bg-caramel font-semibold text-card" onClick={() => restart(level + 1)}>
          {level + 1 < LEVELS.length ? "Следующая полка" : "Ещё раз с начала"}
        </button>
      ) : null}
      {stuck ? (
        <button type="button" className="mt-5 min-h-12 rounded-2xl bg-blush font-semibold text-ink" onClick={() => restart(level)}>
          Ходы кончились. Заново
        </button>
      ) : null}
    </div>
  );
}
