"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

import { useTenant } from "@/components/tenant/TenantProvider";
import {
  TENANTS,
  pfadExistiertBeiTenant,
  switchUrl,
  type TenantId,
} from "@/lib/tenant";
import { getTeamAccent } from "@/lib/teams";

/**
 * Vereins-Switcher im Header – echter Wechsel zwischen den beiden Auftritten
 * der Vereinsfamilie (FCB und JFG Kunstadt-Obermain).
 *
 * Ein dezenter Chevron-Trigger neben dem Vereinsnamen öffnet ein Flyout mit
 * beiden Marken. Aktiv markiert (Akzentkante + Check) ist immer die Marke des
 * aktuellen Tenants – auf der JFG-Domain also die JFG. Der jeweils andere
 * Eintrag ist ein echter `<a href>` auf die Zieldomain: Es ist ein
 * Domainwechsel, also braucht es eine volle Navigation und keinen
 * Client-Router-Push.
 *
 * Zielpfad: `switchUrl()` übernimmt den aktuellen Pfad nur, wenn er auf beiden
 * Auftritten existiert, und fällt sonst auf die Startseite zurück (aktuell nur
 * bei `/sportheim`, das es ausschließlich beim FCB gibt). Genau dieser Fall
 * bekommt einen kurzen Hinweistext im Eintrag, damit der Sprung zur Startseite
 * nicht wie ein Fehler wirkt.
 *
 * Farben: Marken-Chrome (Akzentkante, Check, Hover-Tint, Fokus-Ring) nutzt das
 * tenant-abhängige `fcb-accent` – der Switcher färbt sich also mit dem Auftritt
 * mit. Die Identität der Einträge selbst bleibt tenant-unabhängig: Der Ring um
 * das Wappen trägt die feste Trägerfarbe (FCB blau, JFG rot) aus
 * `getTeamAccent()`, damit der FCB-Eintrag auch von der JFG-Domain aus blau ist.
 *
 * Positionierung: Der Header (motion.header) ist durch seinen Transform der
 * Containing Block für absolute Nachfahren. Auf Mobile nutzt das Panel deshalb
 * die volle Header-Breite (left-4/right-4, unterhalb der 56-px-Leiste), ab sm
 * ankert es klassisch am Trigger (Wrapper wird sm:relative).
 */

// Feste Anzeigereihenfolge – der Hauptverein steht oben, unabhängig davon,
// über welche Domain der Switcher aufgerufen wird (keine springende Liste).
const REIHENFOLGE: TenantId[] = ["fcb", "jfg"];

export default function VereinsSwitcher() {
  const tenant = useTenant();
  // usePathname() ist typseitig nullable (z. B. außerhalb des App-Routers) –
  // dann verhält sich der Wechsel wie von der Startseite aus.
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Outside-Click und Escape schließen das Flyout (Escape gibt den Fokus zurück)
  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  // Gemeinsame Optik beider Einträge – der aktive ist ein Button (schließt nur),
  // der andere ein Link auf die Zieldomain.
  const eintragKlassen =
    "relative flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-fcb-accent/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent";

  return (
    <div ref={wrapperRef} className="sm:relative">
      {/* Trigger: nur ein Chevron – bewusst leise, der Vereinsname bleibt der Star */}
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        aria-label={`Verein wechseln – aktuell ${tenant.kurzname}`}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center rounded p-1 text-fcb-muted transition-colors hover:text-fcb-text focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent"
      >
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex"
        >
          <ChevronDown size={16} aria-hidden />
        </motion.span>
      </button>

      {/* Flyout: Vereinsfamilie */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="vereins-flyout"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-4 right-4 top-16 z-50 rounded-2xl border border-fcb-border bg-fcb-surface p-2 shadow-lg sm:left-0 sm:right-auto sm:top-full sm:mt-2 sm:w-80"
          >
            <p className="px-3 pb-1 pt-2 font-oswald text-[11px] font-semibold uppercase tracking-widest text-fcb-muted">
              Vereinsfamilie
            </p>

            {REIHENFOLGE.map((id, index) => {
              const eintrag = TENANTS[id];
              const istAktiv = id === tenant.id;
              // Feste Trägerfarbe des Vereins – bewusst NICHT fcb-accent,
              // damit der FCB-Eintrag auch auf der JFG-Domain blau bleibt.
              const traegerAkzent = getTeamAccent(eintrag.traeger);
              // Markenexklusiver Pfad (z. B. /sportheim): switchUrl landet dann
              // auf der Startseite – das machen wir im Eintrag transparent.
              const faelltAufStartseite =
                !istAktiv && !pfadExistiertBeiTenant(pathname, id);

              const inhalt = (
                <>
                  {/* Akzentkante nur beim aktiven Auftritt – Marken-Akzent */}
                  {istAktiv && (
                    <span
                      className="absolute bottom-2.5 left-0 top-2.5 w-[3px] rounded-r bg-fcb-accent"
                      aria-hidden
                    />
                  )}
                  {/* 36-px-Kreis: FCB ist ein SVG, JFG eine quadratische PNG –
                      object-contain in fester 24-px-Box lässt beide gleich sitzen */}
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border ${traegerAkzent.border} bg-fcb-bg`}
                  >
                    <Image
                      src={eintrag.logoSrc}
                      alt={eintrag.logoAlt}
                      width={24}
                      height={24}
                      className="h-6 w-6 object-contain"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-oswald text-[13px] font-semibold uppercase leading-tight tracking-wide text-fcb-text">
                      {eintrag.name}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-fcb-muted">
                      {eintrag.untertitel}
                    </span>
                    {faelltAufStartseite && (
                      <span className="mt-1 block text-[11px] text-fcb-muted">
                        Diese Seite gibt es dort nicht – führt zur Startseite.
                      </span>
                    )}
                  </span>
                  {istAktiv && (
                    <Check
                      size={16}
                      className="shrink-0 text-fcb-accent"
                      aria-hidden
                    />
                  )}
                </>
              );

              return (
                <Fragment key={id}>
                  {index > 0 && (
                    <div className="mx-2 my-1 h-px bg-fcb-border" aria-hidden />
                  )}
                  {istAktiv ? (
                    // Eigener Auftritt: kein Domainwechsel, nur Flyout schließen
                    <button
                      onClick={() => setOpen(false)}
                      aria-current="true"
                      aria-label={`${eintrag.name} – aktueller Auftritt`}
                      className={eintragKlassen}
                    >
                      {inhalt}
                    </button>
                  ) : (
                    // Andere Marke: echter Link, weil es eine andere Domain ist
                    <a
                      href={switchUrl(id, pathname)}
                      onClick={() => setOpen(false)}
                      aria-label={
                        faelltAufStartseite
                          ? `Zu ${eintrag.name} wechseln – öffnet dort die Startseite`
                          : `Zu ${eintrag.name} wechseln`
                      }
                      className={eintragKlassen}
                    >
                      {inhalt}
                    </a>
                  )}
                </Fragment>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
