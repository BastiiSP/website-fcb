"use client";

import Image from "next/image";
import { type InstaPost, formatPostDate } from "@/lib/beholdFeed";
import { spotlightMove, SpotlightOverlays } from "./Spotlight";
import InstagramLink from "./InstagramLink";

/**
 * Variante A – „Spotlight".
 *
 * 3×2-Raster aus Zwei-Zonen-Cards: Bild oben (4:5), Textbereich unten. Beim
 * Hover leuchtet der FCB-blaue Rand-Glow prominent auf, ein dezenter Lichtkegel
 * folgt dem Cursor über der Bildfläche. Die Instagram-Box im Textbereich
 * leuchtet im Markengradient auf.
 */
export default function SpotlightCarousel({ posts }: { posts: InstaPost[] }) {
  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <a
          key={post.id}
          href={post.permalink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Beitrag auf Instagram ansehen"
          onMouseMove={spotlightMove}
          className="spotlight-card group flex flex-col overflow-hidden rounded-2xl border border-fcb-border bg-fcb-surface"
        >
          <SpotlightOverlays />

          {/* Bild-Zone */}
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={post.imageUrl}
              alt={post.caption.slice(0, 80) || "Instagram-Beitrag"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Text-Zone (eigener Bereich unter dem Bild, z-10 über dem Lichtkegel) */}
          <div className="relative z-10 flex flex-1 flex-col gap-2 p-4">
            <div className="flex items-center justify-between">
              <p className="font-inter text-[0.7rem] uppercase tracking-wider text-fcb-blue">
                {formatPostDate(post.timestamp)}
              </p>
              <InstagramLink />
            </div>
            <p className="line-clamp-3 font-inter text-sm leading-relaxed text-white/85">
              {post.caption}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}
