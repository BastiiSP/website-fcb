import type { ReactNode } from "react";

/**
 * Vergleichsbühne für eine Dropdown-Variante: zeigt das aufgeklappte Dropdown
 * für „Ausgeloggt" und „Eingeloggt" als zwei beschriftete Panels nebeneinander
 * (auf Mobile gestapelt). Das Dropdown ist statisch dargestellt – kein Klick nötig.
 */
export default function DropdownStage({
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
        <Panel titel="Ausgeloggt-Dropdown">{ausgeloggt}</Panel>
        <Panel titel="Eingeloggt-Dropdown">{eingeloggt}</Panel>
      </div>
    </div>
  );
}

function Panel({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-fcb-border bg-fcb-bg p-6">
      <span className="mb-6 block font-inter text-xs uppercase tracking-widest text-fcb-muted">
        {titel}
      </span>
      {/* Dropdown zentriert darstellen – wirkt wie aufgeklappt unter der Navbar */}
      <div className="flex justify-center">{children}</div>
    </div>
  );
}
