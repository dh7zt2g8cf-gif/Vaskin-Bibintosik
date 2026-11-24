import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const fieldClass =
  "w-full rounded-2xl border border-line bg-card px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-muted focus:border-caramel";

export const primaryBtn =
  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-caramel px-4 text-base font-semibold text-card transition-colors hover:bg-caramel-deep disabled:opacity-50";

export const quietBtn =
  "inline-flex min-h-11 items-center justify-center rounded-2xl bg-blush px-3 text-sm font-semibold text-ink transition-colors hover:bg-line";

export function Page({
  title,
  lede,
  children,
}: {
  title: string;
  lede?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-lg px-5 pt-6 pb-28">
      <Link
        to="/"
        className="mb-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Назад
      </Link>
      <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">{title}</h1>
      {lede ? <p className="mt-2 max-w-sm text-muted">{lede}</p> : null}
      <div className="mt-6">{children}</div>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="px-2 py-10 text-center text-muted">{children}</p>;
}

export function LoadingLine() {
  return <p className="py-10 text-center text-muted">Открываю тетрадку…</p>;
}
