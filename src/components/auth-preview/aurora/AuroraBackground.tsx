"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Lebendiger, dunkler Hintergrund für die Aurora-Variante.
 * Mehrere große, unscharfe FCB-Blau-Blobs driften und skalieren langsam –
 * subtil, nicht grell. Bei reduzierter Bewegung werden die Blobs statisch
 * gerendert (keine Endlos-Animation).
 *
 * Die rgba(29,95,173,…)-Werte entsprechen fcb-blue (#1d5fad) und sind laut
 * Design-Spec als einzige Roh-Farbe für Glows/Verläufe erlaubt.
 */
export default function AuroraBackground() {
  const reduzierteBewegung = useReducedMotion();

  // Gemeinsamer Verlauf für die Blobs – nur Deckkraft variiert pro Blob.
  const blob = (deckkraft: number) =>
    `radial-gradient(circle, rgba(29,95,173,${deckkraft}) 0%, transparent 70%)`;

  return (
    // Hinter der Card, nicht interaktiv, überläuft nicht den Viewport.
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden bg-fcb-bg"
    >
      <motion.div
        className="absolute h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ top: "-6rem", left: "-4rem", background: blob(0.35) }}
        animate={
          reduzierteBewegung
            ? undefined
            : { x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }
        }
        transition={{
          duration: 18,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute h-[32rem] w-[32rem] rounded-full blur-3xl"
        style={{ bottom: "-8rem", right: "-6rem", background: blob(0.28) }}
        animate={
          reduzierteBewegung
            ? undefined
            : { x: [0, -50, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }
        }
        transition={{
          duration: 22,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute left-1/2 top-1/3 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: blob(0.22) }}
        animate={
          reduzierteBewegung
            ? undefined
            : { x: [-40, 40, -40], y: [0, 50, 0], scale: [1.1, 0.95, 1.1] }
        }
        transition={{
          duration: 26,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />
      {/* Sanftes Abdunkeln nach unten für besseren Kartenkontrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-fcb-bg/60" />
    </div>
  );
}
