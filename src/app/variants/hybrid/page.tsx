"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays } from "lucide-react";
import HybridCanvas from "./_components/HybridCanvas";
import HybridPitch from "./_components/HybridPitch";
import RotatingText from "./_components/RotatingText";

/**
 * Hybrid-Hero – vereint V1 Nexus (Dot-Grid) und V2 Graphic (Spielfeld-SVG).
 *
 * Layering (DOM-Order = Stack-Order bei absolute inset-0):
 *   HybridCanvas       (Dots, pointer-events:none)
 *   HybridPitch        (Spielfeld, pointer-events:none)
 *   Watermark          (Spitzname „Schuhstädter" als dezentes Hintergrundwort)
 *   Vignette           (Lesbarkeits-Gradient, dimmt Watermark zum Rand hin)
 *   Content (z-10)     (Wappen, Headline, Subheadline, CTAs)
 */
const HEADLINE_LINES = ["FUSSBALL.", "CHARAKTER.", "BURGKUNSTADT."];
const ROTATING_WORDS = ["Leidenschaft", "Heimat", "Gemeinschaft", "Tradition"];

export default function HybridPage() {
  return (
    <section className="relative min-h-[calc(100vh-6rem)] overflow-hidden">
      {/* Dot-Grid Hintergrund */}
      <HybridCanvas />

      {/* Spielfeld-SVG – liegt über dem Canvas, beide absolute inset-0 */}
      <HybridPitch />

      {/* Watermark: Spitzname als großes, dezentes Hintergrundwort hinter dem Content.
          Liegt vor Pitch/Canvas, aber vor der Vignette – diese dimmt ihn zu den
          Rändern hin zusätzlich ab, was die Lesbarkeit im Zentrum betont. */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1.4 }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <span className="font-oswald font-bold uppercase tracking-[0.05em] text-[clamp(4rem,14vw,14rem)] text-white/[0.06] select-none whitespace-nowrap">
          Schuhstädter
        </span>
      </motion.div>

      {/* Vignette für Lesbarkeit des Inhalts */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(9,9,11,0.85) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 pt-16 pb-24 text-center">
        {/* Wappen – ausbalanciert zur Headline (260 → 220) */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative mb-10"
        >
          <div
            aria-hidden
            className="absolute inset-0 -z-10 scale-150 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(29,95,173,0.55) 0%, rgba(29,95,173,0) 70%)",
            }}
          />
          <Image
            src="/logo.svg"
            alt="1. FC 1911 Burgkunstadt"
            width={220}
            height={220}
            priority
            className="drop-shadow-[0_0_24px_rgba(29,95,173,0.6)]"
          />
        </motion.div>

        {/* Headline – gewinnt Gewicht gegenüber dem Wappen (clamp 1.75rem–4rem → 2.25rem–5rem) */}
        <h1 className="font-oswald font-bold uppercase leading-[0.95] tracking-tight text-white">
          {HEADLINE_LINES.map((line, i) => (
            <motion.span
              key={line}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.3 + i * 0.18,
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="block text-[clamp(2.25rem,5vw,5rem)]"
              style={{
                // Letzte Zeile FCB-Blau – verleiht der Stadt das Gewicht
                color: i === HEADLINE_LINES.length - 1 ? "#1d5fad" : undefined,
              }}
            >
              {line}
            </motion.span>
          ))}
        </h1>

        {/* Subheadline mit rotierendem Begriff */}
        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="mt-6 font-inter text-sm uppercase tracking-[0.4em] text-white/70 flex items-center justify-center gap-2"
        >
          <span>Dein Verein für</span>
          <RotatingText
            words={ROTATING_WORDS}
            interval={2400}
            className="text-fcb-blue font-semibold"
          />
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.25, duration: 0.5 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4"
        >
          <a
            href="#verein"
            className="group inline-flex items-center gap-2 rounded-full bg-fcb-blue px-7 py-3.5 font-inter text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-fcb-blue/30 transition hover:bg-fcb-blue/90"
          >
            Zum Verein
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="#spielplan"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-7 py-3.5 font-inter text-sm font-semibold uppercase tracking-wider text-white backdrop-blur-sm transition hover:bg-white/10"
          >
            <CalendarDays className="h-4 w-4" />
            Spielplan
          </a>
        </motion.div>
      </div>
    </section>
  );
}
