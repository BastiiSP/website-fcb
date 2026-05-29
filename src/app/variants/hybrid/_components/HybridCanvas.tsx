"use client";

import { useEffect, useRef } from "react";

/**
 * Dot-Grid für die Hybrid-Variante – zwei Effekte überlagert:
 *
 * 1. Zentrum-Fokus: Dots in der Hero-Mitte sind größer, heller und reagieren
 *    stärker auf die Maus. Nach außen hin nehmen Größe, Helligkeit und Push-
 *    Stärke kontinuierlich ab – der Effekt "wächst" aus der Mitte.
 *
 * 2. Maus-Reaktion (Push-Physik): Punkte weichen vom Cursor weg und federn
 *    mit Spring-Damping zurück.
 */
export default function HybridCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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

    const SPACING = 26;
    const RADIUS = 180;   // Maus-Wirkbereich
    const PUSH = 0.6;     // maximale Push-Stärke (skaliert mit centerFade)
    const SPRING = 0.08;
    const FRICTION = 0.86;

    const buildDots = () => {
      const cols = Math.ceil(width / SPACING) + 1;
      const rows = Math.ceil(height / SPACING) + 1;
      dots = [];
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const ox = i * SPACING;
          const oy = j * SPACING;
          dots.push({ ox, oy, x: ox, y: oy, vx: 0, vy: 0 });
        }
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildDots();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
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
        const dotRadius = 1.4 + centerFade * 1.8;     // Rand: 1.4 – Mitte: 3.2
        const baseAlpha = 0.06 + centerFade * 0.34;   // Rand: 0.06 – Mitte: 0.40
        const pushScale = 0.2 + centerFade * 0.8;     // Rand: 0.2 – Mitte: 1.0

        // Maus-Abstand und Push-Physik
        const dxM = d.x - mx;
        const dyM = d.y - my;
        const dist = Math.hypot(dxM, dyM);

        if (dist < RADIUS && dist > 0.001) {
          // Push-Stärke fällt linear mit Distanz ab, außerdem zentrumsabhängig
          const force = (1 - dist / RADIUS) * PUSH * pushScale;
          d.vx += (dxM / dist) * force * 3;
          d.vy += (dyM / dist) * force * 3;
        }

        d.vx += (d.ox - d.x) * SPRING;
        d.vy += (d.oy - d.y) * SPRING;
        d.vx *= FRICTION;
        d.vy *= FRICTION;
        d.x += d.vx;
        d.y += d.vy;

        // Maus-Boost addiert sich zur Basis-Helligkeit
        const mouseBoost = (1 - Math.min(dist, RADIUS) / RADIUS) * 0.55;
        const alpha = Math.min(0.95, baseAlpha + mouseBoost);

        ctx.fillStyle = `rgba(29, 95, 173, ${alpha})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 250);
    };

    resize();
    rafRef.current = requestAnimationFrame(draw);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("resize", onResize);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
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
