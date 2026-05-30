"use client";

import type { MouseEvent } from "react";

/**
 * Geteilte Bausteine für den mausfolgenden Spotlight-Effekt der
 * Instagram-Carousel-Varianten. Das Styling liegt in globals.css
 * (.spotlight-card / .spotlight-border / .spotlight-fill).
 *
 * Es werden lokale Cursor-Koordinaten (Pixel relativ zur Card) statt des
 * fixed-Viewport-Tricks verwendet – nur so funktioniert der Glow auch
 * innerhalb der 3D-Transforms der Cylinder- und Feature-Variante.
 */

/** onMouseMove-Handler: setzt --mx/--my auf der getroffenen Card. */
export function spotlightMove(e: MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
  el.style.setProperty("--my", `${e.clientY - rect.top}px`);
}

/**
 * Die beiden Overlay-Ebenen des Spotlight-Effekts. Als erste Kinder einer
 * `.spotlight-card` einsetzen: dezenter Flächen-Schimmer + prominenter
 * Rand-Glow (beide nur bei Hover sichtbar).
 */
export function SpotlightOverlays() {
  return (
    <>
      <span aria-hidden className="spotlight-fill" />
      <span aria-hidden className="spotlight-border" />
    </>
  );
}
