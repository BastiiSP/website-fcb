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
    <span className={`relative inline-block align-baseline${clip ? " overflow-hidden" : ""}`}>
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
