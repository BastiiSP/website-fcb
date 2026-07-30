"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import PitchAuthBackground from "./PitchAuthBackground";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useTenant } from "@/components/tenant/TenantProvider";

/**
 * Gemeinsame Hülle für alle echten Auth-Seiten im Pitch-Look:
 *   - ruhiger Spielfeld-Hintergrund (PitchAuthBackground)
 *   - zentrierte Glas-Card mit DÜNNEM Border-Glow (border-fcb-accent/30 + weicher
 *     blauer Außenschatten)
 *   - Wappen-Glow-Header (verlinkt auf "/") + Marken-Badge darunter
 *   - sanfter Card-Eintritt; bei reduzierter Bewegung neutralisiert
 *
 * Wappen, Alt-Text und Badge kommen aus der Marken-Konfiguration (`useTenant()`),
 * damit Login/Registrieren/Confirm auf der JFG-Domain nicht mehr das FCB-Wappen
 * und „1911 Schuhstädter" zeigen (Live-Fund 2026-07-30).
 */
export default function PitchAuthShell({ children }: { children: React.ReactNode }) {
  const tenant = useTenant();
  const reduzierteBewegung = useReducedMotion();
  const cardMotion = reduzierteBewegung
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.45, ease: "easeOut" as const },
      };

  return (
    // Auth-Seiten folgen jetzt dem globalen Theme (hell/dunkel); `.dark` wurde
    // entfernt, damit bg-fcb-bg und alle fcb-*-Tokens korrekt flippen.
    <div className="relative min-h-screen overflow-hidden bg-fcb-bg">
      <PitchAuthBackground />

      {/* Theme-Switcher oben rechts – Auth-Seiten haben keinen Footer */}
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-16">
        <motion.div
          {...cardMotion}
          // Border-Glow ist statisch dezent; beim Hover wird er sanft verstärkt
          // (hellerer Rand + kräftigerer Schatten), weicher Übergang.
          className="w-full max-w-md rounded-2xl border border-fcb-accent/30 bg-fcb-surface/80 p-6 shadow-[0_0_40px_-12px_rgb(var(--color-accent)/0.45)] backdrop-blur-xl transition-[border-color,box-shadow] duration-300 hover:border-fcb-accent/60 hover:shadow-[0_0_60px_-10px_rgb(var(--color-accent)/0.65)] sm:p-8"
        >
          {/* Wappen-Glow-Header – Wappen verlinkt zurück zur Startseite (Ausstieg). */}
          <div className="flex flex-col items-center text-center">
            <Link href="/" aria-label="Zur Startseite" className="relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent">
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 scale-150 blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgb(var(--color-accent) / 0.55) 0%, rgb(var(--color-accent) / 0) 70%)",
                }}
              />
              <Image
                src={tenant.logoSrc}
                alt={tenant.logoAlt}
                width={72}
                height={72}
                priority
                // object-contain wie im Header: das JFG-Wappen ist ein PNG, das
                // in der quadratischen Box nicht verzerrt werden darf.
                className="h-16 w-16 object-contain drop-shadow-[0_0_24px_rgb(var(--color-accent)/0.6)] sm:h-20 sm:w-20"
              />
            </Link>

            <div className="mt-4 flex items-center gap-3">
              <span className="h-0.5 w-12 bg-fcb-text/20" aria-hidden="true" />
              <span className="font-oswald text-xs uppercase tracking-[0.2em] text-fcb-muted">
                <span className="text-fcb-accent">{tenant.heroBadge.links}</span>{" "}
                {tenant.heroBadge.rechts}
              </span>
              <span className="h-0.5 w-12 bg-fcb-text/20" aria-hidden="true" />
            </div>
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
}
