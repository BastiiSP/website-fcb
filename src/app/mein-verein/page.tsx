"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaWhatsapp, FaInstagram, FaFacebook, FaLink } from "react-icons/fa";
import { createClient } from "@/lib/supabaseClient";
import { checkSession } from "@/utils/checkSession";
import { VEREINSLINKS, type VereinsLink, type VereinsLinkIcon } from "@/lib/vereinslinks";

// Icon-Komponente – wählt anhand des icon-Feldes das passende react-icon aus
function VereinsLinkIcon({ icon }: { icon: VereinsLinkIcon }) {
  switch (icon) {
    case "whatsapp":
      return <FaWhatsapp className="text-3xl text-green-500" />;
    case "instagram":
      return <FaInstagram className="text-3xl text-pink-500" />;
    case "facebook":
      return <FaFacebook className="text-3xl text-blue-600" />;
    default:
      return <FaLink className="text-3xl opacity-60" />;
  }
}

// Einzelne Link-Karte – die gesamte Karte ist klickbar
function VereinsLinkKarte({ link }: { link: VereinsLink }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-3 p-6 border border-[var(--foreground)]/20 rounded-lg bg-[var(--background)] hover:opacity-80 transition-opacity text-center"
    >
      <VereinsLinkIcon icon={link.icon} />
      <span className="font-semibold text-[var(--foreground)]">{link.label}</span>
      {link.beschreibung && (
        <span className="text-sm opacity-60 text-[var(--foreground)]">
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
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Lade Inhalte …</p>
      </main>
    );
  }

  // Ausstehende Nutzer sehen dieselbe Sperrseite wie auf anderen geschützten Seiten
  if (rolle === "ausstehend" || !rolle) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-xl font-semibold">Kein Zugriff</p>
          <p className="text-sm opacity-75">
            Dein Konto wurde noch nicht freigegeben. Sobald ein Vorstandsmitglied
            dein Konto aktiviert hat, kannst du diese Seite aufrufen.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-[var(--background)] text-[var(--foreground)]">
      <h1 className="text-2xl font-bold mb-2">Mein Verein</h1>
      <p className="text-sm opacity-60 mb-8">Wichtige Vereinslinks auf einen Blick</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {VEREINSLINKS.map((link) => (
          <VereinsLinkKarte key={link.url} link={link} />
        ))}
      </div>
    </main>
  );
}
