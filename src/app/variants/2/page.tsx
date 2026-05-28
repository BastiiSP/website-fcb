"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays } from "lucide-react";
import PitchSvg from "./_components/PitchSvg";

/**
 * Variante 2 – Graphic
 *
 * Hero-Hintergrund: abstrakte Spielfeld-Geometrie als SVG.
 * Headlines werden horizontal aufgedeckt (Clip-Path-Reveal) – wirkt wie
 * ein Vorhang, der von links nach rechts gezogen wird.
 */
const HEADLINE_LINES = ["FUSSBALL.", "CHARAKTER.", "BURGKUNSTADT."];

export default function VariantTwoPage() {
  return (
    <section className="relative min-h-[calc(100vh-6rem)] overflow-hidden bg-gradient-to-b from-zinc-950 via-[#0a1322] to-zinc-950">
      {/* Abstrakte Spielfeld-Grafik */}
      <PitchSvg />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 pt-16 pb-24 text-center">
        {/* Wappen – sanftes Scale-In */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-10"
        >
          <Image
            src="/logo.svg"
            alt="1. FC 1911 Burgkunstadt"
            width={170}
            height={170}
            priority
          />
        </motion.div>

        {/* Headlines mit Clip-Path Reveal */}
        <h1 className="font-oswald font-bold uppercase leading-[0.95] tracking-tight text-white">
          {HEADLINE_LINES.map((line, i) => (
            <motion.span
              key={line}
              initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0 }}
              animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
              transition={{
                delay: 0.4 + i * 0.18,
                duration: 0.7,
                ease: [0.65, 0, 0.35, 1],
              }}
              className="block text-[clamp(3rem,8vw,7rem)]"
              style={{
                color: i === HEADLINE_LINES.length - 1 ? "#1d5fad" : undefined,
              }}
            >
              {line}
            </motion.span>
          ))}
        </h1>

        {/* Trennlinie als grafisches Element (passt zur "Graphic" Idee) */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6, ease: "easeOut" }}
          className="mt-8 h-px w-32 origin-left bg-fcb-blue"
        />

        {/* Sub-Headline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="mt-5 font-inter text-sm uppercase tracking-[0.4em] text-white/70"
        >
          Tradition seit 1911
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4"
        >
          <a
            href="#verein"
            className="group inline-flex items-center gap-2 rounded-none bg-fcb-blue px-7 py-3.5 font-inter text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-fcb-blue/30 transition hover:bg-fcb-blue/90"
          >
            Zum Verein
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="#spielplan"
            className="inline-flex items-center gap-2 rounded-none border border-white/30 bg-transparent px-7 py-3.5 font-inter text-sm font-semibold uppercase tracking-wider text-white transition hover:border-white/60 hover:bg-white/5"
          >
            <CalendarDays className="h-4 w-4" />
            Spielplan
          </a>
        </motion.div>
      </div>
    </section>
  );
}
