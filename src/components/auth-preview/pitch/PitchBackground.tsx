"use client";

import HybridCanvas from "@/components/hero/HybridCanvas";
import HybridPitch from "@/components/hero/HybridPitch";

/**
 * Atmosphärischer Hintergrund für die Pitch-Variante – komponiert aus dem
 * bestehenden Hero-Vokabular:
 *
 *   1. HybridCanvas  – interaktives, mausreagierendes Dot-Grid in fcb-blue
 *   2. HybridPitch   – einzeichnendes Spielfeld-SVG (bringt eigene Vignette mit)
 *   3. Inhalts-Vignette – dunkelt die Ränder ab, damit die Card lesbar bleibt
 *
 * Beide Hero-Layer sind rein dekorativ (aria-hidden) und laufen bereits auf der
 * Homepage – Performance ist damit unkritisch. Sie respektieren reduzierte
 * Bewegung nicht selbst (Canvas ist endlos), sind aber als dekorativ markiert;
 * die eigene Eingangs-Choreografie der Variante wird in der Variante per
 * useReducedMotion() abgeschaltet.
 *
 * Erlaubte Roh-Farben laut Design-Spec: rgba(29,95,173,…) für blaue Glows und
 * rgba(9,9,11,…) für Vignetten.
 */
export default function PitchBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden bg-fcb-bg"
    >
      {/* Layer 1: interaktives Dot-Grid (absolute inset-0, pointer-events:none) */}
      <HybridCanvas />

      {/* Layer 2: einzeichnendes Spielfeld, leicht zusätzlich abgedunkelt */}
      <div className="absolute inset-0 opacity-90">
        <HybridPitch />
      </div>

      {/* Layer 3: zentrale Inhalts-Vignette – hält die Card-Zone lesbar */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(9,9,11,0.85) 100%)",
        }}
      />
    </div>
  );
}
