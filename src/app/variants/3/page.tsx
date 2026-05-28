"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays } from "lucide-react";
import ShutterText from "./_components/ShutterText";

/**
 * Variante 3 – Ultra-Minimal
 *
 * Reines zinc-950, kein Background-Effekt. Headlines extrem groß und
 * gestapelt, decken sich buchstabenweise von unten her auf.
 * Der Text ist das Design.
 */
const HEADLINE_LINES = ["FUSSBALL.", "CHARAKTER.", "BURGKUNSTADT."];

// Wie lange die letzte Zeile braucht (zum Berechnen der Folge-Delays)
const longestLine = HEADLINE_LINES.reduce(
  (acc, l) => (l.length > acc ? l.length : acc),
  0,
);
const HEADLINE_TOTAL = 0.4 + HEADLINE_LINES.length * 0.15 + longestLine * 0.025;

export default function VariantThreePage() {
  return (
    <section className="relative min-h-[calc(100vh-6rem)] overflow-hidden bg-zinc-950">
      <div className="relative mx-auto flex max-w-[1400px] flex-col items-center px-4 pt-12 pb-24 text-center">
        {/* Kleines Wappen über der Headline */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 0.85, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8"
        >
          <Image
            src="/logo.svg"
            alt="1. FC 1911 Burgkunstadt"
            width={72}
            height={72}
            priority
          />
        </motion.div>

        {/* Mega-Headline mit Shutter-Reveal */}
        <h1 className="font-oswald font-bold uppercase leading-[0.92] tracking-tight text-white">
          {HEADLINE_LINES.map((line, i) => (
            <ShutterText
              key={line}
              text={line}
              delay={0.4 + i * 0.15}
              className="text-[clamp(3.5rem,11vw,10rem)]"
            />
          ))}
        </h1>

        {/* Trennakzent: dünner FCB-Blauer Strich */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: HEADLINE_TOTAL + 0.1, duration: 0.5 }}
          className="mt-10 h-px w-24 origin-center bg-fcb-blue"
        />

        {/* Sub-Headline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: HEADLINE_TOTAL + 0.25, duration: 0.6 }}
          className="mt-6 font-inter text-xs uppercase tracking-[0.55em] text-white/60"
        >
          Tradition seit 1911
        </motion.p>

        {/* Minimale CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: HEADLINE_TOTAL + 0.4, duration: 0.5 }}
          className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:gap-8"
        >
          <a
            href="#verein"
            className="group inline-flex items-center gap-2 font-inter text-sm font-medium uppercase tracking-[0.3em] text-white transition-colors hover:text-fcb-blue"
          >
            <span>Zum Verein</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <span aria-hidden className="hidden h-4 w-px bg-white/20 sm:inline-block" />
          <a
            href="#spielplan"
            className="group inline-flex items-center gap-2 font-inter text-sm font-medium uppercase tracking-[0.3em] text-white/70 transition-colors hover:text-white"
          >
            <CalendarDays className="h-4 w-4" />
            <span>Spielplan</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
