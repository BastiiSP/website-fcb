"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type InstaPost, formatPostDate } from "@/lib/beholdFeed";
import { spotlightMove, SpotlightOverlays } from "./Spotlight";
import InstagramLink from "./InstagramLink";

/**
 * Variante D – „Feature".
 *
 * Großer, zentrierter Hauptpost im Instagram-typischen 4:5-Format; die Nachbarn
 * liegen verkleinert und unscharf daneben. Auto-Wechsel alle 4 s + Pfeile +
 * Touch-Swipe (primäre Interaktion auf Mobilgeräten, da dort kein Hover).
 * Caption + Datum wechseln per AnimatePresence synchron mit dem Bild.
 */
const AUTO_MS = 4000;
const SWIPE_THRESHOLD = 40; // px – ab hier zählt eine Wischgeste

export default function FeatureCarousel({ posts }: { posts: InstaPost[] }) {
  const total = posts.length;
  const [current, setCurrent] = useState(Math.floor(total / 2));
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const prev = () => setCurrent((c) => (c - 1 + total) % total);

  // Auto-Wechsel; pausiert bei Hover (Desktop).
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, AUTO_MS);
    return () => clearInterval(timer);
  }, [next, paused]);

  // Touch-Swipe für Mobilgeräte.
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      if (delta < 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  const active = posts[current];

  return (
    <div
      className="relative mx-auto flex w-full max-w-5xl flex-col items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative flex h-[360px] w-full items-center justify-center md:h-[440px]">
        <div className="relative flex h-full w-full items-center justify-center [perspective:1200px]">
          {posts.map((post, index) => {
            // Position relativ zum aktiven Post in den Bereich [-half, +half].
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
                aria-label="Beitrag auf Instagram ansehen"
                onMouseMove={spotlightMove}
                className="spotlight-card group absolute aspect-[4/5] w-60 overflow-hidden rounded-3xl border-2 border-fcb-border shadow-2xl transition-all duration-500 ease-in-out md:w-80"
                style={{
                  transform: `translateX(${pos * 44}%) scale(${
                    isCenter ? 1 : isAdjacent ? 0.8 : 0.66
                  }) rotateY(${pos * -9}deg)`,
                  zIndex: isCenter ? 10 : isAdjacent ? 5 : 1,
                  opacity: isCenter ? 1 : isAdjacent ? 0.55 : 0,
                  filter: isCenter ? "blur(0px)" : "blur(4px)",
                  visibility: Math.abs(pos) > 1 ? "hidden" : "visible",
                  pointerEvents: isCenter ? "auto" : "none",
                }}
              >
                {isCenter && <SpotlightOverlays />}
                <Image
                  src={post.imageUrl}
                  alt={post.caption.slice(0, 80) || "Instagram-Beitrag"}
                  fill
                  sizes="(max-width: 768px) 240px, 320px"
                  className="object-cover"
                />
                {isCenter && <InstagramLink className="absolute right-3 top-3" />}
              </a>
            );
          })}
        </div>

        {/* Pfeil-Navigation (Touch-Target 48×48 px) */}
        <button
          type="button"
          onClick={prev}
          aria-label="Vorheriger Beitrag"
          className="absolute left-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-fcb-blue sm:left-6"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Nächster Beitrag"
          className="absolute right-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-fcb-blue sm:right-6"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Caption + Datum – wechseln synchron animiert mit dem aktiven Post */}
      <div className="mt-6 flex min-h-[5rem] max-w-xl items-start justify-center px-4 text-center">
        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-inter text-xs uppercase tracking-wider text-fcb-blue">
                {formatPostDate(active.timestamp)}
              </p>
              <p className="mt-2 line-clamp-3 font-inter text-sm text-white/85">
                {active.caption}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
