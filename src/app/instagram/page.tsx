import type { Metadata } from "next";
import { ImageOff } from "lucide-react";
import { getInstagramPosts } from "@/lib/beholdFeed";
import InstagramCarousel from "@/components/instagram/InstagramCarousel";

/**
 * Finale Instagram-Carousel-Seite (Runde 3).
 *
 * Zeigt direkt die eine finale Variante (kein Switcher/keine Unterrouten mehr).
 * Läuft mit der Live-Chrome (Header/Footer) und auf FCB-dunklem Hintergrund –
 * eine realistische Vorschau dafür, wie der Block auf der Startseite wirkt.
 *
 * Server Component: lädt die Posts serverseitig (1 h gecacht) und reicht sie an
 * das Client-Carousel durch.
 */
export const metadata: Metadata = {
  title: "FCB · Instagram",
  description: "Aktuelle Beiträge des 1. FC 1911 Burgkunstadt von Instagram.",
};

export default async function InstagramPage() {
  const posts = await getInstagramPosts(6);

  return (
    <div className="min-h-screen bg-fcb-bg text-fcb-text">
      <section className="px-4 py-12 md:py-16">
        <header className="mx-auto mb-10 max-w-5xl text-center">
          <p className="font-oswald text-xs font-bold uppercase tracking-[0.3em] text-fcb-blue">
            Aus dem Vereinsleben
          </p>
          <h1 className="mt-2 font-oswald text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Vereins-News
          </h1>
        </header>

        {posts.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-fcb-border bg-fcb-surface px-6 py-12 text-center">
            <ImageOff size={28} className="text-white/40" />
            <p className="font-inter text-sm text-white/60">
              Aktuell konnten keine Instagram-Beiträge geladen werden. Prüfe, ob
              <code className="mx-1 rounded bg-black/40 px-1 py-0.5 text-white/80">
                BEHOLD_FEED_URL
              </code>
              gesetzt ist.
            </p>
          </div>
        ) : (
          <InstagramCarousel posts={posts} />
        )}
      </section>
    </div>
  );
}
