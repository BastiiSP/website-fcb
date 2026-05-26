"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

// Nur die für das Verzeichnis relevanten Felder aus der profiles-Tabelle
type TrainerProfil = {
  id: string;
  vorname: string;
  nachname: string;
  telefonnummer: string | null;
  rolle: string;
  mannschaft: string[] | null;
};

// Lesbare Bezeichnung für die angezeigte Rolle
const ROLLEN_LABEL: Record<string, string> = {
  trainer: "Trainer",
  vorstand: "Vorstand",
  admin: "Admin",
};

export default function TrainerVerzeichnis() {
  const supabase = createClient();
  const [profile, setProfile] = useState<TrainerProfil[]>([]);
  const [laden, setLaden] = useState(true);
  const [fehler, setFehler] = useState("");

  useEffect(() => {
    ladeProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ladeProfile = async () => {
    setLaden(true);
    // Datenschutz: Trainer sehen KEINE Vereinsmitglieder, nur andere Trainer/Vorstand/Admin
    const { data, error } = await supabase
      .from("profiles")
      .select("id, vorname, nachname, telefonnummer, rolle, mannschaft")
      .in("rolle", ["trainer", "vorstand", "admin"])
      .order("nachname");

    if (error) {
      setFehler("Fehler beim Laden des Verzeichnisses: " + error.message);
    } else {
      setProfile(data ?? []);
    }
    setLaden(false);
  };

  if (laden) {
    return (
      <p className="text-center opacity-70 mt-8">Lade Verzeichnis …</p>
    );
  }

  if (fehler) {
    return (
      <p className="text-red-600 text-sm p-3 border border-red-300 rounded bg-red-50">
        {fehler}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm opacity-60">
        {profile.length} {profile.length === 1 ? "Person" : "Personen"} im Verzeichnis
      </p>

      {profile.length === 0 && (
        <p className="text-center italic opacity-60 mt-8">
          Keine Einträge gefunden.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {profile.map((p) => (
          <div
            key={p.id}
            className="border rounded p-4 bg-[var(--background)] text-[var(--foreground)] space-y-1"
          >
            <p className="font-semibold text-base">
              {p.vorname} {p.nachname}
            </p>

            <p className="text-xs opacity-60">
              {ROLLEN_LABEL[p.rolle] ?? p.rolle}
            </p>

            {p.telefonnummer && (
              <p className="text-sm">
                📞{" "}
                <a
                  href={`tel:${p.telefonnummer}`}
                  className="hover:underline"
                >
                  {p.telefonnummer}
                </a>
              </p>
            )}

            {p.mannschaft && p.mannschaft.length > 0 && (
              <p className="text-sm opacity-80">
                ⚽ {p.mannschaft.join(", ")}
              </p>
            )}

            {!p.telefonnummer && (!p.mannschaft || p.mannschaft.length === 0) && (
              <p className="text-sm italic opacity-50">
                Keine weiteren Kontaktinfos
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
