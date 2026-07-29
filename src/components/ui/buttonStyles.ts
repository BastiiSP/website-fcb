// Gemeinsame Button-Optik für Button (Client) und ButtonLink (Server).
// Bewusst OHNE "use client": aus einem Client-Modul exportierte Funktionen
// dürfen in Server Components nicht aufgerufen werden – dieses reine
// Style-Modul ist auf beiden Seiten nutzbar.

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-oswald font-semibold uppercase tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent focus-visible:ring-offset-2 focus-visible:ring-offset-fcb-bg disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-fcb-accent text-white hover:bg-fcb-accent/90",
  secondary:
    "border border-fcb-border bg-fcb-surface text-fcb-text hover:border-fcb-accent",
  ghost: "text-fcb-text hover:text-fcb-accent",
  danger: "bg-fcb-red text-white hover:bg-fcb-red/90",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

/** Baut den kompletten Klassenstring einer Button-Optik zusammen. */
export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className = "",
): string {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
}
