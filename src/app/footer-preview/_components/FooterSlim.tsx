"use client";

import Link from "next/link";
import { FacebookIcon, InstagramIcon } from "@/components/icons/BrandIcons";
import { FCB_FOOTER } from "../_data";

/**
 * Variante „Slim Bar" – maximal kompakt, alles in einer Zeile (~60 px).
 * Vereinsname links, Rechtliches mittig, Social rechts. Auf Mobile gestapelt.
 */
export default function FooterSlim() {
  const jahr = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-fcb-border bg-fcb-bg text-fcb-text">
      <div className="mx-auto flex min-h-[60px] max-w-6xl flex-col items-center justify-between gap-2 px-4 py-2 sm:flex-row">
        {/* Links: Vereinsname */}
        <span className="font-oswald text-sm font-semibold uppercase tracking-wide">
          {FCB_FOOTER.vereinsname}
        </span>

        {/* Mitte: Rechtliches + Copyright */}
        <nav className="flex items-center gap-3 font-inter text-xs text-fcb-muted">
          <Link href="/impressum" className="transition-colors hover:text-fcb-blue">
            Impressum
          </Link>
          <span aria-hidden className="text-fcb-border">|</span>
          <Link href="/datenschutz" className="transition-colors hover:text-fcb-blue">
            Datenschutz
          </Link>
          <span aria-hidden className="text-fcb-border">|</span>
          <span>© {jahr}</span>
        </nav>

        {/* Rechts: Social */}
        <div className="flex items-center gap-3">
          <Link
            href={FCB_FOOTER.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-fcb-muted transition-colors hover:text-fcb-blue"
          >
            <FacebookIcon className="h-5 w-5" />
          </Link>
          <Link
            href={FCB_FOOTER.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-fcb-muted transition-colors hover:text-fcb-blue"
          >
            <InstagramIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
