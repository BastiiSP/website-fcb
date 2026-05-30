"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type InstaPost, formatPostDate } from "@/lib/beholdFeed";

/**
 * Variante B – „Cylinder".
 *
 * Sechs Posts auf einem rotierenden 3D-Zylinder. Anders als die Referenz
 * (ravikatiyar/circular-gallery, scroll-getrieben) rotiert der Zylinder hier
 * automatisch und lässt sich per Pfeil-Buttons um je eine Card weiterdrehen –
 * die Section ist Teil der Hauptseite und darf keinen eigenen Scroll-Kontext
 * kapern. Bei Hover pausiert die Auto-Rotation.
 *
 * Caption + Datum liegen als Gradient-Overlay am unteren Card-Rand.
 */
const RADIUS = 480; // Abstand der Cards zur Zylinderachse (px)
const AUTO_SPEED = 0.18; // Grad pro Frame bei Auto-Rotation

export default function CylinderCarousel({ posts }: { posts: InstaPost[] }) {
  const [rotation, setRotation] = useState(0);
  const [paused, setPaused] = useState(false);
  const frameRef = useRef<number | null>(null);

  const anglePerItem = 360 / posts.length;

  // Auto-Rotation per requestAnimationFrame; pausiert bei Hover/Interaktion.
  useEffect(() => {
    const tick = () => {
      if (!paused) setRotation((prev) => prev + AUTO_SPEED);
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [paused]);

  // Pfeil-Navigation: um genau eine Card weiterdrehen (sanft per CSS-Transition).
  const rotate = useCallback(
    (dir: 1 | -1) => setRotation((prev) => prev - dir * anglePerItem),
    [anglePerItem],
  );

  return (
    <div
      className="relative mx-auto flex h-[440px] max-w-5xl items-center justify-center"
      style={{ perspective: "1800px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Rotierende Zylinderachse */}
      <div
        className="relative h-[360px] w-[260px]"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateY(${rotation}deg)`,
          // Beim Klick sanft snappen; während Auto-Rotation ohne Transition.
          transition: paused ? "transform 0.6s ease" : "none",
        }}
      >
        {posts.map((post, i) => {
          const itemAngle = i * anglePerItem;
          // Sichtbarkeit anhand des Winkels zur Front (0°) abblenden.
          const relative = (((itemAngle + rotation) % 360) + 360) % 360;
          const fromFront = relative > 180 ? 360 - relative : relative;
          const opacity = Math.max(0.25, 1 - fromFront / 150);

          return (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute left-1/2 top-1/2 h-[360px] w-[260px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-fcb-border bg-fcb-surface shadow-2xl"
              style={{
                transform: `rotateY(${itemAngle}deg) translateZ(${RADIUS}px)`,
                opacity,
                transition: "opacity 0.3s linear",
              }}
            >
              <Image
                src={post.imageUrl}
                alt={post.caption.slice(0, 80) || "Instagram-Beitrag"}
                fill
                sizes="260px"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-12">
                <p className="font-inter text-[0.7rem] uppercase tracking-wider text-fcb-blue">
                  {formatPostDate(post.timestamp)}
                </p>
                <p className="mt-1 line-clamp-2 font-inter text-sm text-white/90">
                  {post.caption}
                </p>
              </div>
            </a>
          );
        })}
      </div>

      {/* Pfeil-Navigation */}
      <button
        type="button"
        onClick={() => rotate(-1)}
        aria-label="Vorheriger Beitrag"
        className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-fcb-blue sm:left-6"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        type="button"
        onClick={() => rotate(1)}
        aria-label="Nächster Beitrag"
        className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-fcb-blue sm:right-6"
      >
        <ChevronRight size={22} />
      </button>
    </div>
  );
}
