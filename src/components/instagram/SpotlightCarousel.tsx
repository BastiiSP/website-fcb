"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { type InstaPost, formatPostDate } from "@/lib/beholdFeed";

/**
 * Variante A – „Spotlight".
 *
 * 3×2-Raster aus Hochformat-Cards. Ein maus-folgender Spotlight beleuchtet
 * Kartenrand und -oberfläche in FCB-Blau. Umgesetzt mit CSS-Custom-Properties
 * (--x/--y) plus `background-attachment: fixed`: der Spotlight liegt im
 * Viewport-Koordinatensystem, alle Cards teilen sich also denselben Lichtkegel.
 *
 * Referenz: easemize/spotlight-card – Glow-Hue von Lila/Blau (220) auf
 * FCB-Blau-Bereich (~210) festgelegt.
 */

// Glow-Definitionen einmalig im DOM. data-spot markiert eine beleuchtbare Card.
const GLOW_STYLES = `
  [data-spot] {
    --border-size: 2px;
    --spot-size: 280px;
    --hue: 210;
    --sat: 85%;
  }
  [data-spot]::before,
  [data-spot]::after {
    pointer-events: none;
    content: "";
    position: absolute;
    inset: calc(var(--border-size) * -1);
    border: var(--border-size) solid transparent;
    border-radius: 1rem;
    background-attachment: fixed;
    background-repeat: no-repeat;
    background-position: 50% 50%;
    background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
    -webkit-mask: linear-gradient(transparent, transparent), linear-gradient(#fff, #fff);
    mask: linear-gradient(transparent, transparent), linear-gradient(#fff, #fff);
    -webkit-mask-clip: padding-box, border-box;
    mask-clip: padding-box, border-box;
    -webkit-mask-composite: source-in, xor;
    mask-composite: intersect;
  }
  /* Leuchtender Rahmen (FCB-Blau) */
  [data-spot]::before {
    background-image: radial-gradient(
      calc(var(--spot-size) * 0.8) calc(var(--spot-size) * 0.8)
      at calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
      hsl(var(--hue) var(--sat) 60% / 1), transparent 100%);
    filter: brightness(1.4);
  }
  /* Heller Kern */
  [data-spot]::after {
    background-image: radial-gradient(
      calc(var(--spot-size) * 0.5) calc(var(--spot-size) * 0.5)
      at calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
      hsl(0 0% 100% / 0.9), transparent 100%);
  }
  /* Oberflächen-Schimmer über dem Bild */
  [data-spot] .spot-surface {
    background-image: radial-gradient(
      var(--spot-size) var(--spot-size)
      at calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
      hsl(var(--hue) var(--sat) 65% / 0.35), transparent 70%);
    background-attachment: fixed;
  }
`;

export default function SpotlightCarousel({ posts }: { posts: InstaPost[] }) {
  // Spotlight-Koordinaten (Viewport-Pixel) auf dem Grid-Container setzen –
  // die Cards erben --x/--y via CSS-Variablen-Vererbung.
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncPointer = (e: PointerEvent) => {
      const el = gridRef.current;
      if (!el) return;
      el.style.setProperty("--x", e.clientX.toFixed(1));
      el.style.setProperty("--y", e.clientY.toFixed(1));
    };
    document.addEventListener("pointermove", syncPointer);
    return () => document.removeEventListener("pointermove", syncPointer);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOW_STYLES }} />
      <div
        ref={gridRef}
        className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {posts.map((post) => (
          <a
            key={post.id}
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            data-spot
            className="group relative block aspect-[3/4] overflow-hidden rounded-2xl border-2 border-fcb-border bg-fcb-surface"
          >
            {/* Bild */}
            <Image
              src={post.imageUrl}
              alt={post.caption.slice(0, 80) || "Instagram-Beitrag"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Oberflächen-Schimmer (folgt der Maus) */}
            <div
              aria-hidden
              className="spot-surface pointer-events-none absolute inset-0 z-10 mix-blend-screen"
            />

            {/* Lesbarkeits-Gradient + Text */}
            <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-12">
              <p className="font-inter text-[0.7rem] uppercase tracking-wider text-fcb-blue">
                {formatPostDate(post.timestamp)}
              </p>
              <p className="mt-1 line-clamp-2 font-inter text-sm text-white/90">
                {post.caption}
              </p>
            </div>

            {/* Hover-CTA */}
            <div className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-full bg-fcb-blue px-3 py-1.5 font-inter text-xs font-semibold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Auf Instagram
              <ArrowUpRight size={14} />
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
