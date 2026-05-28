"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Dünne Leiste ganz oben mit den vier Vergleichs-Pills V1–V4.
 * Aktive Variante ist FCB-Blau hervorgehoben. Bleibt immer sichtbar
 * (sticky top-0), damit der Vergleich beim Scrollen leicht bleibt.
 */
const VARIANTS = [
  { num: 1, label: "Nexus" },
  { num: 2, label: "Graphic" },
  { num: 3, label: "Minimal" },
  { num: 4, label: "Dynamic" },
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
            const href = `/variants/${v.num}`;
            const isActive = pathname === href;
            return (
              <Link
                key={v.num}
                href={href}
                className={[
                  "rounded-full px-3 py-1 font-inter font-medium transition-colors",
                  isActive
                    ? "bg-fcb-blue text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                <span className="font-semibold">V{v.num}</span>
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
