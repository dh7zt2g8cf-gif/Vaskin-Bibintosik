import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";

export const Route = createFileRoute("/games_/jam")({ component: JamPage });

type Color = "caramel" | "soft" | "ink" | "leaf";
type Dir = "up" | "down" | "left" | "right";
type Car = { id: number; color: Color; r: number; c: number; dir: Dir; len: number; seats: number };

type Level = { w: number; h: number; slots: number; cars: Car[]; queue: Color[] };

const PAINT: Record<Color, string> = {
  caramel: "bg-caramel text-card",
  soft: "bg-soft text-ink",
  ink: "bg-ink text-card",
  leaf: "bg-leaf text-card",
};

const NAME: Record<Color, string> = {
  caramel: "коричневая",
  soft: "песочная",
  ink: "тёмная",
  leaf: "зелёная",
};

const LEVELS: Level[] = [
  {
    w: 4,
    h: 4,
    slots: 2,
    cars: [
      { id: 1, color: "ink", r: 0, c: 2, dir: "right", len: 2, seats: 2 },
      { id: 2, color: "caramel", r: 2, c: 0, dir: "down", len: 2, seats: 2 },
    ],
    queue: ["ink", "ink", "caramel", "caramel"],
  },
  {
    w: 4,
    h: 4,
    slots: 2,
    cars: [
      { id: 1, color: "caramel", r: 1, c: 0, dir: "right", len: 2, seats: 2 },
      { id: 2, color: "ink", r: 0, c: 2, dir: "down", len: 2, seats: 2 },
    ],
    queue: ["ink", "ink", "caramel", "caramel"],
  },
  {
    w: 4,
    h: 4,
    slots: 2,
    cars: [
      { id: 1, color: "caramel", r: 0, c: 0, dir: "right", len: 2, seats: 2 },
      { id: 2, color: "ink", r: 1, c: 1, dir: "down", len: 2, seats: 2 },
      { id: 3, color: "soft", r: 3, c: 2, dir: "left", len: 2, seats: 2 },
    ],
    queue: ["caramel", "ink", "ink", "caramel"],
  },
  {
    w: 5,
    h: 5,
    slots: 3,
    cars: [
      { id: 1, color: "leaf", r: 0, c: 0, dir: "right", len: 2, seats: 2 },
      { id: 2, color: "caramel", r: 0, c: 2, dir: "down", len: 2, seats: 2 },
      { id: 3, color: "ink", r: 2, c: 2, dir: "right", len: 2, seats: 2 },
      { id: 4, color: "soft", r: 3, c: 4, dir: "up", len: 2, seats: 2 },
    ],
    queue: ["soft", "soft", "ink", "ink", "caramel", "caramel", "leaf", "leaf"],
  },
];

const STEP: Record<Dir, [number, number]> = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};

function cells(car: Car) {
  const list: Array<[number, number]> = [];
  for (let i = 0; i < car.len; i++) {
    if (car.dir === "right") list.push([car.r, car.c + i]);
    if (car.dir === "left") list.push([car.r, car.c + i]);
    if (car.dir === "down") list.push([car.r + i, car.c]);
    if (car.dir === "up") list.push([car.r + i, car.c]);
  }
  return list;
}

function front(car: Car) {
  const all = cells(car);
  if (car.dir === "up" || car.dir === "left") return all[0];
  return all[all.length - 1];
}

function canLeave(car: Car, cars: Car[], w: number, h: number) {
  const [fr, fc] = front(car);
  const [dr, dc] = STEP[car.dir];
  let r = fr + dr;
  let c = fc + dc;
  const taken = new Set(cars.filter((item) => item.id !== car.id).flatMap((item) => cells(item).map(([y, x]) => `${y},${x}`)));
  while (r >= 0 && c >= 0 && r < h && c < w) {
    if (taken.has(`${r},${c}`)) return false;
    r += dr;
    c += dc;
  }
  return true;
}

type Slot = { id: number; color: Color; seats: number; filled: number };

function board(level: Level) {
  return {
    cars: level.cars.map((car) => ({ ...car })),
    queue: [...level.queue],
    slots: [] as Slot[],
    lost: false,
  };
}

function JamPage() {
  const [levelIndex, setLevelIndex] = useState(0);
  const level = LEVELS[Math.min(levelIndex, LEVELS.length - 1)];
  const [cars, setCars] = useState<Car[]>(() => board(level).cars);
  const [queue, setQueue] = useState<Color[]>(() => board(level).queue);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [lost, setLost] = useState(false);
  const won = queue.length === 0;

  function reset(index = levelIndex) {
    const next = LEVELS[Math.min(index, LEVELS.length - 1)];
    const fresh = board(next);
    setLevelIndex(Math.min(index, LEVELS.length - 1));
    setCars(fresh.cars);
    setQueue(fresh.queue);
    setSlots(fresh.slots);
    setLost(false);
  }

  function take(id: number) {
    if (won || lost) return;
    const car = cars.find((item) => item.id === id);
    if (!car || !canLeave(car, cars, level.w, level.h)) return;
    if (slots.length >= level.slots) {
      setLost(true);
      return;
    }
    const nextSlots = [...slots, { id: car.id, color: car.color, seats: car.seats, filled: 0 }];
    const nextQueue = [...queue];
    const parked: Slot[] = [];
    let moved = true;
    while (moved) {
      moved = false;
      for (const slot of nextSlots) {
        if (parked.includes(slot)) continue;
        while (slot.filled < slot.seats && nextQueue[0] === slot.color) {
          nextQueue.shift();
          slot.filled += 1;
          moved = true;
        }
        if (slot.filled >= slot.seats) parked.push(slot);
      }
    }
    const staying = nextSlots.filter((slot) => !parked.includes(slot));
    const stuck =
      nextQueue.length > 0 &&
      staying.length >= level.slots &&
      !staying.some((slot) => slot.color === nextQueue[0] && slot.filled < slot.seats);
    setCars(cars.filter((item) => item.id !== id));
    setQueue(nextQueue);
    setSlots(staying);
    setLost(stuck);
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pt-6 pb-10">
      <Link to="/games" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted">
        <ArrowLeft className="size-4" aria-hidden="true" />
        К играм
      </Link>
      <div className="mt-3 flex items-end justify-between">
        <h1 className="font-display text-4xl font-semibold">Выезд</h1>
        <p className="text-sm text-muted">Двор {levelIndex + 1} из {LEVELS.length}</p>
      </div>
      <p className="mt-2 text-muted">Нажми машину, если перед ней свободно. Она заберёт своих с начала очереди.</p>

      <div className="mt-4 flex gap-2">
        {Array.from({ length: level.slots }, (_, index) => {
          const slot = slots[index];
          return (
            <div
              key={index}
              className={`flex h-14 flex-1 items-center justify-center rounded-2xl border border-line text-sm font-semibold ${slot ? PAINT[slot.color] : "bg-card text-muted"}`}
            >
              {slot ? `${slot.filled}/${slot.seats}` : "место"}
            </div>
          );
        })}
      </div>

      <div
        className="relative mt-4 grid gap-1 rounded-2xl bg-blush p-2"
        style={{ gridTemplateColumns: `repeat(${level.w}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: level.h * level.w }, (_, index) => (
          <span
            key={index}
            className="aspect-square rounded-xl bg-card/60"
            style={{ gridColumn: (index % level.w) + 1, gridRow: Math.floor(index / level.w) + 1 }}
          />
        ))}
        {cars.map((car) => {
          const wide = car.dir === "left" || car.dir === "right";
          const Icon =
            car.dir === "right" ? ChevronRight : car.dir === "left" ? ChevronLeft : car.dir === "up" ? ChevronUp : ChevronDown;
          return (
            <button
              key={car.id}
              type="button"
              aria-label={`${NAME[car.color]} машина`}
              onClick={() => take(car.id)}
              style={{
                gridColumn: `${car.c + 1} / span ${wide ? car.len : 1}`,
                gridRow: `${car.r + 1} / span ${wide ? 1 : car.len}`,
              }}
              className={`z-10 flex items-center justify-center rounded-xl ${PAINT[car.color]}`}
            >
              <Icon className="size-5" aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {queue.map((color, index) => (
          <span key={`${color}-${index}`} className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-xs font-semibold ${PAINT[color]}`}>
            {index === 0 ? "ждёт" : ""}
          </span>
        ))}
      </div>

      {won ? (
        <button
          type="button"
          className="mt-5 min-h-12 rounded-2xl bg-caramel font-semibold text-card"
          onClick={() => reset(levelIndex + 1 >= LEVELS.length ? 0 : levelIndex + 1)}
        >
          {levelIndex + 1 >= LEVELS.length ? "Все дворы пройдены. Сначала" : "Следующий двор"}
        </button>
      ) : null}
      {lost ? (
        <button type="button" className="mt-5 min-h-12 rounded-2xl bg-blush font-semibold text-ink" onClick={() => reset(levelIndex)}>
          Места кончились. Заново
        </button>
      ) : null}
    </div>
  );
}
