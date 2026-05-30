"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type InstaPost, formatPostDate } from "@/lib/beholdFeed";
import { spotlightMove, SpotlightOverlays } from "./Spotlight";
import InstagramLink from "./InstagramLink";

/**
 * Variante B – „Cylinder".
 *
 * Sechs Posts auf einem rotierenden 3D-Zylinder. Statt kontinuierlicher
 * Scroll-/rAF-Rotation (Referenz ravikatiyar/circular-gallery) dreht der
 * Zylinder hier in Schritten: alle 4 Sekunden eine Card weiter, weich per
 * CSS-Transition; Pfeile drehen ±1. Pause bei Hover.
 *
 * Geometrie bewusst kompakt (kleiner Radius, große Perspektive), damit die
 * nach vorn skalierte Front-Card vollständig in der Section bleibt und nichts
 * in den Footer ragt (overflow-hidden auf der Section).
 */
const CARD_W = 232;
const CARD_H = 290;
const RADIUS = 330; // Abstand zur Zylinderachse – klein = kompakt
const PERSPECTIVE = 2200; // groß = wenig Front-Zoom (Card passt in die Section)
const SECTION_H = 480;
const AUTO_MS = 4000; // jede Card ~4 s sichtbar

export default function CylinderCarousel({ posts }: { posts: InstaPost[] }) {
  const [rotation, setRotation] = useState(0);
  const [paused, setPaused] = useState(false);
  const anglePerItem = 360 / posts.length;

  // Eine Card weiterdrehen (negativ = nächste Card nach vorne).
  const rotate = useCallback(
    (dir: 1 | -1) => setRotation((prev) => prev - dir * anglePerItem),
    [anglePerItem],
  );

  // stabile Referenz auf „nächste Card" für den Auto-Advance-Interval
  const nextRef = useRef(() => rotate(1));
  nextRef.current = () => rotate(1);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => nextRef.current(), AUTO_MS);
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <div
      className="relative mx-auto max-w-5xl overflow-hidden"
      style={{ height: SECTION_H, perspective: `${PERSPECTIVE}px` }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Rotierende Zylinderachse (Mitte der Section) */}
      <div
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateY(${rotation}deg)`,
          transition: "transform 0.8s ease",
        }}
      >
        {posts.map((post, i) => {
          const itemAngle = i * anglePerItem;
          // Sichtbarkeit anhand des Winkels zur Front (0°) abblenden.
          const relative = (((itemAngle + rotation) % 360) + 360) % 360;
          const fromFront = relative > 180 ? 360 - relative : relative;
          const opacity = Math.max(0.2, 1 - fromFront / 150);

          return (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Beitrag auf Instagram ansehen"
              onMouseMove={spotlightMove}
              className="spotlight-card group absolute overflow-hidden rounded-xl border border-fcb-border bg-fcb-surface shadow-2xl"
              style={{
                width: CARD_W,
                height: CARD_H,
                left: "50%",
                top: "50%",
                marginLeft: -CARD_W / 2,
                marginTop: -CARD_H / 2,
                transform: `rotateY(${itemAngle}deg) translateZ(${RADIUS}px)`,
                opacity,
                transition: "opacity 0.4s linear",
              }}
            >
              <SpotlightOverlays />
              <Image
                src={post.imageUrl}
                alt={post.caption.slice(0, 80) || "Instagram-Beitrag"}
                fill
                sizes="232px"
                className="object-cover"
              />
              <InstagramLink className="absolute right-2.5 top-2.5" />
              <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-10">
                <p className="font-inter text-[0.65rem] uppercase tracking-wider text-fcb-blue">
                  {formatPostDate(post.timestamp)}
                </p>
                <p className="mt-1 line-clamp-2 font-inter text-xs text-white/90">
                  {post.caption}
                </p>
              </div>
            </a>
          );
        })}
      </div>

      {/* Pfeil-Navigation – vertikal mittig zur Card-Höhe (Section-Mitte) */}
      <button
        type="button"
        onClick={() => rotate(-1)}
        aria-label="Vorheriger Beitrag"
        className="absolute left-2 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-fcb-blue sm:left-6"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        type="button"
        onClick={() => rotate(1)}
        aria-label="Nächster Beitrag"
        className="absolute right-2 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-fcb-blue sm:right-6"
      >
        <ChevronRight size={22} />
      </button>
    </div>
  );
}
