import type { Metadata } from "next";
import LoadingScreen from "./_components/LoadingScreen";
import VariantSwitcher from "./_components/VariantSwitcher";
import VariantsNavbar from "./_components/VariantsNavbar";

/**
 * Layout für die Design-Exploration unter /variants/*.
 *
 * Architektur:
 * - Eigener dunkler Theme-Kontext (zinc-950 + weißer Text), unabhängig vom Root-Theme
 * - LoadingScreen (FCB-Wappen, ~1,5 s) erscheint einmal pro Session
 * - VariantSwitcher als dünne Top-Bar zum schnellen Vergleich V1–V4
 * - VariantsNavbar (smart-sticky) direkt darunter
 * - Children = die jeweilige Hero-Variante
 *
 * Wichtig: Header/Footer der Live-Seite sind hier bewusst NICHT vorhanden –
 * das wird in ConditionalChrome (Root-Layout) gesteuert.
 */
export const metadata: Metadata = {
  title: "FCB · Design Exploration",
  description: "Visuelle Design-Varianten für die FCB-Startseite.",
};

export default function VariantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 font-inter text-white antialiased selection:bg-fcb-blue selection:text-white">
      <LoadingScreen />
      <VariantSwitcher />
      <VariantsNavbar />
      {children}
    </div>
  );
}
