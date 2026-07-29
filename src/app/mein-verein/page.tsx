"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// lucide-react: ExternalLink für allgemeine Links (kein Brand-Glyph nötig)
import { ExternalLink } from "lucide-react";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/icons/BrandIcons";
import { createClient } from "@/lib/supabaseClient";
import { checkSession } from "@/utils/checkSession";
import { VEREINSLINKS, type VereinsLink, type VereinsLinkIcon } from "@/lib/vereinslinks";
// PageShell/PageHeader/ZugriffsHinweis sind Default-Exporte
import PageShell from "@/components/ui/PageShell";
import PageHeader from "@/components/ui/PageHeader";
import ZugriffsHinweis from "@/components/ui/ZugriffsHinweis";

// Icon-Komponente – wählt anhand des icon-Feldes das passende Icon aus.
// BrandIcons für Facebook/Instagram (Lucide enthält keine Brand-Glyphen),
// Lucide-Icons für WhatsApp-Stellvertreter und allgemeine Links.
function VereinsLinkIconComponent({ icon }: { icon: VereinsLinkIcon }) {
  switch (icon) {
    case "whatsapp":
      // Offizielles WhatsApp-Glyph (mit Hörer) in WhatsApp-Grün
      return <WhatsAppIcon className="w-8 h-8 text-green-500" aria-hidden="true" />;
    case "instagram":
      return <InstagramIcon className="w-8 h-8 text-pink-500" aria-hidden="true" />;
    case "facebook":
      return <FacebookIcon className="w-8 h-8 text-fcb-accent" aria-hidden="true" />;
    default:
      return <ExternalLink className="w-8 h-8 text-fcb-muted" aria-hidden="true" />;
  }
}

// Einzelne Link-Karte – die gesamte Karte ist klickbar
function VereinsLinkKarte({ link }: { link: VereinsLink }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-3 p-6 border border-fcb-border rounded-lg bg-fcb-surface hover:opacity-80 transition-opacity text-center"
    >
      <VereinsLinkIconComponent icon={link.icon} />
      <span className="font-semibold text-fcb-text">{link.label}</span>
      {link.beschreibung && (
        <span className="text-sm text-fcb-muted">
          {link.beschreibung}
        </span>
      )}
    </a>
  );
}

export default function MeinVereinPage() {
  const supabase = createClient();
  const router = useRouter();

  const [laden, setLaden] = useState(true);
  const [rolle, setRolle] = useState<string | null>(null);

  useEffect(() => {
    const pruefeZugang = async () => {
      const { userId, rolle: r } = await checkSession(supabase);

      if (!userId) {
        router.push("/login");
        return;
      }

      setRolle(r);
      setLaden(false);
    };

    pruefeZugang();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (laden) {
    return (
      <PageShell maxWidth="2xl">
        <p className="text-lg text-fcb-text">Lade Inhalte …</p>
      </PageShell>
    );
  }

  // Nur ausstehende Nutzer haben hier keinen Zugriff – alle anderen Rollen dürfen rein
  const ERLAUBTE_ROLLEN = ["mitglied", "trainer", "vorstand", "admin"];

  if (!ERLAUBTE_ROLLEN.includes(rolle ?? "")) {
    return (
      <PageShell maxWidth="2xl">
        <PageHeader
          title="Mein Verein"
          subtitle="Wichtige Vereinslinks auf einen Blick"
        />
        <ZugriffsHinweis rolle={rolle} erlaubteRollen={ERLAUBTE_ROLLEN} />
      </PageShell>
    );
  }

  return (
    <PageShell maxWidth="2xl">
      <PageHeader
        title="Mein Verein"
        subtitle="Wichtige Vereinslinks auf einen Blick"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {VEREINSLINKS.map((link) => (
          <VereinsLinkKarte key={link.url} link={link} />
        ))}
      </div>
    </PageShell>
  );
}
