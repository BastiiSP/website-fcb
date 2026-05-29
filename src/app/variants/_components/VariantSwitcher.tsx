"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Dünne Leiste ganz oben mit den Vergleichs-Pills: V1 Nexus, V2 Graphic, Hybrid.
 * V3 Minimal und V4 Dynamic wurden nach Variantenvergleich entfernt.
 * Aktive Variante ist FCB-Blau hervorgehoben.
 */
type NumberedVariant = { num: number; label: string };
type SlugVariant = { slug: string; label: string };
type Variant = NumberedVariant | SlugVariant;

const VARIANTS: Variant[] = [
  { num: 1, label: "Nexus" },
  { num: 2, label: "Graphic" },
  { slug: "hybrid", label: "Hybrid" },
];

export default function VariantSwitcher() {
  const pathname = usePathname() ?? "";

  return (
    <div className="sticky top-0 z-[100] w-full bg-black/90 backdrop-blur-md border-b border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-xs">
        <span className="font-inter uppercase tracking-widest text-white/60">
          FCB · Design Exploration
        </span>
        <nav className="flex items-center gap-1">
          {VARIANTS.map((v) => {
            const href = "num" in v ? `/variants/${v.num}` : `/variants/${v.slug}`;
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
                <span className="font-semibold">
                  {"num" in v ? `V${v.num}` : "Hybrid"}
                </span>
                <span className="ml-1.5 hidden sm:inline text-white/80">
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
