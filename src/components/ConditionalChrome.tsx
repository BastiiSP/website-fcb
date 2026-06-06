"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * Rendert Header + main + Footer für alle bestehenden Routes,
 * unterdrückt aber Header/Footer/main-Padding für die Design-Exploration-Routen
 * unter /variants/* und /footer-preview/*. Wird einmalig im root layout.tsx gewrappt.
 *
 * Hintergrund: Die /variants- und /footer-preview-Routes brauchen eine eigene
 * Navbar und Full-Bleed-Hintergründe. Statt das gesamte Root-Layout zu
 * duplizieren, blenden wir hier pathname-basiert die globale Chrome aus. So
 * bleibt jede bestehende Route (/, /login, /kalender, /vorstand, ...) optisch
 * 100 % identisch.
 */
export default function ConditionalChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  // Preview-Routen mit eigenem Full-Bleed-Layout (Design-Exploration):
  // /variants/* (Hero, historisch), /footer-preview/* (Footer-Varianten, Runde 2)
  // sowie /navbar-preview/* + /dropdown-preview/* (Auth-Bereich-Varianten, Runde 2).
  const isPreviewRoute =
    pathname.startsWith("/variants") ||
    pathname.startsWith("/footer-preview") ||
    pathname.startsWith("/navbar-preview") ||
    pathname.startsWith("/dropdown-preview");

  if (isPreviewRoute) {
    // Full-Bleed: kein globaler Header/Footer, kein main-Padding. Das jeweilige
    // layout.tsx der Preview-Route übernimmt sein eigenes Chrome.
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="pt-14">{children}</main>
      <Footer />
    </>
  );
}
