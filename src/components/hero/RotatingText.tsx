"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RotatingTextProps {
  words: string[];
  interval?: number; // ms zwischen den Wechseln, default 2400
  className?: string;
  /**
   * true (default): Slide-Up/Down hinter overflow-clip – für den Homepage-Hero.
   * false: kein overflow-clip, reine Fade-Animation. Nötig, wenn der rotierende
   * Text inline an einer Text-Baseline sitzen muss: overflow:hidden setzt bei
   * inline-block die Baseline auf die untere Kante und verschiebt das Wort
   * vertikal gegenüber dem umgebenden Text (Bug auf /login).
   */
  clip?: boolean;
}

/**
 * Einzelnes rotierendes Wort. clip=true: Slide-Up/Slide-Down via AnimatePresence
 * (Homepage). clip=false: reiner Fade, baseline-korrekt für Inline-Einsatz.
 */
export default function RotatingText({
  words,
  interval = 2400,
  className,
  clip = true,
}: RotatingTextProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  const motionProps = clip
    ? {
        initial: { y: "100%", opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: "-100%", opacity: 0 },
      }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };

  return (
    // shrink-0 + whitespace-nowrap sind für die Korrektheit nötig, nicht Kosmetik:
    // `overflow-hidden` (für die Slide-Animation) setzt die automatische
    // Mindestbreite eines Flex-Items auf 0. Ohne shrink-0 schrumpft die Box in
    // einer engen Flex-Zeile deshalb unter die Wortbreite und schneidet das Wort
    // ab – auf Mobile wurde aus „ZUSAMMENHALT" ein „ZUSAMMENHA" (Live-Fund
    // 2026-07-30, betraf unter 480 px fast alle Wörter beider Marken).
    // whitespace-nowrap hält das Wort zusätzlich zusammen; ein rotierendes
    // Einzelwort soll nie umbrechen. Außerhalb von Flex sind beide Klassen
    // wirkungslos (z. B. der Inline-Einsatz auf /login).
    <span
      className={`relative inline-block shrink-0 whitespace-nowrap align-baseline${
        clip ? " overflow-hidden" : ""
      }`}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          {...motionProps}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className={`inline-block ${className ?? ""}`}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
