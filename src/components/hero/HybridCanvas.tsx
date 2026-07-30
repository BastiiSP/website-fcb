"use client";

import { useEffect, useRef } from "react";

/**
 * Dot-Grid für den Hybrid-Hero – zwei Effekte überlagert:
 *
 * 1. Zentrum-Fokus: Dots in der Hero-Mitte sind größer, heller und reagieren
 *    stärker auf den Zeiger. Nach außen hin nehmen Größe, Helligkeit und Push-
 *    Stärke kontinuierlich ab – der Effekt "wächst" aus der Mitte.
 *
 * 2. Zeiger-Reaktion (Push-Physik): Punkte weichen vom Zeiger weg und federn
 *    mit Spring-Damping zurück.
 *
 * Eingabe (Fix 2026-07-30): Vorher hing der Effekt an `mousemove` und war auf
 * Touch-Geräten damit komplett tot. Jetzt laufen alle Zeigerarten über
 * `pointer*`-Events – Maus, Stift und Finger. Weil ein Finger nur während der
 * Berührung Events liefert, kommen auf Geräten ohne Hover zwei Dinge dazu:
 *   - Tippen/Wischen über den Hero schiebt die Dots sofort weg (Feedback auch
 *     bei kurzen Gesten, weil schon `pointerdown` die Position setzt).
 *   - Ohne Berührung übernimmt eine langsame Ambient-Bewegung, damit der Hero
 *     nicht als starres Bild erscheint. Eine echte Berührung übersteuert sie.
 * Es wird nirgends `preventDefault()` gerufen (alle Listener passiv) – Scrollen
 * und Zoomen bleiben unangetastet.
 *
 * Performance auf schwachen Geräten:
 *   - gröberes Raster + niedrigere Pixeldichte auf Touch/kleinen Screens
 *     (weniger Dots = weniger Physik pro Frame),
 *   - die Render-Loop läuft nur, solange der Hero im Viewport ist
 *     (IntersectionObserver) – nach dem Wegscrollen kostet er nichts mehr,
 *   - `prefers-reduced-motion: reduce` → ein einziges statisches Bild, keine
 *     Loop und keine Zeiger-Listener.
 */
export default function HybridCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Zeigerposition relativ zum Canvas; weit außerhalb = "kein Zeiger da".
  const zeigerRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Marken-Akzent aus der CSS-Variable lesen (Multi-Tenant: FCB blau / JFG rot).
    // Canvas kennt keine CSS-Variablen, deshalb der Umweg über getComputedStyle.
    // Format der Variable: "29 95 173" (space-separierte RGB-Kanäle).
    const akzentRGB =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--color-accent")
        .trim() || "29 95 173";

    const reduzierteBewegung = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    // "Grobe Eingabe" = Touch: kein Hover, kein präziser Zeiger. Steuert
    // Ambient-Bewegung und die Performance-Abstufung.
    const grobeEingabe = !window.matchMedia("(hover: hover) and (pointer: fine)")
      .matches;

    interface Dot {
      ox: number;
      oy: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
    }

    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    // Raster- und Wirkradius werden in resize() an die Viewportbreite angepasst.
    let spacing = 26;
    let radius = 180;

    const PUSH = 0.6; // maximale Push-Stärke (skaliert mit centerFade)
    const SPRING = 0.08;
    const FRICTION = 0.86;

    // Ambient-Bewegung nur dort, wo es keinen ruhenden Zeiger gibt (Touch).
    const ambientAktiv = grobeEingabe && !reduzierteBewegung;
    let beruehrt = false;
    let letzteBeruehrung = 0;
    // Ambient setzt kurz nach dem Loslassen wieder ein – sofortiges Übernehmen
    // würde die zurückfedernden Dots erneut wegschieben.
    const AMBIENT_PAUSE_MS = 1500;

    const buildDots = () => {
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;
      dots = [];
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const ox = i * spacing;
          const oy = j * spacing;
          dots.push({ ox, oy, x: ox, y: oy, vx: 0, vy: 0 });
        }
      }
    };

    const resize = () => {
      // Touch-Geräte: Pixeldichte auf 1.5 begrenzt und gröberes Raster. Auf einem
      // 3x-Display spart allein der dpr-Deckel rund die Hälfte der Füllfläche.
      dpr = Math.min(window.devicePixelRatio || 1, grobeEingabe ? 1.5 : 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      spacing = width < 640 ? 34 : 26;
      // Wirkradius mitskalieren: 180 px sind auf einem 375-px-Screen fast die
      // halbe Breite und hätten dort das ganze Feld in Bewegung gehalten.
      radius = Math.max(110, Math.min(180, width * 0.45));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildDots();
    };

    /** Zeichnet genau einen Frame (inkl. Physikschritt). */
    const zeichne = () => {
      ctx.clearRect(0, 0, width, height);

      let mx = zeigerRef.current.x;
      let my = zeigerRef.current.y;

      // Ambient-Zeiger: langsame Lissajous-Bahn um die Mitte. Zwei unterschiedliche
      // Frequenzen, damit die Bahn nicht als Kreis erkennbar wird.
      if (ambientAktiv && !beruehrt) {
        const seitLoslassen = performance.now() - letzteBeruehrung;
        if (seitLoslassen > AMBIENT_PAUSE_MS) {
          const t = performance.now() / 1000;
          mx = width / 2 + Math.sin(t * 0.31) * width * 0.3;
          my = height / 2 + Math.cos(t * 0.23) * height * 0.22;
        }
      }

      // Maximale Distanz von der Mitte: Diagonale des Viewports
      const maxDistFromCenter = Math.hypot(width / 2, height / 2);

      for (const d of dots) {
        // Abstand vom Dot-Ursprung zur Canvas-Mitte
        const dxC = d.ox - width / 2;
        const dyC = d.oy - height / 2;
        const distFromCenter = Math.hypot(dxC, dyC);
        // centerFade: 1 in der Mitte, 0 an den Ecken
        const centerFade = Math.max(0, 1 - distFromCenter / maxDistFromCenter);

        // Pro Dot: Größe und Basis-Helligkeit skalieren mit centerFade
        const dotRadius = 1.4 + centerFade * 1.8; // Rand: 1.4 – Mitte: 3.2
        const baseAlpha = 0.06 + centerFade * 0.34; // Rand: 0.06 – Mitte: 0.40
        const pushScale = 0.2 + centerFade * 0.8; // Rand: 0.2 – Mitte: 1.0

        // Zeiger-Abstand und Push-Physik
        const dxM = d.x - mx;
        const dyM = d.y - my;
        const dist = Math.hypot(dxM, dyM);

        if (dist < radius && dist > 0.001) {
          // Push-Stärke fällt linear mit Distanz ab, außerdem zentrumsabhängig
          const force = (1 - dist / radius) * PUSH * pushScale;
          d.vx += (dxM / dist) * force * 3;
          d.vy += (dyM / dist) * force * 3;
        }

        d.vx += (d.ox - d.x) * SPRING;
        d.vy += (d.oy - d.y) * SPRING;
        d.vx *= FRICTION;
        d.vy *= FRICTION;
        d.x += d.vx;
        d.y += d.vy;

        // Zeiger-Boost addiert sich zur Basis-Helligkeit
        const boost = (1 - Math.min(dist, radius) / radius) * 0.55;
        const alpha = Math.min(0.95, baseAlpha + boost);

        ctx.fillStyle = `rgb(${akzentRGB} / ${alpha})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const schritt = () => {
      zeichne();
      rafRef.current = requestAnimationFrame(schritt);
    };

    const starteLoop = () => {
      if (rafRef.current === null) rafRef.current = requestAnimationFrame(schritt);
    };

    const stoppeLoop = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        // Bei stehender Loop (reduzierte Bewegung / Hero außerhalb) muss der neu
        // aufgebaute Raster einmal gezeichnet werden.
        if (rafRef.current === null) zeichne();
      }, 250);
    };

    resize();

    // Reduzierte Bewegung: ein statisches Bild, keine Loop, keine Zeiger-Events.
    if (reduzierteBewegung) {
      zeichne();
      window.addEventListener("resize", onResize);
      return () => {
        if (resizeTimer) clearTimeout(resizeTimer);
        window.removeEventListener("resize", onResize);
      };
    }

    const setzeZeiger = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      zeigerRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const entferneZeiger = () => {
      zeigerRef.current = { x: -9999, y: -9999 };
    };

    const onPointerMove = (e: PointerEvent) => {
      // Bei Touch/Stift feuert pointermove nur während der Berührung – genau
      // dann soll die Ambient-Bewegung schweigen.
      if (e.pointerType !== "mouse") beruehrt = true;
      setzeZeiger(e);
    };

    const onPointerDown = (e: PointerEvent) => {
      // Auch ein einzelner Tap soll sichtbar sein, nicht erst eine Wischgeste.
      if (e.pointerType !== "mouse") beruehrt = true;
      setzeZeiger(e);
    };

    const onPointerEnde = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      // Finger weg (oder Gestenabbruch durch Scrollen): Dots federn zurück und
      // die Ambient-Bewegung übernimmt nach kurzer Pause wieder.
      beruehrt = false;
      letzteBeruehrung = performance.now();
      entferneZeiger();
    };

    // Alle Listener passiv: der Effekt darf Scrollen/Zoomen nie blockieren.
    const passiv = { passive: true } as const;
    window.addEventListener("pointermove", onPointerMove, passiv);
    window.addEventListener("pointerdown", onPointerDown, passiv);
    window.addEventListener("pointerup", onPointerEnde, passiv);
    window.addEventListener("pointercancel", onPointerEnde, passiv);
    // Maus verlässt das Fenster → Dots zurückfedern (Verhalten wie bisher).
    window.addEventListener("mouseleave", entferneZeiger, passiv);
    window.addEventListener("resize", onResize);

    // Loop nur bei sichtbarem Hero. Ohne das lief die Physik auch weiter, wenn
    // die Startseite längst weitergescrollt war – reine Akkulast auf Mobile.
    const beobachter = new IntersectionObserver(
      ([eintrag]) => {
        if (eintrag.isIntersecting) starteLoop();
        else stoppeLoop();
      },
      { threshold: 0 }
    );
    beobachter.observe(canvas);

    return () => {
      stoppeLoop();
      beobachter.disconnect();
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerEnde);
      window.removeEventListener("pointercancel", onPointerEnde);
      window.removeEventListener("mouseleave", entferneZeiger);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 h-full w-full"
      style={{ pointerEvents: "none" }}
    />
  );
}
