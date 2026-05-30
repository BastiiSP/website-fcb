"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { type InstaPost, formatPostDate } from "@/lib/beholdFeed";

/**
 * Variante D – „Feature".
 *
 * Ein großer, zentrierter Hauptpost; die Nachbarn liegen verkleinert und
 * unscharf daneben. Auto-Wechsel alle 4 Sekunden plus Pfeil-Navigation.
 * Caption + Datum erscheinen unter dem aktiven Post.
 *
 * Referenz: ravikatiyar/feature-carousel – Styling auf FCB-Tokens umgestellt,
 * Auto-Wechsel pausiert bei Hover.
 */
const AUTO_MS = 4000;

export default function FeatureCarousel({ posts }: { posts: InstaPost[] }) {
  const total = posts.length;
  const [current, setCurrent] = useState(Math.floor(total / 2));
  const [paused, setPaused] = useState(false);

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % total),
    [total],
  );
  const prev = () => setCurrent((c) => (c - 1 + total) % total);

  // Auto-Wechsel; pausiert bei Hover.
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, AUTO_MS);
    return () => clearInterval(timer);
  }, [next, paused]);

  const active = posts[current];

  return (
    <div
      className="relative mx-auto flex w-full max-w-5xl flex-col items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative flex h-[420px] w-full items-center justify-center md:h-[480px]">
        <div className="relative flex h-full w-full items-center justify-center [perspective:1200px]">
          {posts.map((post, index) => {
            // Position relativ zum aktiven Post in den Bereich [-half, +half] legen.
            let pos = (index - current + total) % total;
            if (pos > Math.floor(total / 2)) pos -= total;
            const isCenter = pos === 0;
            const isAdjacent = Math.abs(pos) === 1;

            return (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute h-80 w-56 overflow-hidden rounded-3xl border-2 border-fcb-border shadow-2xl transition-all duration-500 ease-in-out md:h-[440px] md:w-72"
                style={{
                  transform: `translateX(${pos * 48}%) scale(${
                    isCenter ? 1 : isAdjacent ? 0.85 : 0.7
                  }) rotateY(${pos * -10}deg)`,
                  zIndex: isCenter ? 10 : isAdjacent ? 5 : 1,
                  opacity: isCenter ? 1 : isAdjacent ? 0.45 : 0,
                  filter: isCenter ? "blur(0px)" : "blur(4px)",
                  visibility: Math.abs(pos) > 1 ? "hidden" : "visible",
                  pointerEvents: isCenter ? "auto" : "none",
                }}
              >
                <Image
                  src={post.imageUrl}
                  alt={post.caption.slice(0, 80) || "Instagram-Beitrag"}
                  fill
                  sizes="(max-width: 768px) 224px, 288px"
                  className="object-cover"
                />
                {isCenter && (
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-fcb-blue px-3 py-1.5 font-inter text-xs font-semibold text-white">
                    Auf Instagram
                    <ArrowUpRight size={14} />
                  </div>
                )}
              </a>
            );
          })}
        </div>

        {/* Pfeil-Navigation */}
        <button
          type="button"
          onClick={prev}
          aria-label="Vorheriger Beitrag"
          className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-fcb-blue sm:left-6"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Nächster Beitrag"
          className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-fcb-blue sm:right-6"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Caption + Datum des aktiven Posts */}
      {active && (
        <div className="mt-6 max-w-xl px-4 text-center">
          <p className="font-inter text-xs uppercase tracking-wider text-fcb-blue">
            {formatPostDate(active.timestamp)}
          </p>
          <p className="mt-2 line-clamp-3 font-inter text-sm text-white/85">
            {active.caption}
          </p>
        </div>
      )}
    </div>
  );
}
