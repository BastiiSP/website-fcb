"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { checkSession } from "@/utils/checkSession";

// Nav-Links je nach Rolle. ausstehend sieht nur "Profil".
const NAV_LINKS: Record<string, { href: string; label: string }[]> = {
  ausstehend: [{ href: "/profil", label: "Profil" }],
  mitglied: [
    { href: "/mein-verein", label: "Mein Verein" },
    { href: "/profil", label: "Profil" },
  ],
  trainer: [
    { href: "/kalender", label: "Kalender" },
    { href: "/mitglieder", label: "Mitglieder" },
    { href: "/mein-verein", label: "Mein Verein" },
    { href: "/profil", label: "Profil" },
  ],
  vorstand: [
    { href: "/kalender", label: "Kalender" },
    { href: "/mitglieder", label: "Mitglieder" },
    { href: "/vorstand", label: "Vorstand" },
    { href: "/mein-verein", label: "Mein Verein" },
    { href: "/profil", label: "Profil" },
  ],
  admin: [
    { href: "/kalender", label: "Kalender" },
    { href: "/mitglieder", label: "Mitglieder" },
    { href: "/vorstand", label: "Vorstand" },
    { href: "/mein-verein", label: "Mein Verein" },
    { href: "/profil", label: "Profil" },
  ],
};

export default function Navigation() {
  const supabase = createClient();
  const pathname = usePathname();
  const [links, setLinks] = useState<{ href: string; label: string }[]>([]);

  useEffect(() => {
    const ladeLinks = async () => {
      const { rolle } = await checkSession(supabase);
      // Nur bekannte Rollen bekommen Links – ausstehend und null ergeben ein leeres Array
      setLinks(rolle ? (NAV_LINKS[rolle] ?? []) : []);
    };

    ladeLinks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (links.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 sm:gap-2">
      {links.map(({ href, label }) => {
        const aktiv = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              aktiv
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "hover:bg-[var(--foreground)]/10 text-[var(--foreground)]"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
