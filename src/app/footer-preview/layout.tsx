import type { Metadata } from "next";
import FooterSwitcher from "./_components/FooterSwitcher";

/**
 * Layout für die Footer-Design-Exploration unter /footer-preview/*.
 * Eigenes Full-Bleed-Chrome (Switcher oben), die globale Header/Footer-Chrome
 * wird in ConditionalChrome für diese Routen ausgeblendet.
 * flex-col + flex-1-Filler im Page drückt den jeweiligen Footer ans Seitenende.
 */
export const metadata: Metadata = {
  title: "FCB · Footer-Varianten",
  description: "Vergleich der Footer-Designs (Design-Runde 2).",
};

export default function FooterPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-fcb-bg font-inter text-fcb-text antialiased">
      <FooterSwitcher />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
