"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import UserDropdown from "@/components/UserDropdown";

/**
 * Globaler Header – Smart-Sticky, fcb-Design-Tokens, beide Wappen, öffentliche Nav-Links.
 *
 * Smart-Sticky: verschwindet beim Scrollen nach unten (delta > 5, scrollY > 80),
 * erscheint beim Scrollen nach oben (delta < -5). Pattern übernommen von VariantsNavbar.
 *
 * Struktur:
 *   Links  – Vereinswappen + Stadtwappen + Vereinsname (Oswald) + Vereins-Switcher
 *   Mitte  – Öffentliche Links (Desktop) – rollenbasierte Bereiche liegen im Account-Menü
 *   Rechts – UserDropdown + Hamburger (Mobile)
 */
const PUBLIC_LINKS = [
  { label: "Verein", href: "/verein" },
  { label: "Mannschaften", href: "/mannschaften" },
  { label: "News", href: "/news" },
  { label: "Sportheim", href: "/sportheim" },
  { label: "Kontakt", href: "/kontakt" },
];

export default function Header() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [lastY, setLastY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const delta = latest - lastY;
    // Erst ab 80 px verstecken – verhindert Flackern bei kurzem Bounce am Top
    if (latest > 80 && delta > 5) {
      setHidden(true);
    } else if (delta < -5) {
      setHidden(false);
    }
    setLastY(latest);
  });

  return (
    <motion.header
      animate={{ y: hidden ? "-100%" : 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-fcb-border bg-fcb-surface/90 backdrop-blur-md"
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">

        {/* Linke Gruppe: Hamburger (mobil, Konvention links) + Wappen + Name */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={menuOpen}
            className="-ml-1 rounded p-1 text-fcb-text transition-colors hover:text-fcb-blue md:hidden"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Vereinswappen + Stadtwappen + Name */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Vereinslogo 1. FC 1911 Burgkunstadt"
              width={36}
              height={36}
              className="drop-shadow-lg"
            />
            {/* Stadtwappen: kleiner + gedämpft – signalisiert Hierarchie (FCB > Stadt) */}
            <Image
              src="/stadtwappen-burgkunstadt.svg"
              alt="Stadtwappen Burgkunstadt"
              width={24}
              height={24}
              className="opacity-70"
            />
            <span className="hidden font-oswald text-lg font-semibold uppercase tracking-wide text-fcb-text sm:inline">
              1. FC 1911 Burgkunstadt
            </span>
            <span className="font-oswald text-base font-bold uppercase tracking-wide text-fcb-text sm:hidden">
              FCB
            </span>
          </Link>
        </div>

        {/* Desktop Nav: nur öffentliche Links – rollenbasierte Bereiche liegen im Account-Menü */}
        <div className="hidden items-center gap-6 md:flex">
          {PUBLIC_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="font-inter text-sm font-medium text-fcb-text/85 transition-colors hover:text-fcb-blue"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Rechte Seite: Auth (Buttons ausgeloggt / Avatar eingeloggt) */}
        <div className="flex items-center">
          <UserDropdown />
        </div>
      </div>

      {/* Mobile Dropdown-Menü */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-t border-fcb-border bg-fcb-surface/95 md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {PUBLIC_LINKS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="py-1.5 font-inter text-sm font-medium text-fcb-text/85 transition-colors hover:text-fcb-blue"
                >
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
