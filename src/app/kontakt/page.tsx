import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import PageShell from "@/components/ui/PageShell";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import IconBadge from "@/components/ui/IconBadge";
import ButtonLink from "@/components/ui/ButtonLink";
import Banner from "@/components/ui/Banner";
import {
  FacebookIcon,
  InstagramIcon,
  WhatsAppIcon,
} from "@/components/icons/BrandIcons";
import { VEREINSLINKS } from "@/lib/vereinslinks";
import { getTenantConfigServer } from "@/lib/tenant.server";
import { KONTAKT_TEXTE } from "@/lib/vereinstexte";

// Titel und Beschreibung nennen den Verein namentlich – deshalb markenabhängig
// über generateMetadata() statt statischem metadata-Export.
export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenantConfigServer();
  return {
    title: `Kontakt – ${tenant.name}`,
    description: KONTAKT_TEXTE[tenant.id].metaBeschreibung,
  };
}

// Öffentliche Kontaktseite – Server Component, kein Formular (keine Backend-
// Anbindung nötig): stattdessen direkte Kanäle als klickbare Cards.
//
// PLATZHALTER: Telefon, E-Mail, Anschrift und Ansprechpartner sind bewusst auf
// beiden Auftritten die FCB-Daten – die Sportanlage ist der gemeinsame Standort
// und eigene JFG-Ansprechpartner werden nachgeliefert. Auf dem JFG-Auftritt
// erklärt ein Hinweis-Banner diesen Zusammenhang (KONTAKT_TEXTE.jfg.hinweis).

const ADRESSE = "Alter Postweg 10, 96224 Burgkunstadt";
// Google-Maps-Suche wie im Footer (api=1 öffnet zuverlässig die Karte).
// Bewusst mit dem FCB-Namen, auch auf dem JFG-Auftritt: die Sportanlage ist
// unter diesem Namen in der Karte hinterlegt, eine JFG-Suche würde ins Leere gehen.
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
      className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent"
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

export default async function KontaktPage() {
  const tenant = await getTenantConfigServer();
  const texte = KONTAKT_TEXTE[tenant.id];
  // PLATZHALTER: WhatsApp- und Facebook-Kanal sind FCB-Kanäle; eigene
  // JFG-Kanäle liegen nicht vor. Der Instagram-Link kommt dagegen aus der
  // Marken-Config, damit jeder Auftritt auf seinen eigenen Kanal zeigt.
  const socialLinks = VEREINSLINKS.filter((l) => l.icon !== "link");

  return (
    <PageShell maxWidth="xl">
      <PageHeader title="Kontakt" subtitle={texte.untertitel} />

      {/* Nur auf Auftritten, deren Kontaktdaten erklärungsbedürftig sind (JFG) */}
      {texte.hinweis && (
        <div className="mb-6 max-w-2xl">
          <Banner variant="info" message={texte.hinweis} />
        </div>
      )}

      {/* Direkte Kanäle – Telefon und E-Mail sind die FCB-Geschäftsstelle.
          PLATZHALTER: eigene JFG-Rufnummer/-Adresse werden nachgeliefert. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <KontaktCard
          href="tel:095722090152"
          icon={<IconBadge icon={Phone} accent="brand" size="lg" />}
          label="Telefon"
          wert="09572 2090152"
        />
        <KontaktCard
          href="mailto:info@fcburgkunstadt.de"
          icon={<IconBadge icon={Mail} accent="brand" size="lg" />}
          label="E-Mail"
          wert="info@fcburgkunstadt.de"
        />
        {socialLinks.map((link) => {
          const BrandIcon =
            SOCIAL_ICONS[link.icon as keyof typeof SOCIAL_ICONS];
          if (!BrandIcon) return null;
          // Instagram ist markenabhängig: Handle und URL kommen aus der
          // Marken-Config (bei der JFG vorläufig noch der FCB-Kanal).
          const href =
            link.icon === "instagram" ? tenant.instagramUrl : link.url;
          return (
            <KontaktCard
              key={link.label}
              href={href}
              external
              icon={
                <span
                  aria-hidden
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-fcb-accent/40 bg-fcb-accent/10 text-fcb-accent"
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
          <IconBadge icon={MapPin} accent="brand" size="lg" label="Adresse" />
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

      {/* Ansprechpartner – auf beiden Auftritten der FCB-Vorsitzende.
          PLATZHALTER: eigene JFG-Ansprechpartner (Jugendleitung) werden
          nachgeliefert; bis dahin erklärt das Hinweis-Banner oben die Zuordnung. */}
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
