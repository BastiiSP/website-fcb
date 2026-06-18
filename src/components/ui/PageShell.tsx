type MaxWidth = "md" | "lg" | "xl" | "2xl";

const WIDTHS: Record<MaxWidth, string> = {
  md: "max-w-md",
  lg: "max-w-3xl",
  xl: "max-w-4xl",
  "2xl": "max-w-6xl",
};

/**
 * Einheitlicher In-Chrome-Seitenrahmen: malt die Theme-Leinwand (bg-fcb-bg) als
 * volle Höhe und zentriert den Inhalt. Pendant zu PitchAuthShell (immersiv).
 */
export default function PageShell({
  maxWidth = "2xl",
  className = "",
  children,
}: {
  maxWidth?: MaxWidth;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-fcb-bg">
      <div className={`mx-auto w-full px-4 py-10 ${WIDTHS[maxWidth]} ${className}`}>
        {children}
      </div>
    </div>
  );
}
