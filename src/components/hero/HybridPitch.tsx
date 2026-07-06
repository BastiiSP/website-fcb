"use client";

import { motion } from "framer-motion";

/**
 * Spielfeld-SVG für den Hybrid-Hero.
 *
 * Responsiv ohne Beschnitt: preserveAspectRatio "meet" (statt "slice") skaliert
 * das komplette Feld in den Hero – auf jeder Bildschirmgröße vollständig
 * sichtbar und proportional identisch, mittig zentriert (Letterboxing statt
 * Crop). Die Linien nutzen vector-effect: non-scaling-stroke, damit sie in
 * jeder Skalierung dieselbe feine Pixelbreite behalten (saubere Zeichnung
 * statt fetter/verwaschener Linien).
 *
 * Die frühere SVG-interne Vignette wurde entfernt – die Startseite legt
 * dieselbe Vignette bereits als eigenes Overlay über den ganzen Hero; im
 * "meet"-Modus würde die SVG-Variante als sichtbares Rechteck enden.
 *
 * Zeigt ausschließlich echte Fußballfeld-Elemente.
 * pointer-events: none, damit der Canvas-Layer Maus-Events empfangen kann.
 */
export default function HybridPitch() {
  // Gestaffeltes Einblenden statt pathLength-Zeichnen-Animation: pathLength
  // animiert über stroke-dasharray, und das kollidiert browserabhängig mit
  // vector-effect: non-scaling-stroke (Dash-Muster wird gegen die echte
  // statt der normierten Pfadlänge gerechnet) – die Linien blieben dann
  // dauerhaft gestrichelt/zerhackt. Ein reiner Opacity-Fade ist in allen
  // Browsern stabil.
  const lineVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: {
        delay: 0.2 + i * 0.08,
        duration: 0.9,
        ease: [0.65, 0, 0.35, 1] as [number, number, number, number],
      },
    }),
  };

  return (
    <svg
      aria-hidden
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid meet"
      style={{ opacity: 0.55, pointerEvents: "none" }}
    >
      {/* Feldumrandung */}
      <motion.rect
        x="60" y="60" width="1480" height="780"
        fill="none" stroke="#1d5fad" strokeWidth="2.7"
        vectorEffect="non-scaling-stroke"
        variants={lineVariants} initial="hidden" animate="visible" custom={0}
      />

      {/* Mittellinie */}
      <motion.line
        x1="800" y1="60" x2="800" y2="840"
        stroke="#1d5fad" strokeWidth="2.7"
        vectorEffect="non-scaling-stroke"
        variants={lineVariants} initial="hidden" animate="visible" custom={1}
      />

      {/* Mittelkreis */}
      <motion.circle
        cx="800" cy="450" r="120"
        fill="none" stroke="#1d5fad" strokeWidth="2.7"
        vectorEffect="non-scaling-stroke"
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
        vectorEffect="non-scaling-stroke"
        variants={lineVariants} initial="hidden" animate="visible" custom={3}
      />
      {/* 5er-Raum links */}
      <motion.rect
        x="60" y="340" width="90" height="220"
        fill="none" stroke="#1d5fad" strokeWidth="2.3"
        vectorEffect="non-scaling-stroke"
        variants={lineVariants} initial="hidden" animate="visible" custom={4}
      />

      {/* Strafraum rechts */}
      <motion.rect
        x="1320" y="240" width="220" height="420"
        fill="none" stroke="#1d5fad" strokeWidth="2.7"
        vectorEffect="non-scaling-stroke"
        variants={lineVariants} initial="hidden" animate="visible" custom={5}
      />
      {/* 5er-Raum rechts */}
      <motion.rect
        x="1450" y="340" width="90" height="220"
        fill="none" stroke="#1d5fad" strokeWidth="2.3"
        vectorEffect="non-scaling-stroke"
        variants={lineVariants} initial="hidden" animate="visible" custom={6}
      />

      {/*
       * Eckkreise: Viertelkreise mit Mittelpunkt exakt in der jeweiligen
       * Feldecke (Radius 15), die sich nach INNEN ins Feld wölben – wie beim
       * echten Platz. Die alten Pfade hatten falsche Endpunkte/Sweep-Flags
       * und wölbten sich über die Feldgrenze hinaus (sichtbare "Beulen").
       * strokeLinecap round, damit die Bogenenden sauber auf den Linien enden.
       */}
      {/* oben links */}
      <motion.path
        d="M 60 75 A 15 15 0 0 0 75 60"
        fill="none" stroke="#1d5fad" strokeWidth="2.3" strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        variants={lineVariants} initial="hidden" animate="visible" custom={7}
      />
      {/* oben rechts */}
      <motion.path
        d="M 1525 60 A 15 15 0 0 0 1540 75"
        fill="none" stroke="#1d5fad" strokeWidth="2.3" strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        variants={lineVariants} initial="hidden" animate="visible" custom={7}
      />
      {/* unten links */}
      <motion.path
        d="M 75 840 A 15 15 0 0 0 60 825"
        fill="none" stroke="#1d5fad" strokeWidth="2.3" strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        variants={lineVariants} initial="hidden" animate="visible" custom={7}
      />
      {/* unten rechts */}
      <motion.path
        d="M 1540 825 A 15 15 0 0 0 1525 840"
        fill="none" stroke="#1d5fad" strokeWidth="2.3" strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        variants={lineVariants} initial="hidden" animate="visible" custom={7}
      />

    </svg>
  );
}
