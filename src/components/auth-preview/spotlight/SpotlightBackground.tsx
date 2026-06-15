"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Dominantes Hintergrund-Visual für die Spotlight-Variante.
 * Ein übergroßes FCB-Wappen läuft an der rechten Kante aus dem Bild und
 * trägt einen kräftigen blauen Glow. Eine zentrale Vignette dunkelt die
 * Ränder ab, damit die schwebende Card lesbar bleibt.
 *
 * Die rgba(29,95,173,…)-Werte entsprechen fcb-blue (#1d5fad) und sind laut
 * Design-Spec als einzige Roh-Farbe für Glows/Verläufe erlaubt.
 */
export default function SpotlightBackground() {
  const reduzierteBewegung = useReducedMotion();

  // Sehr langsames „Atmen" des Wappen-Glows; bei reduzierter Bewegung statisch.
  const glowMotion = reduzierteBewegung
    ? undefined
    : { opacity: [0.5, 0.75, 0.5], scale: [1, 1.06, 1] };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden bg-fcb-bg"
    >
      {/* Radialer Lichtkegel hinter dem Wappen (der „Spotlight") */}
      <motion.div
        className="absolute -right-24 top-1/2 h-[42rem] w-[42rem] -translate-y-1/2 rounded-full blur-3xl sm:-right-16"
        style={{
          background:
            "radial-gradient(circle, rgba(29,95,173,0.55) 0%, rgba(29,95,173,0.12) 45%, transparent 72%)",
        }}
        animate={glowMotion}
        transition={{
          duration: 9,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />

      {/* Übergroßes Wappen, das an der rechten Kante ausläuft */}
      <div className="absolute -right-32 top-1/2 -translate-y-1/2 sm:-right-24 lg:right-[6%]">
        <Image
          src="/logo.svg"
          alt=""
          width={620}
          height={620}
          priority
          className="h-[34rem] w-[34rem] opacity-25 drop-shadow-[0_0_60px_rgba(29,95,173,0.45)] sm:h-[40rem] sm:w-[40rem] lg:opacity-30"
        />
      </div>

      {/* Inhalts-Vignette: dunkelt Ränder ab, hält die Card-Zone lesbar */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(9,9,11,0.85) 100%)",
        }}
      />
    </div>
  );
}
