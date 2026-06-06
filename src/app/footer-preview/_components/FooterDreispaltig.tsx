"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/components/icons/BrandIcons";
import { FCB_FOOTER } from "../_data";

/**
 * Variante „Dreispaltig" – klassisches Footer-Layout mit mehr Atemraum.
 * Spalte 1 Vereinsinfo, Spalte 2 Rechtliches, Spalte 3 Social + Copyright.
 */
export default function FooterDreispaltig() {
  const jahr = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-fcb-border bg-fcb-bg text-fcb-text">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-3">
        {/* Spalte 1: Vereinsinfo */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Vereinslogo 1. FC 1911 Burgkunstadt"
              width={36}
              height={36}
              className="drop-shadow-lg"
            />
            <span className="font-oswald text-base font-semibold uppercase tracking-wide">
              {FCB_FOOTER.vereinsname}
            </span>
          </div>
          <div className="flex items-start gap-2 font-inter text-sm text-fcb-muted">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-fcb-blue" />
            <span>
              {FCB_FOOTER.strasse}
              <br />
              {FCB_FOOTER.ort}
            </span>
          </div>
        </div>

        {/* Spalte 2: Rechtliches */}
        <div className="flex flex-col gap-2">
          <h3 className="font-oswald text-sm font-semibold uppercase tracking-wide text-fcb-text">
            Rechtliches
          </h3>
          <Link
            href="/impressum"
            className="font-inter text-sm text-fcb-muted transition-colors hover:text-fcb-blue"
          >
            Impressum
          </Link>
          <Link
            href="/datenschutz"
            className="font-inter text-sm text-fcb-muted transition-colors hover:text-fcb-blue"
          >
            Datenschutz
          </Link>
        </div>

        {/* Spalte 3: Social + Copyright */}
        <div className="flex flex-col gap-3 sm:items-end">
          <h3 className="font-oswald text-sm font-semibold uppercase tracking-wide text-fcb-text">
            Folge uns
          </h3>
          <div className="flex items-center gap-4">
            <Link
              href={FCB_FOOTER.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-fcb-muted transition-colors hover:text-fcb-blue"
            >
              <FacebookIcon className="h-6 w-6" />
            </Link>
            <Link
              href={FCB_FOOTER.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-fcb-muted transition-colors hover:text-fcb-blue"
            >
              <InstagramIcon className="h-6 w-6" />
            </Link>
          </div>
          <span className="font-inter text-xs text-fcb-muted sm:text-right">
            © {jahr}
            <br />
            {FCB_FOOTER.vereinsname}
          </span>
        </div>
      </div>
    </footer>
  );
}
