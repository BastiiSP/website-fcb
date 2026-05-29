"use client";

import { motion } from "framer-motion";

/**
 * Spielfeld-SVG für den Hybrid-Hero, Sichtbarkeit erhöht:
 * - Globale opacity: 0.55
 * - Haupt-Linien strokeWidth: 2.7 (Feldumrandung, Mittellinie, Kreise, Strafräume)
 * - Detail-Linien strokeWidth: 2.3 (5er-Räume, Eckkreise)
 *
 * Zeigt ausschließlich echte Fußballfeld-Elemente.
 * pointer-events: none, damit der Canvas-Layer Maus-Events empfangen kann.
 */
export default function HybridPitch() {
  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        delay: 0.2 + i * 0.08,
        duration: 1.2,
        ease: [0.65, 0, 0.35, 1] as [number, number, number, number],
      },
    }),
  };

  return (
    <svg
      aria-hidden
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity: 0.55, pointerEvents: "none" }}
    >
      <defs>
        <radialGradient id="hybridPitchVignette" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#0f1822" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.5" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#hybridPitchVignette)" />

      {/* Feldumrandung */}
      <motion.rect
        x="60" y="60" width="1480" height="780"
        fill="none" stroke="#1d5fad" strokeWidth="2.7"
        variants={lineVariants} initial="hidden" animate="visible" custom={0}
      />

      {/* Mittellinie */}
      <motion.line
        x1="800" y1="60" x2="800" y2="840"
        stroke="#1d5fad" strokeWidth="2.7"
        variants={lineVariants} initial="hidden" animate="visible" custom={1}
      />

      {/* Mittelkreis */}
      <motion.circle
        cx="800" cy="450" r="120"
        fill="none" stroke="#1d5fad" strokeWidth="2.7"
        variants={lineVariants} initial="hidden" animate="visible" custom={2}
      />

      {/* Anstoßpunkt */}
      <motion.circle
        cx="800" cy="450" r="4"
        fill="#1d5fad"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.4 }}
      />

      {/* Strafraum links */}
      <motion.rect
        x="60" y="240" width="220" height="420"
        fill="none" stroke="#1d5fad" strokeWidth="2.7"
        variants={lineVariants} initial="hidden" animate="visible" custom={3}
      />
      {/* 5er-Raum links */}
      <motion.rect
        x="60" y="340" width="90" height="220"
        fill="none" stroke="#1d5fad" strokeWidth="2.3"
        variants={lineVariants} initial="hidden" animate="visible" custom={4}
      />

      {/* Strafraum rechts */}
      <motion.rect
        x="1320" y="240" width="220" height="420"
        fill="none" stroke="#1d5fad" strokeWidth="2.7"
        variants={lineVariants} initial="hidden" animate="visible" custom={5}
      />
      {/* 5er-Raum rechts */}
      <motion.rect
        x="1450" y="340" width="90" height="220"
        fill="none" stroke="#1d5fad" strokeWidth="2.3"
        variants={lineVariants} initial="hidden" animate="visible" custom={6}
      />

      {/* Eckkreise */}
      <motion.path
        d="M 60 80 A 20 20 0 0 1 80 60"
        fill="none" stroke="#1d5fad" strokeWidth="2.3"
        variants={lineVariants} initial="hidden" animate="visible" custom={7}
      />
      <motion.path
        d="M 1540 60 A 20 20 0 0 1 1540 80"
        fill="none" stroke="#1d5fad" strokeWidth="2.3"
        variants={lineVariants} initial="hidden" animate="visible" custom={7}
      />
      <motion.path
        d="M 80 840 A 20 20 0 0 1 60 820"
        fill="none" stroke="#1d5fad" strokeWidth="2.3"
        variants={lineVariants} initial="hidden" animate="visible" custom={7}
      />
      <motion.path
        d="M 1520 840 A 20 20 0 0 1 1540 820"
        fill="none" stroke="#1d5fad" strokeWidth="2.3"
        variants={lineVariants} initial="hidden" animate="visible" custom={7}
      />

    </svg>
  );
}
