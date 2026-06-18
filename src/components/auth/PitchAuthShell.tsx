"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import PitchAuthBackground from "./PitchAuthBackground";

/**
 * Gemeinsame Hülle für alle echten Auth-Seiten im Pitch-Look:
 *   - ruhiger Spielfeld-Hintergrund (PitchAuthBackground)
 *   - zentrierte Glas-Card mit DÜNNEM Border-Glow (border-fcb-blue/30 + weicher
 *     blauer Außenschatten)
 *   - Wappen-Glow-Header (verlinkt auf "/") + "1911 Schuhstädter"-Motiv
 *   - sanfter Card-Eintritt; bei reduzierter Bewegung neutralisiert
 */
export default function PitchAuthShell({ children }: { children: React.ReactNode }) {
  const reduzierteBewegung = useReducedMotion();
  const cardMotion = reduzierteBewegung
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.45, ease: "easeOut" as const },
      };

  return (
    // Auth-Seiten sind bewusst in beiden Themes dunkel (immersives Marken-Erlebnis,
    // konsistent mit dem Hero); `.dark` scopt die Palette auf den Auth-Subtree.
    <div className="dark relative min-h-screen overflow-hidden bg-fcb-bg">
      <PitchAuthBackground />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-16">
        <motion.div
          {...cardMotion}
          // Border-Glow ist statisch dezent; beim Hover wird er sanft verstärkt
          // (hellerer Rand + kräftigerer Schatten), weicher Übergang.
          className="w-full max-w-md rounded-2xl border border-fcb-blue/30 bg-fcb-surface/80 p-6 shadow-[0_0_40px_-12px_rgba(29,95,173,0.45)] backdrop-blur-xl transition-[border-color,box-shadow] duration-300 hover:border-fcb-blue/60 hover:shadow-[0_0_60px_-10px_rgba(29,95,173,0.65)] sm:p-8"
        >
          {/* Wappen-Glow-Header – Wappen verlinkt zurück zur Startseite (Ausstieg). */}
          <div className="flex flex-col items-center text-center">
            <Link href="/" aria-label="Zur Startseite" className="relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue">
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 scale-150 blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(29,95,173,0.55) 0%, rgba(29,95,173,0) 70%)",
                }}
              />
              <Image
                src="/logo.svg"
                alt="1. FC 1911 Burgkunstadt"
                width={72}
                height={72}
                priority
                className="h-16 w-16 drop-shadow-[0_0_24px_rgba(29,95,173,0.6)] sm:h-20 sm:w-20"
              />
            </Link>

            <div className="mt-4 flex items-center gap-3">
              <span className="h-0.5 w-12 bg-white/30" aria-hidden="true" />
              <span className="font-oswald text-xs uppercase tracking-[0.2em] text-fcb-muted">
                <span className="text-fcb-blue">1911</span> Schuhstädter
              </span>
              <span className="h-0.5 w-12 bg-white/30" aria-hidden="true" />
            </div>
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
}
