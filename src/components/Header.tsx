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
 *   Mitte  – Öffentliche Links + Fanshop-Pill (Desktop) – rollenbasierte Bereiche liegen im Account-Menü
 *   Rechts – UserDropdown + Hamburger (Mobile)
 *
 * Platzverteilung auf Mobile (Fix 2026-07-30): Vorher saß der Fanshop-Button in
 * der rechten Gruppe. Zusammen mit „Anmelden" + „Registrieren" belegte die
 * rechte Seite bei 375 px Breite 251 von 343 nutzbaren Pixeln – die linke Gruppe
 * wurde von 196 auf 109 px zusammengedrückt, wodurch das Stadtwappen über den
 * Chevron des Vereins-Switchers rutschte und ihn unklickbar machte (gemessen).
 * Zwei Gegenmaßnahmen, beide nötig:
 *   1. Der Fanshop wandert in die Navigation (Desktop-Pill + eigener Block im
 *      Mobile-Menü) und der „Registrieren"-Button erscheint erst ab `sm`
 *      (UserDropdown) – auf ganz kleinen Screens führt „Anmelden" zur
 *      Login-Seite, die selbst zur Registrierung verlinkt.
 *   2. Die linke Gruppe darf nicht mehr beliebig schrumpfen: `min-w-0` am
 *      Container, `shrink-0` an Wappen/Switcher, `truncate` am Namen. Damit
 *      kann kein Element mehr über den Switcher wandern, auch wenn später
 *      etwas dazukommt.
 *
 * Breakpoints (gemessen, nicht geschätzt): Die Desktop-Nav startet bei `lg`
 * statt `md`, und der volle Vereinsname erscheint erst ab `xl` – darunter steht
 * die Kurzform neben dem Wappen. Grund: Bei 768 px belegen fünf Nav-Links,
 * Fanshop und zwei Auth-Buttons zusammen 732 von 736 nutzbaren Pixeln, bei
 * 1024 px lässt derselbe Block nur 260 px für die Marke – der volle Name
 * braucht allein 210 px plus Wappen und Switcher. Auf `main` lief der Header
 * bei 768 px deshalb um 172 px über (verifiziert), der Vereinsname war dort
 * schon vorher abgeschnitten. Tablets bedienen jetzt also das Hamburger-Menü.
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

        {/* Linke Gruppe: Hamburger (mobil, Konvention links) + Wappen + Name.
            min-w-0 erlaubt dem Namen zu truncaten, statt die Gruppe als Ganzes
            über ihre Nachbarn zu schieben. */}
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={menuOpen}
            className="-ml-1 shrink-0 rounded p-1 text-fcb-text transition-colors hover:text-fcb-accent lg:hidden"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Vereinswappen (+ Stadtwappen nur FCB) + Name */}
          <Link href="/" className="flex min-w-0 items-center gap-2">
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
              className="h-9 w-9 shrink-0 object-contain drop-shadow-lg"
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
                className="shrink-0 opacity-70"
              />
            )}
            <span className="hidden truncate font-oswald text-lg font-semibold uppercase tracking-wide text-fcb-text xl:inline">
              {tenant.name}
            </span>
            <span className="truncate font-oswald text-base font-bold uppercase tracking-wide text-fcb-text xl:hidden">
              {tenant.kurzname}
            </span>
          </Link>

          {/* Vereins-Switcher: echter Wechsel zwischen FCB- und JFG-Domain.
              Muss auf jeder Breite bedienbar bleiben – siehe Kommentar oben. */}
          <VereinsSwitcher />
        </div>

        {/* Desktop Nav: öffentliche Links + Fanshop als hervorgehobene Pill –
            rollenbasierte Bereiche liegen im Account-Menü.
            gap-5 statt gap-6, weil die Fanshop-Pill zusätzlich Platz braucht
            (bei 768 px sonst Overflow – gemessen). */}
        <div className="hidden items-center gap-5 lg:flex">
          {tenant.navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="whitespace-nowrap font-inter text-sm font-medium text-fcb-text/85 transition-colors hover:text-fcb-accent"
            >
              {label}
            </Link>
          ))}
          {/* Fanshop bleibt hervorgehoben (gefüllter Akzent), sitzt aber jetzt
              als letzter Nav-Punkt statt in der rechten Button-Gruppe. */}
          {fanshopLink && (
            <Link
              href={fanshopLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-fcb-accent px-3 py-1.5 font-inter text-xs font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
            >
              <ShoppingBag size={16} aria-hidden />
              Fanshop
            </Link>
          )}
        </div>

        {/* Rechte Seite: nur noch Auth. shrink-0, damit die Buttons ihre Breite
            nicht auf Kosten der linken Gruppe (Switcher!) ausdehnen. */}
        <div className="flex shrink-0 items-center gap-3">
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
            className="overflow-hidden border-t border-fcb-border bg-fcb-surface/95 lg:hidden"
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

              {/* Fanshop: eigener Block unter einer Trennlinie, damit er im Menü
                  genauso auffällt wie vorher im Header (gefüllter Akzent, volle
                  Breite). Öffnet extern – deshalb target/rel wie beim Desktop. */}
              {fanshopLink && (
                <>
                  <div className="mt-2 h-px bg-fcb-border" aria-hidden />
                  <Link
                    href={fanshopLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-fcb-accent px-4 py-2.5 font-oswald text-sm font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
                  >
                    <ShoppingBag size={16} aria-hidden />
                    Fanshop
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
