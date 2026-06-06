import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/components/icons/BrandIcons";
import { FCB_FOOTER } from "../_data";

/**
 * Variante „Zweizeilig" – obere Zeile Wappen + Name + Adresse,
 * untere Zeile Rechtliches + Social + Copyright. Großzügiger als Slim,
 * aber noch kompakt.
 */
// Copyright-Jahr einmal auf Modulebene berechnen – stabil über Server/Client,
// kein Client-Boundary nötig (reine Server-Komponente).
const JAHR = new Date().getFullYear();

export default function FooterZweizeilig() {
  return (
    <footer className="w-full border-t border-fcb-border bg-fcb-bg text-fcb-text">
      <div className="mx-auto max-w-6xl px-4 py-5">
        {/* Obere Zeile: Wappen + Name + Adresse */}
        <div className="flex flex-col items-center gap-3 border-b border-fcb-border pb-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="Vereinslogo 1. FC 1911 Burgkunstadt"
              width={40}
              height={40}
              className="drop-shadow-lg"
            />
            <span className="font-oswald text-lg font-semibold uppercase tracking-wide">
              {FCB_FOOTER.vereinsname}
            </span>
          </div>
          <div className="flex items-center gap-2 font-inter text-sm text-fcb-muted">
            <MapPin className="h-4 w-4 shrink-0 text-fcb-blue" />
            <span>
              {FCB_FOOTER.strasse}, {FCB_FOOTER.ort}
            </span>
          </div>
        </div>

        {/* Untere Zeile: Rechtliches + Social + Copyright */}
        <div className="flex flex-col items-center gap-3 pt-4 sm:flex-row sm:justify-between">
          <nav className="flex items-center gap-3 font-inter text-sm text-fcb-muted">
            <Link href="/impressum" className="transition-colors hover:text-fcb-blue">
              Impressum
            </Link>
            <span aria-hidden className="text-fcb-border">|</span>
            <Link href="/datenschutz" className="transition-colors hover:text-fcb-blue">
              Datenschutz
            </Link>
          </nav>

          <div className="flex items-center gap-4">
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

          <span className="font-inter text-xs text-fcb-muted">
            © {JAHR} {FCB_FOOTER.vereinsname}
          </span>
        </div>
      </div>
    </footer>
  );
}
