"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import HybridCanvas from "./_components/HybridCanvas";
import HybridPitch from "./_components/HybridPitch";
import RotatingText from "./_components/RotatingText";

/**
 * Hybrid-Hero – vereint V1 Nexus (Dot-Grid) und V2 Graphic (Spielfeld-SVG).
 *
 * Layering (DOM-Order = Stack-Order bei absolute inset-0):
 *   HybridCanvas       (Dots, pointer-events:none)
 *   HybridPitch        (Spielfeld, pointer-events:none)
 *   Vignette           (Lesbarkeits-Gradient)
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

        {/*
         * Headline – drei gleich breite Zeilen:
         *   - Die längste Zeile („BURGKUNSTADT.") bleibt im normalen Block-Flow
         *     und gibt damit die intrinsische Breite der h1 vor.
         *   - Die kürzeren Zeilen werden als `flex justify-between` mit jedem
         *     Buchstaben als eigenem Span gerendert – sie spreizen sich auf
         *     die Container-Breite (= Breite von BURGKUNSTADT.).
         *
         * Hinweis: `text-align-last: justify` würde hier nicht greifen, weil
         * Browser Justify nur zwischen Wörtern verteilen, nicht zwischen
         * Buchstaben innerhalb eines einzelnen Worts.
         *
         * FCB-Easter-Egg: F & C bekommen einen dezenten FCB-Blau-Rahmen
         * (blauer Stroke auf weißer Schrift), B bekommt einen weißen
         * Rahmen (weißer Stroke auf blauer Schrift). Realisiert über
         * `-webkit-text-stroke` – keine neuen Farben.
         */}
        <h1 className="font-oswald font-bold uppercase leading-[0.95] tracking-tight text-white">
          {HEADLINE_LINES.map((line, i) => {
            const isLast = i === HEADLINE_LINES.length - 1;
            // Längste Zeile bestimmt die Container-Breite – ihre Position
            // im Array ist bekannt, aber wir leiten sie zur Sicherheit aus
            // der maximalen Länge ab.
            const longestLength = Math.max(...HEADLINE_LINES.map((l) => l.length));
            const isLongest = line.length === longestLength;

            // Dezenter Rahmen statt Glow: F & C bekommen blauen Stroke
            // (auf weißer Schrift sichtbar), B bekommt weißen Stroke
            // (auf blauer Schrift sichtbar).
            // Blau auf Weiß hat geringeren Kontrast als Weiß auf Blau,
            // deshalb braucht F/C mehr Stroke-Breite (4 px) als B (2 px),
            // damit die Rahmen optisch gleich präsent wirken.
            const fcbBorder = {
              WebkitTextStroke: isLast ? "2px #ffffff" : "4px #1d5fad",
            };

            const motionProps = {
              initial: { y: 40, opacity: 0 },
              animate: { y: 0, opacity: 1 },
              transition: {
                delay: 0.3 + i * 0.18,
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
              },
              style: {
                // Letzte Zeile FCB-Blau – verleiht der Stadt das Gewicht
                color: isLast ? "#1d5fad" : undefined,
              },
            };

            if (isLongest) {
              return (
                <motion.span
                  key={line}
                  {...motionProps}
                  className="block text-[clamp(2.25rem,5vw,5rem)]"
                >
                  <span style={fcbBorder}>{line[0]}</span>
                  {line.slice(1)}
                </motion.span>
              );
            }

            return (
              <motion.span
                key={line}
                {...motionProps}
                className="flex justify-between text-[clamp(2.25rem,5vw,5rem)]"
              >
                {Array.from(line).map((char, idx) => (
                  <span key={idx} style={idx === 0 ? fcbBorder : undefined}>
                    {char}
                  </span>
                ))}
              </motion.span>
            );
          })}
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

        {/*
         * CTA-Slot – aktuell mit dem typografischen Element
         * „1911 Schuhstädter" belegt. Bewusst nicht klickbar, kein
         * Button-Charakter (Ghost-Button ohne Hover wäre UX-Anti-Pattern).
         *
         * Wenn echte CTAs ergänzt werden sollen, die beiden <span>-Blöcke
         * unten durch <a>- oder <button>-Elemente ersetzen – die
         * umgebende motion.div behält Spacing (mt-10) und Einblend-
         * Animation (delay 1.25 s, duration 0.5 s).
         */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.25, duration: 0.5 }}
          className="mt-10 flex items-center justify-center gap-4 sm:gap-5"
        >
          {/* Linke Zierlinie – rahmt den Schriftzug als zusammenhängende Einheit ein */}
          <span aria-hidden className="h-px w-8 bg-white/30 sm:w-12" />
          <span className="font-oswald text-base font-bold uppercase tracking-[0.2em] text-fcb-blue sm:text-xl">
            1911
          </span>
          <span className="font-oswald text-base font-medium uppercase tracking-[0.2em] text-white/85 sm:text-xl">
            Schuhstädter
          </span>
          {/* Rechte Zierlinie – Spiegelbild zur linken */}
          <span aria-hidden className="h-px w-8 bg-white/30 sm:w-12" />
        </motion.div>
      </div>
    </section>
  );
}
