"use client";

import { motion } from "framer-motion";
import { ArrowRight, CalendarDays } from "lucide-react";
import TurbulentFlow from "./_components/TurbulentFlow";
import TiltedCrest from "./_components/TiltedCrest";

/**
 * Variante 4 – Dynamic
 *
 * Intensivste Animations-Variante: Turbulent-Flow-Hintergrund mit organischer
 * Bewegung in dunklen Blau-Tönen + Wappen mit 3D-Tilt-Hover.
 * Headlines mit Blur-To-Sharp Reveal.
 */
const HEADLINE_LINES = ["FUSSBALL.", "CHARAKTER.", "BURGKUNSTADT."];

export default function VariantFourPage() {
  return (
    <section className="relative min-h-[calc(100vh-6rem)] overflow-hidden">
      {/* Animierter Hintergrund */}
      <TurbulentFlow />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 pt-16 pb-24 text-center">
        {/* Wappen mit 3D-Tilt – interaktiv beim Hover */}
        <div className="mb-10">
          <TiltedCrest />
        </div>

        {/* Headlines mit Blur-Reveal: starten als blurry und animieren scharf */}
        <h1 className="font-oswald font-bold uppercase leading-[0.95] tracking-tight text-white">
          {HEADLINE_LINES.map((line, i) => (
            <motion.span
              key={line}
              initial={{ y: 30, opacity: 0, filter: "blur(12px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              transition={{
                delay: 0.4 + i * 0.2,
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="block text-[clamp(3rem,8vw,7rem)]"
              style={{
                color: i === HEADLINE_LINES.length - 1 ? "#1d5fad" : undefined,
                textShadow:
                  i === HEADLINE_LINES.length - 1
                    ? "0 0 40px rgba(29,95,173,0.4)"
                    : undefined,
              }}
            >
              {line}
            </motion.span>
          ))}
        </h1>

        {/* Sub-Headline */}
        <motion.p
          initial={{ opacity: 0, filter: "blur(6px)" }}
          animate={{ opacity: 0.8, filter: "blur(0px)" }}
          transition={{ delay: 1.3, duration: 0.7 }}
          className="mt-6 font-inter text-sm uppercase tracking-[0.4em] text-white/75"
        >
          Tradition seit 1911
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.55, duration: 0.6 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4"
        >
          <a
            href="#verein"
            className="group inline-flex items-center gap-2 rounded-full bg-fcb-blue px-7 py-3.5 font-inter text-sm font-semibold uppercase tracking-wider text-white shadow-[0_0_30px_rgba(29,95,173,0.5)] transition hover:shadow-[0_0_40px_rgba(29,95,173,0.7)]"
          >
            Zum Verein
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="#spielplan"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-7 py-3.5 font-inter text-sm font-semibold uppercase tracking-wider text-white backdrop-blur-md transition hover:bg-white/15"
          >
            <CalendarDays className="h-4 w-4" />
            Spielplan
          </a>
        </motion.div>
      </div>
    </section>
  );
}
