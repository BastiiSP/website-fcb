"use client";

import HybridPitch from "@/components/hero/HybridPitch";

/**
 * Ruhiger, atmosphärischer Hintergrund für die echten Auth-Seiten im Pitch-Look.
 *
 * Bewusste Änderungen ggü. der Design-Preview:
 *  - KEIN interaktives Dot-Grid (HybridCanvas) mehr – dieser Effekt stammt aus
 *    dem Hero und soll auf den Auth-Seiten nicht erscheinen.
 *  - Das Spielfeld-SVG (HybridPitch) wird NICHT mehr full-bleed "geslict"
 *    (dadurch wirkte es unverhältnismäßig groß), sondern in einen zentrierten,
 *    breitenbegrenzten 16:9-Container gelegt und dezent abgesenkt. So bleibt das
 *    Feld-Seitenverhältnis erhalten statt in ein hohes Viewport gezoomt zu werden.
 *
 * Erlaubte Roh-Farbe laut Design-Spec: rgba(9,9,11,…) für die Vignette.
 */
export default function PitchAuthBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden bg-fcb-bg"
    >
      {/* Spielfeld dezent, zentriert, breitenbegrenzt – der Wrapper gibt dem
          absolut positionierten HybridPitch seine 16:9-Größe. */}
      <div className="absolute left-1/2 top-1/2 aspect-[16/9] w-[150%] max-w-[1000px] -translate-x-1/2 -translate-y-1/2 opacity-40 sm:w-[95%]">
        <HybridPitch />
      </div>

      {/* Zentrale Inhalts-Vignette – hält die Card-Zone lesbar. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgb(var(--hero-vignette) / var(--hero-vignette-alpha)) 100%)",
        }}
      />
    </div>
  );
}
