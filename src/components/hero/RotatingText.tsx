"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RotatingTextProps {
  words: string[];
  interval?: number; // ms zwischen den Wechseln, default 2400
  className?: string;
}

/**
 * Einzelnes rotierendes Wort mit Slide-Up/Slide-Down via AnimatePresence.
 * Bewusst kein per-Letter-Stagger, da die Subheadline klein ist und
 * buchstabenweiser Effekt dort unruhig wirken würde.
 */
export default function RotatingText({ words, interval = 2400, className }: RotatingTextProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className="relative inline-block overflow-hidden align-baseline">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className={`inline-block ${className ?? ""}`}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
