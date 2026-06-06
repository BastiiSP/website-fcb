import type { ReactNode } from "react";

/**
 * Vergleichsbühne für eine Navbar-Variante: zeigt „Ausgeloggt" und „Eingeloggt"
 * als zwei beschriftete Panels nebeneinander (auf Mobile gestapelt).
 */
export default function PreviewStage({
  beschreibung,
  ausgeloggt,
  eingeloggt,
}: {
  beschreibung: string;
  ausgeloggt: ReactNode;
  eingeloggt: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <p className="mx-auto mb-8 max-w-2xl text-center font-inter text-sm text-fcb-muted">
        {beschreibung}
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        <Panel titel="Ausgeloggt">{ausgeloggt}</Panel>
        <Panel titel="Eingeloggt">{eingeloggt}</Panel>
      </div>
    </div>
  );
}

function Panel({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-fcb-border bg-fcb-surface/40 p-5">
      <span className="mb-4 block font-inter text-xs uppercase tracking-widest text-fcb-muted">
        {titel}
      </span>
      {children}
    </div>
  );
}
