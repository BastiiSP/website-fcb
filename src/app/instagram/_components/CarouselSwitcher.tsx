"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Dünne Vergleichsleiste für die vier Instagram-Carousel-Varianten.
 * Aktive Variante ist FCB-Blau hervorgehoben. Spiegelt das Muster des
 * Hero-Playground-VariantSwitcher (src/app/variants/_components/VariantSwitcher.tsx).
 */
const VARIANTS = [
  { slug: "a", label: "Spotlight" },
  { slug: "b", label: "Cylinder" },
  { slug: "c", label: "Stack" },
  { slug: "d", label: "Feature" },
];

export default function CarouselSwitcher() {
  const pathname = usePathname() ?? "";

  return (
    <div className="sticky top-0 z-[100] w-full border-b border-white/10 bg-black/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-xs">
        <Link
          href="/instagram"
          className="font-inter uppercase tracking-widest text-white/60 transition-colors hover:text-white"
        >
          FCB · Instagram-Varianten
        </Link>
        <nav className="flex items-center gap-1">
          {VARIANTS.map((v) => {
            const href = `/instagram/${v.slug}`;
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "rounded-full px-3 py-1 font-inter font-medium transition-colors",
                  isActive
                    ? "bg-fcb-blue text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                <span className="font-semibold uppercase">{v.slug}</span>
                <span className="ml-1.5 hidden text-white/80 sm:inline">
                  {v.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
