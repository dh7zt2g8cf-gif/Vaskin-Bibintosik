import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/games_/throw")({ component: ThrowPage });

type Peg = { angle: number; wide?: boolean };

function norm(n: number) {
  return ((n % 360) + 360) % 360;
}

function spot(angle: number, radius: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: 150 + Math.cos(rad) * radius, y: 150 + Math.sin(rad) * radius };
}

function gap(a: number, b: number) {
  const d = Math.abs(norm(a) - norm(b));
  return Math.min(d, 360 - d);
}

function plan(stage: number) {
  const boss = stage % 5 === 0;
  const pegs: Peg[] = [];
  const preset = stage === 1 ? 0 : Math.min(7, stage);
  for (let i = 0; i < preset; i++) pegs.push({ angle: (i * 360) / preset + 12, wide: boss && i % 2 === 0 });
  return {
    goal: 3 + stage,
    speed: (stage % 2 === 0 ? -1 : 1) * (80 + stage * 18) * (boss ? 1.3 : 1),
    pegs,
    apple: stage % 3 === 0 ? norm(140 + stage * 17) : null,
  };
}

function ThrowPage() {
  const disc = useRef<SVGSVGElement>(null);
  const rot = useRef(0);
  const speed = useRef(90);
  const pegsRef = useRef<Peg[]>([]);
  const goalRef = useRef(4);
  const appleRef = useRef<number | null>(null);
  const busy = useRef(false);
  const [stage, setStage] = useState(1);
  const [pegs, setPegs] = useState<Peg[]>([]);
  const [left, setLeft] = useState(4);
  const [apple, setApple] = useState<number | null>(null);
  const [flying, setFlying] = useState(false);
  const [note, setNote] = useState("Нажми, чтобы бросить");
  const [best, setBest] = useState(1);

  function load(next: number) {
    const setup = plan(next);
    pegsRef.current = setup.pegs;
    goalRef.current = setup.goal;
    appleRef.current = setup.apple;
    speed.current = setup.speed;
    setPegs(setup.pegs);
    setLeft(setup.goal);
    setApple(setup.apple);
    setNote(next % 5 === 0 ? "Толстый пень. Бросай точнее." : "Нажми, чтобы бросить");
  }

  useEffect(() => {
    const saved = Number(localStorage.getItem("bib-throw-best") || "1");
    if (saved > 1) setBest(saved);
    load(1);
    let frame = 0;
    let prev = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      rot.current = norm(rot.current + speed.current * dt);
      if (disc.current) disc.current.style.transform = `rotate(${rot.current}deg)`;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  function remember(nextStage: number) {
    setBest((current) => {
      const value = Math.max(current, nextStage);
      localStorage.setItem("bib-throw-best", String(value));
      return value;
    });
  }

  function throwPeg() {
    if (busy.current || left <= 0) return;
    busy.current = true;
    setFlying(true);
    window.setTimeout(() => {
      const impact = norm(180 - rot.current);
      const hit = pegsRef.current.some((peg) => gap(peg.angle, impact) < (peg.wide ? 24 : 15));
      if (hit) {
        setNote("Задел. Этот пень заново.");
        setFlying(false);
        busy.current = false;
        load(stage);
        return;
      }
      if (appleRef.current !== null && gap(appleRef.current, impact) < 16) {
        appleRef.current = null;
        setApple(null);
        setNote("Яблоко. Приятно.");
      }
      const nextPegs = [...pegsRef.current, { angle: impact }];
      pegsRef.current = nextPegs;
      setPegs(nextPegs);
      const rest = left - 1;
      if (rest <= 0) {
        const next = stage + 1;
        setStage(next);
        remember(next);
        load(next);
      } else {
        setLeft(rest);
      }
      setFlying(false);
      busy.current = false;
    }, 140);
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pt-6 pb-10">
      <Link to="/games" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted">
        <ArrowLeft className="size-4" aria-hidden="true" />
        К играм
      </Link>
      <div className="mt-3 flex items-end justify-between">
        <h1 className="font-display text-4xl font-semibold">Пенёк</h1>
        <p className="text-sm text-muted">
          Круг {stage}
          <span className="block">Дальше всех: {best}</span>
        </p>
      </div>
      <p className="mt-2 text-muted">{note}</p>
      <p className="text-sm text-caramel">Осталось попасть: {left}</p>

      <button
        type="button"
        onClick={throwPeg}
        aria-label="Бросить колышек"
        className="relative mt-8 flex flex-1 flex-col items-center"
      >
        <svg ref={disc} viewBox="0 0 300 300" className="size-72 origin-center">
          <circle cx="150" cy="150" r="78" className="fill-caramel" />
          <circle cx="150" cy="150" r="46" className="fill-none stroke-caramel-deep" strokeWidth="3" />
          {apple !== null ? <circle cx={spot(apple, 108).x} cy={spot(apple, 108).y} r="9" className="fill-leaf" /> : null}
          {pegs.map((peg, index) => {
            const inner = spot(peg.angle, 62);
            const outer = spot(peg.angle, peg.wide ? 126 : 116);
            return (
              <line
                key={`${peg.angle}-${index}`}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                className="stroke-ink"
                strokeWidth={peg.wide ? 9 : 5}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        <span
          className={
            flying
              ? "mt-2 block h-16 w-2 rounded-full bg-caramel transition-transform"
              : "mt-10 block h-16 w-2 rounded-full bg-caramel"
          }
        />
      </button>
    </div>
  );
}
