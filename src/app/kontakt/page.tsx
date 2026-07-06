import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import PageShell from "@/components/ui/PageShell";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import IconBadge from "@/components/ui/IconBadge";
import ButtonLink from "@/components/ui/ButtonLink";
import {
  FacebookIcon,
  InstagramIcon,
  WhatsAppIcon,
} from "@/components/icons/BrandIcons";
import { VEREINSLINKS } from "@/lib/vereinslinks";

export const metadata: Metadata = {
  title: "Kontakt – 1. FC 1911 Burgkunstadt",
  description:
    "So erreichst du den 1. FC 1911 Burgkunstadt: Telefon, E-Mail, WhatsApp, Social Media und der Weg zum Sportgelände am Alten Postweg.",
};

// Öffentliche Kontaktseite – Server Component, kein Formular (keine Backend-
// Anbindung nötig): stattdessen direkte Kanäle als klickbare Cards.

const ADRESSE = "Alter Postweg 10, 96224 Burgkunstadt";
// Google-Maps-Suche wie im Footer (api=1 öffnet zuverlässig die Karte)
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `1. FC 1911 Burgkunstadt, ${ADRESSE}`,
)}`;

// Social-Links aus der zentralen Datei – hier nur um die Optik ergänzt.
// Icon-Zuordnung über das icon-Feld von VEREINSLINKS (Brand-SVGs, kein Lucide).
const SOCIAL_ICONS = {
  whatsapp: WhatsAppIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
} as const;

/** Klickbare Kontakt-Card: komplette Fläche ist der Link. */
function KontaktCard({
  href,
  external = false,
  icon,
  label,
  wert,
}: {
  href: string;
  external?: boolean;
  icon: React.ReactNode;
  label: string;
  wert: string;
}) {
  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue"
    >
      <Card interactive className="flex h-full items-center gap-4">
        {icon}
        <div className="min-w-0">
          <p className="font-oswald text-base font-semibold uppercase tracking-wide text-fcb-text">
            {label}
          </p>
          <p className="truncate font-inter text-sm text-fcb-muted">{wert}</p>
        </div>
      </Card>
    </Link>
  );
}

export default function KontaktPage() {
  const socialLinks = VEREINSLINKS.filter((l) => l.icon !== "link");

  return (
    <PageShell maxWidth="xl">
      <PageHeader
        title="Kontakt"
        subtitle="Meld dich einfach, irgendwer vom FCB hat immer das Handy dabei."
      />

      {/* Direkte Kanäle */}
      <div className="grid gap-4 sm:grid-cols-2">
        <KontaktCard
          href="tel:095722090152"
          icon={<IconBadge icon={Phone} accent="blue" size="lg" />}
          label="Telefon"
          wert="09572 2090152"
        />
        <KontaktCard
          href="mailto:info@fcburgkunstadt.de"
          icon={<IconBadge icon={Mail} accent="blue" size="lg" />}
          label="E-Mail"
          wert="info@fcburgkunstadt.de"
        />
        {socialLinks.map((link) => {
          const BrandIcon =
            SOCIAL_ICONS[link.icon as keyof typeof SOCIAL_ICONS];
          if (!BrandIcon) return null;
          return (
            <KontaktCard
              key={link.label}
              href={link.url}
              external
              icon={
                <span
                  aria-hidden
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-fcb-blue/40 bg-fcb-blue/10 text-fcb-blue"
                >
                  <BrandIcon className="h-6 w-6" />
                </span>
              }
              label={link.label}
              wert={link.beschreibung ?? link.url}
            />
          );
        })}
      </div>

      {/* Anfahrt */}
      <h2 className="mb-4 mt-12 font-oswald text-2xl font-semibold uppercase tracking-wide text-fcb-text">
        So findest du uns
      </h2>
      <Card className="max-w-2xl">
        <div className="flex items-start gap-4">
          <IconBadge icon={MapPin} accent="blue" size="lg" label="Adresse" />
          <div>
            <p className="font-oswald text-lg font-semibold uppercase tracking-wide text-fcb-text">
              Sportgelände am Alten Postweg
            </p>
            <p className="mt-1 font-inter text-sm leading-relaxed text-fcb-muted">
              Alter Postweg 10
              <br />
              96224 Burgkunstadt
            </p>
          </div>
        </div>
        <div className="mt-5">
          <ButtonLink href={MAPS_URL} external variant="secondary" size="md">
            In Google Maps öffnen
          </ButtonLink>
        </div>
      </Card>

      {/* Ansprechpartner */}
      <h2 className="mb-4 mt-12 font-oswald text-2xl font-semibold uppercase tracking-wide text-fcb-text">
        Ansprechpartner
      </h2>
      <Card className="max-w-2xl">
        <p className="font-oswald text-lg font-semibold uppercase tracking-wide text-fcb-text">
          Wolfgang Strassgürtel
        </p>
        <p className="mt-1 font-inter text-sm text-fcb-muted">1. Vorsitzender</p>
        <p className="mt-4 font-inter text-sm leading-relaxed text-fcb-text/80">
          Für alles rund um eine Mannschaft erreichst du die Trainer am
          schnellsten über die WhatsApp-Gruppe oder direkt am Platz. Für alles
          andere: anrufen oder eine Mail schreiben.
        </p>
      </Card>

      <p className="mt-12 max-w-2xl font-inter text-sm leading-relaxed text-fcb-text/70">
        Du willst zum Probetraining? Schreib am besten vorher kurz, wann deine
        Altersklasse trainiert. Oder komm einfach am Alten Postweg vorbei,
        wenn der Platz voll ist.
      </p>
    </PageShell>
  );
}
