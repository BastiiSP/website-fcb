"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, ShoppingBag, X } from "lucide-react";
import UserDropdown from "@/components/UserDropdown";
import VereinsSwitcher from "@/components/VereinsSwitcher";
import { useTenant } from "@/components/tenant/TenantProvider";
import { VEREINSLINKS } from "@/lib/vereinslinks";

/**
 * Globaler Header – Smart-Sticky, fcb-Design-Tokens, Marken-Wappen, öffentliche Nav-Links.
 *
 * Multi-Tenant: Wappen, Vereinsname und Nav-Links kommen aus der Marken-Config
 * (`useTenant()`), damit dieselbe Komponente FCB und JFG bedient. Insbesondere die
 * Nav-Liste wird nur konsumiert – welche Links eine Marke hat (JFG z. B. ohne
 * „Sportheim"), entscheidet ausschließlich `src/lib/tenant.ts`.
 *
 * Smart-Sticky: verschwindet beim Scrollen nach unten (delta > 5, scrollY > 80),
 * erscheint beim Scrollen nach oben (delta < -5). Pattern übernommen von VariantsNavbar.
 *
 * Struktur:
 *   Links  – Vereinswappen (+ Stadtwappen nur FCB) + Vereinsname (Oswald) + Vereins-Switcher
 *   Mitte  – Öffentliche Links (Desktop) – rollenbasierte Bereiche liegen im Account-Menü
 *   Rechts – UserDropdown + Hamburger (Mobile)
 */
export default function Header() {
  const tenant = useTenant();
  // Fanshop prominent im Header verlinken (auf Bastis Wunsch) – jede Marke
  // ihr eigener Shop, aus derselben Datenquelle wie der Kontakt-Link.
  const fanshopLink = VEREINSLINKS[tenant.id].find((l) => l.icon === "shop");
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
            className="-ml-1 rounded p-1 text-fcb-text transition-colors hover:text-fcb-accent md:hidden"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Vereinswappen (+ Stadtwappen nur FCB) + Name */}
          <Link href="/" className="flex items-center gap-2">
            {/*
              Fixe 36-px-Box mit object-contain: die Marken liefern unterschiedliche
              Formate (FCB = SVG, JFG = PNG). Beide Dateien sind quadratisch, das
              Ergebnis ist für den FCB damit unverändert – object-contain schützt
              nur davor, dass ein später ausgetauschtes Wappen verzerrt wird.
            */}
            <Image
              src={tenant.logoSrc}
              alt={tenant.logoAlt}
              width={36}
              height={36}
              className="h-9 w-9 object-contain drop-shadow-lg"
            />
            {/*
              Stadtwappen: kleiner + gedämpft – signalisiert Hierarchie (FCB > Stadt).
              Nur beim FCB, weil die JFG als Fördergemeinschaft mehrere Orte umfasst;
              ein einzelnes Stadtwappen wäre dort inhaltlich falsch.
            */}
            {tenant.id === "fcb" && (
              <Image
                src="/stadtwappen-burgkunstadt.svg"
                alt="Stadtwappen Burgkunstadt"
                width={24}
                height={24}
                className="opacity-70"
              />
            )}
            <span className="hidden font-oswald text-lg font-semibold uppercase tracking-wide text-fcb-text sm:inline">
              {tenant.name}
            </span>
            <span className="font-oswald text-base font-bold uppercase tracking-wide text-fcb-text sm:hidden">
              {tenant.kurzname}
            </span>
          </Link>

          {/* Vereins-Switcher: Vorbereitung für den späteren FCB ↔ JFG-Wechsel (nur UI) */}
          <VereinsSwitcher />
        </div>

        {/* Desktop Nav: nur öffentliche Links – rollenbasierte Bereiche liegen im Account-Menü */}
        <div className="hidden items-center gap-6 md:flex">
          {tenant.navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="font-inter text-sm font-medium text-fcb-text/85 transition-colors hover:text-fcb-accent"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Rechte Seite: Fanshop (prominent, gefüllter Akzent-Button) + Auth */}
        <div className="flex items-center gap-3">
          {fanshopLink && (
            <Link
              href={fanshopLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-fcb-accent px-3 py-1.5 font-inter text-xs font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-90 sm:px-3.5 sm:text-sm"
            >
              <ShoppingBag size={16} aria-hidden />
              {/* Auf sehr kleinen Screens nur das Icon, Platz ist knapp neben Hamburger/Wappen.
                  Kein "xs"-Breakpoint im Projekt konfiguriert – "sm" ist die kleinste Stufe. */}
              <span className="hidden sm:inline">Fanshop</span>
            </Link>
          )}
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
              {tenant.navLinks.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="py-1.5 font-inter text-sm font-medium text-fcb-text/85 transition-colors hover:text-fcb-accent"
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
