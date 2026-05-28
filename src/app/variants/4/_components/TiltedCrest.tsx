"use client";

import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef } from "react";

/**
 * Wappen mit 3D-Tilt-Effekt: Beim Mouse-Move über das Wappen wird die
 * Mausposition relativ zur Mitte berechnet und in rotateX/rotateY übersetzt.
 *
 * Implementierung:
 * - useMotionValue für rohe Mauskoordinaten (0..1, normalisiert)
 * - useSpring für sanftes Auspendeln nach Mouse-Leave
 * - useTransform mappt 0..1 → ±MAX_TILT Grad
 * - Optional: Glanz-Reflektion auf dem Wappen folgt der Mausposition
 */
const MAX_TILT = 18; // Maximale Rotation in Grad

export default function TiltedCrest() {
  const ref = useRef<HTMLDivElement>(null);

  // Roh-Position (0..1), wird per onMouseMove gesetzt
  const mxRaw = useMotionValue(0.5);
  const myRaw = useMotionValue(0.5);

  // Sanft federnde Werte – verhindern hartes Springen beim Mouse-Leave-Reset
  const mx = useSpring(mxRaw, { stiffness: 180, damping: 18 });
  const my = useSpring(myRaw, { stiffness: 180, damping: 18 });

  // Mapping: links/rechts → rotateY, oben/unten → rotateX (negiert für natürlich wirkenden Tilt)
  const rotateY = useTransform(mx, [0, 1], [-MAX_TILT, MAX_TILT]);
  const rotateX = useTransform(my, [0, 1], [MAX_TILT, -MAX_TILT]);

  // Glanz-Position folgt der Maus
  const shineX = useTransform(mx, [0, 1], ["0%", "100%"]);
  const shineY = useTransform(my, [0, 1], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mxRaw.set(x);
    myRaw.set(y);
  };

  const handleMouseLeave = () => {
    // Zurück in die Mitte – Spring übernimmt das sanfte Einpendeln
    mxRaw.set(0.5);
    myRaw.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
      }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative cursor-grab active:cursor-grabbing"
    >
      {/* Blauer Glow hinter dem Wappen, leicht versetzt für Tiefenwirkung */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10 scale-150 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(29,95,173,0.55) 0%, rgba(29,95,173,0) 70%)",
          translateZ: -50,
        }}
      />

      <Image
        src="/logo.svg"
        alt="1. FC 1911 Burgkunstadt"
        width={200}
        height={200}
        priority
        className="drop-shadow-[0_0_30px_rgba(29,95,173,0.55)]"
      />

      {/* Glanz-Reflektion (Highlight) folgt der Maus */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-overlay"
        style={{
          background: useTransform(
            [shineX, shineY] as const,
            ([sx, sy]) =>
              `radial-gradient(circle at ${sx} ${sy}, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 50%)`,
          ),
        }}
      />
    </motion.div>
  );
}
