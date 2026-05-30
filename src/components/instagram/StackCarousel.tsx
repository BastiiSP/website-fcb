"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { type InstaPost, formatPostDate } from "@/lib/beholdFeed";

/**
 * Variante C – „Stack".
 *
 * Cards stapeln sich mit 3D-Tiefe nach rechts hinten. Anders als die Referenz
 * (ui-layouts/stacking-card, vertikal + Lenis-Scroll) wird hier horizontal von
 * links nach rechts gestapelt und ausschließlich per Pfeil-Klick navigiert –
 * kein Scroll-Hijacking, kein Lenis. Übergänge via Framer Motion.
 *
 * Nur die vorderste Card ist verlinkt und zeigt Caption + Datum.
 */
const MAX_VISIBLE = 4; // dahinterliegende Cards ab hier ausblenden

export default function StackCarousel({ posts }: { posts: InstaPost[] }) {
  const [current, setCurrent] = useState(0);
  const n = posts.length;

  const next = () => setCurrent((c) => (c + 1) % n);
  const prev = () => setCurrent((c) => (c - 1 + n) % n);

  return (
    <div
      className="relative mx-auto flex h-[460px] max-w-5xl items-center justify-center"
      style={{ perspective: "1600px" }}
    >
      {posts.map((post, i) => {
        // Tiefe im Stapel: 0 = vorne, größer = weiter hinten rechts.
        const depth = (i - current + n) % n;
        const isFront = depth === 0;
        const hidden = depth >= MAX_VISIBLE;

        return (
          <div
            key={post.id}
            className="absolute inset-0 flex items-center justify-center"
            style={{ zIndex: n - depth }}
          >
            <motion.a
              href={isFront ? post.permalink : undefined}
              target={isFront ? "_blank" : undefined}
              rel={isFront ? "noopener noreferrer" : undefined}
              // Hinten liegende Cards nicht klickbar (verhindert Fehlklicks).
              className="group relative block h-[400px] w-[300px] overflow-hidden rounded-2xl border border-fcb-border bg-fcb-surface shadow-2xl"
              style={{ pointerEvents: isFront ? "auto" : "none" }}
              animate={{
                x: depth * 46,
                y: depth * -6,
                scale: 1 - depth * 0.06,
                rotateY: depth * -7,
                opacity: hidden ? 0 : 1,
              }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={post.imageUrl}
                alt={post.caption.slice(0, 80) || "Instagram-Beitrag"}
                fill
                sizes="300px"
                className="object-cover"
              />

              {/* Cards hinten abdunkeln, damit die Tiefe lesbar wird */}
              <div
                aria-hidden
                className="absolute inset-0 bg-black transition-opacity"
                style={{ opacity: depth * 0.16 }}
              />

              {/* Caption/Datum + CTA nur auf der vordersten Card */}
              {isFront && (
                <>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-12">
                    <p className="font-inter text-[0.7rem] uppercase tracking-wider text-fcb-blue">
                      {formatPostDate(post.timestamp)}
                    </p>
                    <p className="mt-1 line-clamp-2 font-inter text-sm text-white/90">
                      {post.caption}
                    </p>
                  </div>
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-fcb-blue px-3 py-1.5 font-inter text-xs font-semibold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Auf Instagram
                    <ArrowUpRight size={14} />
                  </div>
                </>
              )}
            </motion.a>
          </div>
        );
      })}

      {/* Pfeil-Navigation */}
      <button
        type="button"
        onClick={prev}
        aria-label="Vorheriger Beitrag"
        className="absolute left-2 top-1/2 z-[60] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-fcb-blue sm:left-6"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Nächster Beitrag"
        className="absolute right-2 top-1/2 z-[60] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-fcb-blue sm:right-6"
      >
        <ChevronRight size={22} />
      </button>
    </div>
  );
}
