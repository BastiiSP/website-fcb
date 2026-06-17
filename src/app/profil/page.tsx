"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { checkSession } from "@/utils/checkSession";
import Link from "next/link";
import PersoenlicheDaten from "@/components/profil/PersoenlicheDaten";
import MannschaftLizenzen from "@/components/profil/MannschaftLizenzen";
import AccountSicherheit from "@/components/profil/AccountSicherheit";
import AvatarUploadModal from "@/components/profil/AvatarUploadModal";

type Tab = "persoenlich" | "mannschaft" | "account";

interface ProfilDaten {
  id: string;
  vorname: string;
  nachname: string;
  email: string;
  telefonnummer: string | null;
  geburtsdatum: string | null;
  strasse: string | null;
  plz: string | null;
  ort: string | null;
  mannschaft: string[];
  trainer_lizenzen: string[];
  avatar_url: string | null;
  rolle: string;
}

// Read-only Anzeige der aktuellen Rolle im Profil. Ändert NICHTS am
// Rollenkonzept (Vergabe bleibt Vorstand/Admin vorbehalten) – reine Information
// für den Nutzer, v. a. für den Status 'ausstehend'.
const ROLLEN_ANZEIGE: Record<string, { label: string; klasse: string }> = {
  ausstehend: { label: "Ausstehend", klasse: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  mitglied: { label: "Mitglied", klasse: "bg-blue-100 text-blue-800 border-blue-300" },
  trainer: { label: "Trainer", klasse: "bg-green-100 text-green-800 border-green-300" },
  vorstand: { label: "Vorstand", klasse: "bg-purple-100 text-purple-800 border-purple-300" },
  admin: { label: "Admin", klasse: "bg-red-100 text-red-800 border-red-300" },
};

export default function ProfilPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [profil, setProfil] = useState<ProfilDaten | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("persoenlich");
  const [avatarModalOffen, setAvatarModalOffen] = useState(false);

  useEffect(() => {
    const ladeProfil = async () => {
      const { userId, userEmail } = await checkSession(supabase);

      if (!userId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, vorname, nachname, telefonnummer, geburtsdatum, strasse, plz, ort, mannschaft, trainer_lizenzen, avatar_url, rolle"
        )
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Fehler beim Laden des Profils:", error.message);
      } else if (data) {
        setProfil({
          ...data,
          email: userEmail ?? "",
          mannschaft: data.mannschaft ?? [],
          trainer_lizenzen: data.trainer_lizenzen ?? [],
        });
      }

      setLoading(false);
    };

    ladeProfil();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wird die E-Mail-Bestätigung im selben Tab/Session abgeschlossen, feuert Supabase
  // USER_UPDATED mit der neuen Adresse – dann das angezeigte Profil aktualisieren,
  // ohne dass der Nutzer die Seite neu laden muss.
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const aktuelleEmail = session?.user?.email;
      if (aktuelleEmail) {
        setProfil((vorher) =>
          vorher && vorher.email !== aktuelleEmail
            ? { ...vorher, email: aktuelleEmail }
            : vorher
        );
      }
    });

    return () => listener.subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAvatarErfolg = (neueUrl: string) => {
    setAvatarModalOffen(false);
    if (profil) setProfil({ ...profil, avatar_url: neueUrl });

    // UserDropdown im Header informieren – kein globaler Auth-Context vorhanden,
    // daher Custom-Event als minimaler Kommunikationskanal.
    window.dispatchEvent(
      new CustomEvent("avatar-aktualisiert", { detail: neueUrl })
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Lade Profil …</p>
      </main>
    );
  }

  if (!profil) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl font-semibold">Nicht eingeloggt</p>
          <p className="text-sm opacity-75">Bitte melde dich an, um dein Profil zu bearbeiten.</p>
          <Link
            href="/login"
            className="inline-block px-5 py-2 border border-[var(--foreground)] rounded hover:opacity-80 transition"
          >
            Zum Login
          </Link>
        </div>
      </main>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "persoenlich", label: "Persönliche Daten" },
    { key: "mannschaft", label: "Mannschaft & Lizenzen" },
    { key: "account", label: "Account & Sicherheit" },
  ];

  return (
    <main className="min-h-screen p-4 sm:p-8 max-w-2xl mx-auto">
      {/* Titel + read-only Rollen-Badge */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">Mein Profil</h1>
        {(() => {
          const r =
            ROLLEN_ANZEIGE[profil.rolle] ?? {
              label: profil.rolle,
              klasse: "bg-gray-100 text-gray-800 border-gray-300",
            };
          return (
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${r.klasse}`}
            >
              Rolle: {r.label}
            </span>
          );
        })()}
      </div>

      {/* Hinweis für noch nicht freigeschaltete Konten */}
      {profil.rolle === "ausstehend" && (
        <p className="mb-8 rounded border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
          Dein Konto wird geprüft und freigeschaltet. Bei Fragen wende dich an
          die Vorstandschaft oder den IT-Verantwortlichen.
        </p>
      )}

      {/* Tab-Navigation */}
      <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 mb-8">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded border transition text-sm w-full sm:w-auto ${
              activeTab === key
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "bg-transparent border-[var(--foreground)] text-[var(--foreground)] hover:opacity-70"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab-Inhalte */}
      {activeTab === "persoenlich" && (
        <PersoenlicheDaten
          userId={profil.id}
          initialDaten={{
            vorname: profil.vorname,
            nachname: profil.nachname,
            telefonnummer: profil.telefonnummer,
            geburtsdatum: profil.geburtsdatum,
            strasse: profil.strasse,
            plz: profil.plz,
            ort: profil.ort,
          }}
          avatarUrl={profil.avatar_url}
          onAvatarClick={() => setAvatarModalOffen(true)}
        />
      )}

      {activeTab === "mannschaft" && (
        <MannschaftLizenzen
          userId={profil.id}
          initialMannschaft={profil.mannschaft}
          initialLizenzen={profil.trainer_lizenzen}
        />
      )}

      {activeTab === "account" && (
        <AccountSicherheit aktuelleEmail={profil.email} />
      )}

      {/* Avatar-Upload-Modal */}
      {avatarModalOffen && (
        <AvatarUploadModal
          userId={profil.id}
          onClose={() => setAvatarModalOffen(false)}
          onErfolg={handleAvatarErfolg}
        />
      )}
    </main>
  );
}
