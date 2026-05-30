import type { Metadata } from "next";
import CarouselSwitcher from "./_components/CarouselSwitcher";

/**
 * Layout für die Instagram-Carousel-Exploration unter /instagram/*.
 *
 * Analog zum Hero-Playground (src/app/variants/layout.tsx):
 * - Eigener dunkler Theme-Kontext (zinc-950 + weißer Text)
 * - CarouselSwitcher als dünne Top-Bar zum schnellen Vergleich A–D
 * - Bewusst ohne Header/Footer der Live-Seite (ConditionalChrome im Root-Layout)
 *
 * Reiner Vergleichsraum – wird nicht auf main gemerged. Basti wählt hier seinen
 * Favoriten und übernimmt ihn anschließend in die Startseite.
 */
export const metadata: Metadata = {
  title: "FCB · Instagram-Varianten",
  description: "Vier Carousel-Varianten für den Instagram-Feed der FCB-Startseite.",
};

export default function InstagramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 font-inter text-white antialiased selection:bg-fcb-blue selection:text-white">
      <CarouselSwitcher />
      {children}
    </div>
  );
}
