"use client";

import { useEffect, useRef } from "react";

/**
 * Verstärkte Version des Nexus Dot-Grids für die Hybrid-Variante.
 * Parameter gegenüber V1 erhöht: dichteres Grid (26 statt 38), größerer
 * Push-Radius (180), stärkere Abstoßung (0.6) und höheres Alpha-Range
 * (0.35–0.95) damit Punkte auch ohne Mausnähe sichtbar sind.
 *
 * pointer-events: none, damit der SVG-Spielfeld-Layer darunter nicht blockiert wird.
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

    // Verstärkte Parameter gegenüber V1 Nexus
    const SPACING = 26;   // dichter: 38 → 26
    const RADIUS = 180;   // weiter: 130 → 180
    const PUSH = 0.6;     // stärker: 0.45 → 0.6
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

      for (const d of dots) {
        const dxM = d.x - mx;
        const dyM = d.y - my;
        const dist = Math.hypot(dxM, dyM);

        if (dist < RADIUS && dist > 0.001) {
          const force = (1 - dist / RADIUS) * PUSH;
          d.vx += (dxM / dist) * force * 3;
          d.vy += (dyM / dist) * force * 3;
        }

        d.vx += (d.ox - d.x) * SPRING;
        d.vy += (d.oy - d.y) * SPRING;
        d.vx *= FRICTION;
        d.vy *= FRICTION;
        d.x += d.vx;
        d.y += d.vy;

        // Erhöhtes Alpha-Range: 0.35–0.95 (V1: 0.18–0.85) – Punkte grundsätzlich sichtbarer
        const alpha = Math.min(0.95, 0.35 + (1 - Math.min(dist, RADIUS) / RADIUS) * 0.5);
        ctx.fillStyle = `rgba(29, 95, 173, ${alpha})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.6, 0, Math.PI * 2); // leicht größer: 1.4 → 1.6
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
