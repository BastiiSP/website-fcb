import type { ReactNode } from "react";

/**
 * Repräsentative Mock-Navbar für die Varianten-Vorschau: zinc-Leiste (bg-fcb-nav)
 * mit Logo-Platzhalter links und einem Auth-Slot rechts. Zeigt jede Variante im
 * realistischen Navbar-Kontext, ohne die echte Navigation einzubinden.
 */
export default function NavbarMock({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-14 w-full items-center justify-between rounded-lg border border-fcb-border bg-fcb-nav px-4">
      {/* Logo-Platzhalter links – steht für Wappen + Vereinskürzel */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-fcb-blue" aria-hidden />
        <span className="font-oswald text-sm font-semibold uppercase tracking-wide text-white">
          FCB
        </span>
      </div>
      {/* Auth-Bereich rechts – hier rendert die jeweilige Variante */}
      <div className="flex items-center gap-3">{children}</div>
    </div>
  );
}
