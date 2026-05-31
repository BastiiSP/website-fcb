"use client";

import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import type { InstaPost } from "@/lib/beholdFeed";
import InstagramCarousel from "./InstagramCarousel";

/**
 * „Vereins-News"-Sektion der Startseite: das finale Instagram-Carousel.
 *
 * Die Startseite (page.tsx) ist eine Client-Komponente, kann den Feed also nicht
 * serverseitig laden. Wir holen die Posts daher client-seitig vom gemeinsamen
 * Endpoint /api/instagram – der ist serverseitig 1 h gecacht und schont so das
 * Behold-Free-Tier-Kontingent. Kurzer Ladezustand, dann das Carousel.
 */
export default function InstagramSection() {
  // null = lädt noch, [] = geladen aber leer, [...] = Posts
  const [posts, setPosts] = useState<InstaPost[] | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/instagram")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: InstaPost[]) => {
        if (active) setPosts(data);
      })
      .catch(() => {
        if (active) setPosts([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="bg-fcb-bg px-4 py-12 md:py-16">
      <header className="mx-auto mb-10 max-w-5xl text-center">
        <p className="font-oswald text-xs font-bold uppercase tracking-[0.3em] text-fcb-blue">
          Aus dem Vereinsleben
        </p>
        <h2 className="mt-2 font-oswald text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          Vereins-News
        </h2>
      </header>

      {posts === null ? (
        // Ladezustand – reserviert ungefähr die Carousel-Höhe gegen Layout-Shift.
        <div className="flex h-[420px] items-center justify-center md:h-[480px]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-fcb-border border-t-fcb-blue" />
        </div>
      ) : posts.length === 0 ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-fcb-border bg-fcb-surface px-6 py-12 text-center">
          <ImageOff size={28} className="text-fcb-muted" />
          <p className="text-sm text-fcb-muted">
            Aktuell konnten keine Instagram-Beiträge geladen werden.
          </p>
        </div>
      ) : (
        <InstagramCarousel posts={posts} />
      )}
    </section>
  );
}
