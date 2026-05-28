"use client";

import { motion } from "framer-motion";

/**
 * Animierter Fluid/Turbulent-Flow als Hero-Hintergrund.
 *
 * Stack:
 * - Drei sich überlagernde Radial-Gradient-Blobs, die langsam ihre Position
 *   wechseln (Framer Motion, repeat: Infinity, repeatType: "mirror").
 * - Ein SVG-Filter mit feTurbulence + feDisplacementMap verzerrt die
 *   Gradient-Layer organisch – schafft den "Fluid Flow" Look.
 * - Body unter den Layern: ein zinc-950 Base-Layer, damit selbst beim
 *   Verschieben der Blobs keine Lücken entstehen.
 *
 * Performance: Reine CSS-Filter + motion-Werte; kein Canvas, kein
 * requestAnimationFrame – läuft hauptsächlich auf der GPU.
 */
export default function TurbulentFlow() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden bg-[#05080f]"
    >
      {/* SVG-Filter Definition. Das Filter wird via CSS auf die Flow-Layer angewandt. */}
      <svg
        aria-hidden
        className="absolute h-0 w-0"
        style={{ position: "absolute" }}
      >
        <defs>
          <filter id="fcb-fluid">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.008"
              numOctaves="2"
              seed="3"
            />
            <feDisplacementMap in="SourceGraphic" scale="50" />
          </filter>
        </defs>
      </svg>

      {/* Gradient-Layer 1: tief-marine, langsamer Diagonal-Drift */}
      <motion.div
        className="absolute -inset-1/4"
        style={{
          background:
            "radial-gradient(circle at 30% 40%, #102844 0%, transparent 55%)",
          filter: "url(#fcb-fluid)",
        }}
        animate={{ x: ["-5%", "8%", "-5%"], y: ["-3%", "5%", "-3%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Gradient-Layer 2: FCB-Blau gedämpft, gegenläufige Bewegung */}
      <motion.div
        className="absolute -inset-1/4"
        style={{
          background:
            "radial-gradient(circle at 70% 60%, rgba(29,95,173,0.4) 0%, transparent 55%)",
          filter: "url(#fcb-fluid)",
        }}
        animate={{ x: ["6%", "-7%", "6%"], y: ["4%", "-6%", "4%"] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Gradient-Layer 3: tiefes Blau, vertikale Welle */}
      <motion.div
        className="absolute -inset-1/4"
        style={{
          background:
            "radial-gradient(ellipse at 50% 85%, #0b1a2e 0%, transparent 60%)",
          filter: "url(#fcb-fluid)",
        }}
        animate={{ y: ["0%", "-8%", "0%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Sanftes Noise-Overlay für mehr Tiefe (sehr subtil) */}
      <div
        className="absolute inset-0 mix-blend-overlay opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.9'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Vignette für Lesbarkeit der zentralen Hero-Inhalte */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
        }}
      />
    </div>
  );
}
