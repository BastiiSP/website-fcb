// Basis-Fläche des Design-Systems: Surface-Card mit Border und 2xl-Radius.
// `interactive` und `accent` sind optionale Erweiterungen (Design-Spec
// „Cards & Flächen") – Bestandsnutzung mit nur className/children bleibt
// unverändert. Bewusst Server-tauglich (kein "use client"): Hover läuft
// über CSS-Transition, nicht über Framer Motion.

// "brand" = Marken-Akzent des aufgerufenen Auftritts (fcb-accent, tenant-abhängig).
// "blue"/"red" = feste Trägerfarben für die Mannschaftszuordnung (FCB/JFG) –
// die bleiben bewusst tenant-unabhängig.
type Accent = "brand" | "blue" | "red";

// Erbt Standard-Div-Props (Events etc.), damit z. B. der Spotlight-Effekt
// seinen onMouseMove direkt auf der Card registrieren kann – CSS-Variablen
// auf einem Eltern-Element würden von den .spotlight-card-Defaults
// überschrieben.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
  /**
   * Hover-Affordanz für klickbare/verlinkte Cards: Border färbt sich zum
   * Akzent (Standard blau, bei accent="red" rot). Statische Cards ohne.
   */
  interactive?: boolean;
  /**
   * Akzentkante links (4 px). "brand" = Marken-Akzent des Auftritts,
   * "blue"/"red" = feste Trägerfarbe einer Mannschaft (FCB = blue, JFG = red).
   */
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
  brand: "border-l-4 border-l-fcb-accent",
  blue: "border-l-4 border-l-fcb-blue",
  red: "border-l-4 border-l-fcb-red",
};

// Hover färbt die gesamte Border zum Akzent – die Farbänderung ist die
// Affordanz, bewusst ohne Scale/Lift (Design-Spec). focus-within deckt
// Cards ab, deren Inhalt ein Link/Button ist (Tastatur-Navigation).
const INTERACTIVE: Record<Accent, string> = {
  brand:
    "transition-colors duration-200 hover:border-fcb-accent focus-within:border-fcb-accent",
  blue: "transition-colors duration-200 hover:border-fcb-blue focus-within:border-fcb-blue",
  red: "transition-colors duration-200 hover:border-fcb-red focus-within:border-fcb-red",
};

export default function Card({
  className = "",
  children,
  interactive = false,
  accent,
  padding = "md",
  ...rest
}: CardProps) {
  const accentCls = accent ? ACCENT_EDGE[accent] : "";
  // Ohne expliziten Träger-Akzent hovert die Card im Marken-Akzent.
  const interactiveCls = interactive ? INTERACTIVE[accent ?? "brand"] : "";
  const paddingCls = padding === "none" ? "" : "p-6";
  return (
    <div
      className={`rounded-2xl border border-fcb-border bg-fcb-surface ${paddingCls} ${accentCls} ${interactiveCls} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
