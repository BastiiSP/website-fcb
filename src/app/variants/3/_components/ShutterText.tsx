"use client";

import { motion } from "framer-motion";

/**
 * Buchstabenweise Shutter-Reveal-Animation: jeder Char startet 100 % unter
 * der Grundlinie (overflow-hidden Container) und fährt nach oben in den
 * sichtbaren Bereich. Klassischer Editorial-Type-Effekt.
 *
 * Props:
 * - text: der anzuzeigende String (eine Zeile)
 * - delay: Globaler Start-Delay für diese Zeile in Sekunden
 * - charDelay: Verzögerung zwischen den einzelnen Zeichen in Sekunden
 * - className: optionale Tailwind-Klassen für den umschließenden Block
 */
interface ShutterTextProps {
  text: string;
  delay?: number;
  charDelay?: number;
  className?: string;
}

export default function ShutterText({
  text,
  delay = 0,
  charDelay = 0.025,
  className = "",
}: ShutterTextProps) {
  return (
    <span
      className={`block overflow-hidden ${className}`}
      // aria-Text damit Screenreader die volle Zeile lesen, nicht Buchstabe für Buchstabe
      aria-label={text}
    >
      {Array.from(text).map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          aria-hidden
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          transition={{
            delay: delay + i * charDelay,
            duration: 0.6,
            ease: [0.65, 0, 0.35, 1],
          }}
          className="inline-block"
          // Whitespace muss als &nbsp; erhalten bleiben, sonst kollabiert er beim Inline-Block
          style={{ whiteSpace: char === " " ? "pre" : undefined }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </span>
  );
}
