import { ImageOff } from "lucide-react";

/**
 * Einheitlicher Rahmen für jede Varianten-Seite: Überschrift „Vereins-News"
 * plus Varianten-Label. Hält die vier Seiten optisch konsistent.
 */
export function CarouselShell({
  variant,
  name,
  children,
}: {
  variant: string;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <main className="px-4 py-12">
      <header className="mx-auto mb-10 max-w-5xl text-center">
        <p className="font-oswald text-xs font-bold uppercase tracking-[0.3em] text-fcb-blue">
          Variante {variant} · {name}
        </p>
        <h1 className="mt-2 font-oswald text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          Vereins-News
        </h1>
      </header>
      {children}
    </main>
  );
}

/** Dezenter Leerzustand, falls der Feed (vorübergehend) keine Posts liefert. */
export function EmptyFeed() {
  return (
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
  );
}
