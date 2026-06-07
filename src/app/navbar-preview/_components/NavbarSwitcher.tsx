"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Dünne Top-Leiste zum Wechseln zwischen den Navbar-Button-Varianten.
 * Muster übernommen vom FooterSwitcher (/footer-preview).
 */
const VARIANTS = [
  { slug: "single-cta", label: "Single CTA" },
  { slug: "split", label: "Split" },
  { slug: "textlinks", label: "Textlinks" },
];

export default function NavbarSwitcher() {
  const pathname = usePathname() ?? "";

  return (
    <div className="sticky top-0 z-[100] w-full border-b border-fcb-border bg-fcb-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-xs">
        <span className="font-inter uppercase tracking-widest text-fcb-muted">
          FCB · Navbar-Varianten
        </span>
        <nav className="flex items-center gap-1">
          {VARIANTS.map((v) => {
            const href = `/navbar-preview/${v.slug}`;
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "rounded-full px-3 py-1 font-inter font-medium transition-colors",
                  isActive
                    ? "bg-fcb-blue text-white"
                    : "text-fcb-muted hover:bg-fcb-surface hover:text-fcb-text",
                ].join(" ")}
              >
                {v.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
