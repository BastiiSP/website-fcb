import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Übersichtsseite des Instagram-Playgrounds: vier Karten, die zu den
 * Varianten A–D verlinken. Server Component – keine Interaktivität nötig.
 */
const VARIANTS = [
  {
    slug: "a",
    name: "Spotlight",
    desc: "3×2-Raster aus Hochformat-Cards mit maus-folgendem Glow-Effekt in FCB-Blau.",
  },
  {
    slug: "b",
    name: "Cylinder",
    desc: "Rotierender 3D-Zylinder mit Auto-Rotation und Pfeil-Navigation.",
  },
  {
    slug: "c",
    name: "Stack",
    desc: "Horizontal gestapelte Cards mit 3D-Tiefe, per Pfeilen durchblätterbar.",
  },
  {
    slug: "d",
    name: "Feature",
    desc: "Großer Hauptpost zentral, unscharfe Nachbarn – Auto-Wechsel alle 4 Sekunden.",
  },
];

export default function InstagramOverviewPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <header className="mb-12 text-center">
        <h1 className="font-oswald text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          Instagram-Carousel · 4 Varianten
        </h1>
        <p className="mx-auto mt-3 max-w-2xl font-inter text-sm text-white/60">
          Vier Design-Varianten für den Instagram-Feed der Startseite – alle aus
          demselben Behold-Feed gespeist. Wähle deinen Favoriten.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        {VARIANTS.map((v) => (
          <Link
            key={v.slug}
            href={`/instagram/${v.slug}`}
            className="group rounded-2xl border border-fcb-border bg-fcb-surface p-6 transition-colors hover:border-fcb-blue"
          >
            <div className="flex items-center justify-between">
              <span className="font-oswald text-xs font-bold uppercase tracking-widest text-fcb-blue">
                Variante {v.slug.toUpperCase()}
              </span>
              <ArrowRight
                size={18}
                className="text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-fcb-blue"
              />
            </div>
            <h2 className="mt-2 font-oswald text-2xl font-bold uppercase">
              {v.name}
            </h2>
            <p className="mt-2 font-inter text-sm text-white/60">{v.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
