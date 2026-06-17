"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/components/icons/BrandIcons";
import { useConsent } from "@/components/consent/ConsentProvider";

/**
 * Vereins-Footer (Design-Runde 2, dreispaltig).
 * Spalte 1 Vereinsinfo, Spalte 2 Rechtliches, Spalte 3 Social + Copyright.
 * - bg-fcb-surface (#161616) statt bg-fcb-bg → hebt den Footer als eigene Zone
 *   vom schwarzen Seitenhintergrund (bg-fcb-bg) ab, bleibt aber im FCB-System.
 * - Scroll-Fade-In via Framer Motion (whileInView, einmalig) – passt zur
 *   restlichen animierten Site. Daher "use client".
 */

// Vereins- und Social-Daten (zuvor footer-preview/_data.ts; inline übernommen,
// da die Preview-Routen mit Abschluss von Design-Runde 2 entfernt wurden).
// Adresse aus dem Impressum (Stand 2025).
const FCB_FOOTER = {
  vereinsname: "1. FC 1911 Burgkunstadt e.V.",
  strasse: "Alter Postweg 10",
  ort: "96224 Burgkunstadt",
  facebookUrl: "https://www.facebook.com/fc1911?locale=de_DE",
  instagramUrl: "https://www.instagram.com/schuhstaedter1911",
  // Google-Maps-Suche nach der Vereinsadresse (api=1 öffnet zuverlässig die Karte)
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Alter+Postweg+10%2C+96224+Burgkunstadt",
} as const;

// Copyright-Jahr einmal auf Modulebene – stabil über Server/Client.
const JAHR = new Date().getFullYear();

export default function Footer() {
  // Öffnet das Cookie-Banner erneut – ohne Reload oder Cookie-Löschen.
  const { openSettings } = useConsent();
  return (
    <motion.footer
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full border-t border-white/20 bg-fcb-footer text-fcb-text"
    >
      {/* Instagram-Brand-Gradient: einmal als SVG-Def hinterlegt, beim Hover per
          fill:url(#...) auf dem Icon referenziert. Stops = Instagrams offizielle
          Markenfarben – kein FCB-Token möglich, Hex hier bewusst (Brand-Farben,
          analog zum bestehenden Facebook-/Instagram-Hover-Hex). */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="fcb-ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#feda75" />
            <stop offset="25%" stopColor="#fa7e1e" />
            <stop offset="50%" stopColor="#d62976" />
            <stop offset="75%" stopColor="#962fbf" />
            <stop offset="100%" stopColor="#4f5bd5" />
          </linearGradient>
        </defs>
      </svg>

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
          {/* Icon + Adresse als direkter Google-Maps-Link */}
          <Link
            href={FCB_FOOTER.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Vereinsadresse in Google Maps öffnen"
            className="flex w-fit items-center gap-2 font-inter text-sm text-fcb-muted transition-colors hover:text-fcb-blue"
          >
            {/* Icon-Slot in Wappenbreite (w-9 = 36px), damit der Adresstext exakt
                unter dem Vereinsnamen beginnt (Logo ist ebenfalls 36px breit). */}
            <span className="flex w-9 shrink-0 justify-center">
              <MapPin className="h-7 w-7 text-fcb-blue" />
            </span>
            <span>
              {FCB_FOOTER.strasse}
              <br />
              {FCB_FOOTER.ort}
            </span>
          </Link>
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
          {/* Cookie-Einstellungen jederzeit erneut öffnen (kein Reload nötig).
              Button statt Link, da es eine In-App-Aktion ist, keine Navigation. */}
          <button
            type="button"
            onClick={openSettings}
            className="w-fit text-left font-inter text-sm text-fcb-muted transition-colors hover:text-fcb-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue"
          >
            Cookie-Einstellungen
          </button>
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
              className="group text-fcb-muted"
            >
              {/* Hover: Icon-Fill wechselt auf den Instagram-Gradient. Kein
                  transition-colors – ein Gradient-Fill ist nicht interpolierbar
                  und würde ohnehin hart umschalten. */}
              <InstagramIcon className="h-6 w-6 group-hover:[fill:url(#fcb-ig-gradient)]" />
            </Link>
          </div>
          <span className="font-inter text-xs text-fcb-muted sm:text-right">
            © {JAHR}
            <br />
            {FCB_FOOTER.vereinsname}
          </span>
        </div>
      </div>

      {/* Dezente Kurzbeschreibung des Mitgliederbereichs – erklärt den Zweck des
          Logins (relevant für Googles OAuth-Brand-Verifizierung), ohne den
          Seiten-Flow zu dominieren. Bewusst sichtbar (NICHT versteckt). */}
      <div className="border-t border-white/10 px-4 py-4">
        <p className="mx-auto max-w-6xl font-inter text-xs leading-relaxed text-fcb-muted">
          Mitglieder können sich anmelden, um auf interne Bereiche zuzugreifen.
        </p>
      </div>
    </motion.footer>
  );
}
