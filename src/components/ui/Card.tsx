// Basis-Fläche des Design-Systems: Surface-Card mit Border und 2xl-Radius.
// `interactive` und `accent` sind optionale Erweiterungen (Design-Spec
// „Cards & Flächen") – Bestandsnutzung mit nur className/children bleibt
// unverändert. Bewusst Server-tauglich (kein "use client"): Hover läuft
// über CSS-Transition, nicht über Framer Motion.

type Accent = "blue" | "red";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  /**
   * Hover-Affordanz für klickbare/verlinkte Cards: Border färbt sich zum
   * Akzent (Standard blau, bei accent="red" rot). Statische Cards ohne.
   */
  interactive?: boolean;
  /** Akzentkante links (4 px) in Trägerfarbe – FCB = blue, JFG = red. */
  accent?: Accent;
  /**
   * Innenabstand: "md" = p-6 (Standard), "none" für randlose Inhalte
   * (z. B. Bild bündig bis zur Kante) – ein p-0 über className würde
   * gegen das eingebaute p-6 in der Stylesheet-Reihenfolge verlieren.
   */
  padding?: "md" | "none";
}

// Vollständige Klassen-Literale statt String-Bau ("border-l-fcb-" + accent),
// damit der Tailwind-Scanner die Klassen sicher findet.
const ACCENT_EDGE: Record<Accent, string> = {
  blue: "border-l-4 border-l-fcb-blue",
  red: "border-l-4 border-l-fcb-red",
};

// Hover färbt die gesamte Border zum Akzent – die Farbänderung ist die
// Affordanz, bewusst ohne Scale/Lift (Design-Spec). focus-within deckt
// Cards ab, deren Inhalt ein Link/Button ist (Tastatur-Navigation).
const INTERACTIVE: Record<Accent, string> = {
  blue: "transition-colors duration-200 hover:border-fcb-blue focus-within:border-fcb-blue",
  red: "transition-colors duration-200 hover:border-fcb-red focus-within:border-fcb-red",
};

export default function Card({
  className = "",
  children,
  interactive = false,
  accent,
  padding = "md",
}: CardProps) {
  const accentCls = accent ? ACCENT_EDGE[accent] : "";
  const interactiveCls = interactive ? INTERACTIVE[accent ?? "blue"] : "";
  const paddingCls = padding === "none" ? "" : "p-6";
  return (
    <div
      className={`rounded-2xl border border-fcb-border bg-fcb-surface ${paddingCls} ${accentCls} ${interactiveCls} ${className}`}
    >
      {children}
    </div>
  );
}
