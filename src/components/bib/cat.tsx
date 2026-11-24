export function BibCat({ className = "" }: { className?: string }) {
  return (
    <img
      src="/bib.png"
      alt=""
      draggable={false}
      className={`bib-float pointer-events-none select-none ${className}`}
    />
  );
}
