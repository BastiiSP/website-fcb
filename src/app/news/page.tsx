import type { Metadata } from "next";
import PageShell from "@/components/ui/PageShell";
import PageHeader from "@/components/ui/PageHeader";
import ButtonLink from "@/components/ui/ButtonLink";
import NewsPostCard from "@/components/news/NewsPostCard";
import { getInstagramPosts } from "@/lib/beholdFeed";
import { VEREINSLINKS } from "@/lib/vereinslinks";

export const metadata: Metadata = {
  title: "News – 1. FC 1911 Burgkunstadt",
  description:
    "Neuigkeiten vom 1. FC 1911 Burgkunstadt: Spielberichte, Termine und Bilder direkt aus unserem Instagram-Kanal.",
};

// News-Seite = prominente Instagram-Ansicht. Bewusst KEIN eigenes CMS:
// Der Verein pflegt Inhalte nur auf Instagram, die Seite zieht sie automatisch
// über den Behold-Feed (1-h-Cache in getInstagramPosts → ISR, Free-Tier-schonend).

export default async function NewsPage() {
  const posts = await getInstagramPosts();
  const instagramLink = VEREINSLINKS.find((l) => l.icon === "instagram");

  return (
    <PageShell maxWidth="lg">
      <PageHeader
        title="News"
        subtitle="Was beim FCB los ist: unsere Instagram-Beiträge, automatisch aktuell."
      />

      {posts.length === 0 ? (
        // Leerer Feed (z. B. Feed nicht erreichbar): freundlicher Hinweis statt Fehlerseite
        <div className="rounded-2xl border border-fcb-border bg-fcb-surface p-8 text-center">
          <p className="font-inter text-base text-fcb-text/80">
            Gerade können wir hier keine Beiträge laden. Schau am besten direkt
            auf unserem Instagram-Kanal vorbei, da ist immer was los.
          </p>
          {instagramLink && (
            <div className="mt-5 flex justify-center">
              <ButtonLink href={instagramLink.url} external variant="primary">
                Zu unserem Instagram
              </ButtonLink>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-8">
            {posts.map((post) => (
              <NewsPostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Abschluss: mehr gibt es auf Instagram */}
          {instagramLink && (
            <div className="mt-12 text-center">
              <p className="font-inter text-sm text-fcb-muted">
                Noch mehr Bilder und Stories gibt es auf unserem Kanal.
              </p>
              <div className="mt-4 flex justify-center">
                <ButtonLink
                  href={instagramLink.url}
                  external
                  variant="secondary"
                >
                  @schuhstaedter1911 auf Instagram
                </ButtonLink>
              </div>
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}
