"use client";

import { useEffect, useRef } from "react";

/**
 * Vollflächiger Canvas-Hintergrund mit einem Dot-Grid, das auf die Maus
 * reagiert. Punkte werden vom Cursor weggedrückt und federn mit Spring-Damping
 * an ihre Ursprungsposition zurück.
 *
 * Performance-Hinweise:
 * - requestAnimationFrame-Loop, kein React-State pro Frame
 * - DPR (devicePixelRatio) wird berücksichtigt für scharfe Punkte auf Retina
 * - Mouse-Position wird im ref gehalten, kein Re-Render
 * - Resize wird gedebounced via setTimeout (250 ms)
 */
export default function NexusCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dot-Definition: jedes Element trackt Ziel- und aktuelle Position + Velocity
    interface Dot {
      ox: number;
      oy: number; // Ursprung
      x: number;
      y: number; // aktuelle Position
      vx: number;
      vy: number; // Velocity für Spring-Verhalten
    }

    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;

    const SPACING = 38; // Abstand zwischen Punkten in CSS-Pixeln
    const RADIUS = 130; // Wirkbereich der Maus
    const PUSH = 0.45; // Stärke der Abstoßung
    const SPRING = 0.08; // Wie stark der Punkt zurückgezogen wird
    const FRICTION = 0.86; // Velocity-Dämpfung pro Frame

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
        // Distanz Maus → Punkt-Ursprung
        const dxM = d.x - mx;
        const dyM = d.y - my;
        const dist = Math.hypot(dxM, dyM);

        if (dist < RADIUS && dist > 0.001) {
          // Punkt wird weggedrückt – Stärke fällt linear mit Distanz
          const force = (1 - dist / RADIUS) * PUSH;
          d.vx += (dxM / dist) * force * 3;
          d.vy += (dyM / dist) * force * 3;
        }

        // Spring zurück zum Ursprung
        d.vx += (d.ox - d.x) * SPRING;
        d.vy += (d.oy - d.y) * SPRING;
        d.vx *= FRICTION;
        d.vy *= FRICTION;
        d.x += d.vx;
        d.y += d.vy;

        // Punkte werden bei Nähe zur Maus heller (Glow-Effekt)
        const alpha = Math.min(0.85, 0.18 + (1 - Math.min(dist, RADIUS) / RADIUS) * 0.6);
        ctx.fillStyle = `rgba(29, 95, 173, ${alpha})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.4, 0, Math.PI * 2);
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

    // Resize gedebounced – verhindert Endlos-Rebuilds beim Drag
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
    />
  );
}
