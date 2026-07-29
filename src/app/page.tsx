"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import HybridCanvas from "@/components/hero/HybridCanvas";
import HybridPitch from "@/components/hero/HybridPitch";
import RotatingText from "@/components/hero/RotatingText";
import InstagramSection from "@/components/instagram/InstagramSection";
import { useTenant } from "@/components/tenant/TenantProvider";

/**
 * Homepage – Hybrid-Hero als Startseite.
 *
 * Layering (DOM-Order = Stack-Order bei absolute inset-0):
 *   HybridCanvas       (Dots, pointer-events:none)
 *   HybridPitch        (Spielfeld, pointer-events:none)
 *   Vignette           (Lesbarkeits-Gradient)
 *   Content (z-10)     (Wappen, Headline, Subheadline, 1911-Element)
 *
 * Unterhalb des Heroes: „Vereins-News" – das Instagram-Carousel
 * (InstagramSection lädt den Behold-Feed über /api/instagram).
 *
 * Multi-Tenant: Wappen, Headline, Schlagworte und Zierelement kommen aus der
 * Marken-Konfiguration – dieselbe Hero-Mechanik für FCB und JFG.
 */

export default function HomePage() {
  const tenant = useTenant();
  const HEADLINE_LINES = tenant.heroLines;
  const ROTATING_WORDS = tenant.heroWords;

  return (
    <main className="min-h-screen bg-fcb-bg text-fcb-text">

      {/*
       * Hero-Section – folgt jetzt dem globalen Theme:
       * Light = weißer Grund + blaue Linien + dunkler Text.
       * Dark = dunkler Grund wie bisher.
       * Das führende `dark` wurde entfernt, damit fcb-*-Tokens das globale
       * Theme widerspiegeln statt immer auf dunkel zu scopen.
       */}
      <section className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-fcb-bg">

        {/* Dot-Grid Hintergrund */}
        <HybridCanvas />

        {/* Spielfeld-SVG – liegt über dem Canvas, beide absolute inset-0 */}
        <HybridPitch />

        {/* Vignette für Lesbarkeit des Inhalts – theme-aware via CSS-Vars:
            Dark: --hero-vignette ≈ fast-schwarz, alpha 0.85 → abdunkelnder Rand.
            Light: alpha 0.0 → Vignette praktisch unsichtbar. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 30%, rgb(var(--hero-vignette) / var(--hero-vignette-alpha)) 100%)",
          }}
        />

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 pt-16 pb-24 text-center">

          {/* Wappen mit Glow */}
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
                  "radial-gradient(circle, rgb(var(--color-accent) / 0.55) 0%, rgb(var(--color-accent) / 0) 70%)",
              }}
            />
            <Image
              src={tenant.logoSrc}
              alt={tenant.name}
              width={220}
              height={220}
              priority
              className="drop-shadow-[0_0_24px_rgb(var(--color-accent)/0.6)]"
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
           * Marken-Akzent: Alle drei Wörter in der Theme-Textfarbe (hell/dunkel),
           * nur der jeweils ERSTE Buchstabe im Marken-Akzent (FCB blau / JFG rot).
           * Keine Umrandung/kein Text-Stroke.
           */}
          <h1 className="font-oswald font-bold uppercase leading-[0.95] tracking-tight text-fcb-text">
            {HEADLINE_LINES.map((line, i) => {
              // Längste Zeile bestimmt die Container-Breite (siehe Justify-Hinweis oben).
              const longestLength = Math.max(...HEADLINE_LINES.map((l) => l.length));
              const isLongest = line.length === longestLength;

              const motionProps = {
                initial: { y: 40, opacity: 0 },
                animate: { y: 0, opacity: 1 },
                transition: {
                  delay: 0.3 + i * 0.18,
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                },
              };

              if (isLongest) {
                return (
                  <motion.span
                    key={line}
                    {...motionProps}
                    className="block text-[clamp(2.25rem,5vw,5rem)]"
                  >
                    {/* Anfangsbuchstabe im Marken-Akzent, Rest erbt die Theme-Textfarbe */}
                    <span className="text-fcb-accent">{line[0]}</span>
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
                    <span key={idx} className={idx === 0 ? "text-fcb-accent" : undefined}>
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
            className="mt-6 font-inter text-sm uppercase tracking-[0.4em] text-fcb-muted flex items-center justify-center gap-2"
          >
            <span>Dein Verein für</span>
            <RotatingText
              words={ROTATING_WORDS}
              interval={2400}
              className="text-fcb-accent font-semibold"
            />
          </motion.p>

          {/*
           * Typografisches CTA-Element – bewusst nicht klickbar.
           * Nutzer gelangen über die Navbar zu Kalender und Login.
           */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.25, duration: 0.5 }}
            className="mt-10 flex items-center justify-center gap-4 sm:gap-5"
          >
            {/* Linke Zierlinie */}
            <span aria-hidden className="h-0.5 w-8 bg-fcb-text/20 sm:w-12" />
            <span className="font-oswald text-base font-bold uppercase tracking-[0.2em] text-fcb-accent sm:text-xl">
              {tenant.heroBadge.links}
            </span>
            <span className="font-oswald text-base font-medium uppercase tracking-[0.2em] text-fcb-text/85 sm:text-xl">
              {tenant.heroBadge.rechts}
            </span>
            {/* Rechte Zierlinie */}
            <span aria-hidden className="h-0.5 w-8 bg-fcb-text/20 sm:w-12" />
          </motion.div>

        </div>
      </section>

      {/* Vereins-News – Instagram-Carousel (ersetzt den früheren LightWidget-Feed) */}
      <InstagramSection />

    </main>
  );
}
