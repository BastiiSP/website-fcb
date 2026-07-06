import type { LucideIcon } from "lucide-react";

// Icon-Badge-Muster der Design-Spec („Icons"): ein Lucide-Icon in einem
// dezenten Container mit Tint-Fläche (Akzent/10 + Border Akzent/40).
// Einsatz: Feature-Aufzählungen, Card-Köpfe, Team-Cards, Empty-States.

type Accent = "neutral" | "blue" | "red";
type Size = "sm" | "md" | "lg";

// Tints folgen dem Badge-/Banner-Muster: /10-Fläche + /40-Border.
// Neutral nutzt Surface/Border-Tokens und funktioniert so in beiden Themes.
const ACCENTS: Record<Accent, string> = {
  neutral: "border-fcb-border bg-fcb-surface text-fcb-muted",
  blue: "border-fcb-blue/40 bg-fcb-blue/10 text-fcb-blue",
  red: "border-fcb-red/40 bg-fcb-red/10 text-fcb-red",
};

// Container- und Icon-Größe wachsen gemeinsam (Spec: 32/16, 40/20, 48/24).
// Kleinster Badge bekommt den kleineren Radius, damit er nicht rund wirkt.
const SIZES: Record<Size, { box: string; icon: number }> = {
  sm: { box: "h-8 w-8 rounded-lg", icon: 16 },
  md: { box: "h-10 w-10 rounded-xl", icon: 20 },
  lg: { box: "h-12 w-12 rounded-xl", icon: 24 },
};

interface IconBadgeProps {
  /** Lucide-Icon-Komponente, z. B. `Users` aus lucide-react. */
  icon: LucideIcon;
  accent?: Accent;
  size?: Size;
  /**
   * Deutsches Label, wenn das Icon Bedeutung trägt (dann role="img").
   * Ohne Label gilt das Badge als dekorativ und wird für Screenreader
   * ausgeblendet (aria-hidden).
   */
  label?: string;
  className?: string;
}

export default function IconBadge({
  icon: Icon,
  accent = "neutral",
  size = "md",
  label,
  className = "",
}: IconBadgeProps) {
  const s = SIZES[size];
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center border ${s.box} ${ACCENTS[accent]} ${className}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {/* Icon selbst ist immer dekorativ – die Bedeutung trägt das Label am Container */}
      <Icon size={s.icon} strokeWidth={2} aria-hidden="true" />
    </span>
  );
}
