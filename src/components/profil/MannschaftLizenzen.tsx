"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { LIZENZEN } from "@/lib/lizenzen";
import { MANNSCHAFTEN } from "@/lib/mannschaften";
import MannschaftsAnfrageModal from "./MannschaftsAnfrageModal";

interface Anfrage {
  id: string;
  typ: "hinzufuegen" | "entfernen";
  mannschaft: string;
  status: string;
}

interface MannschaftLizenzenProps {
  userId: string;
  initialMannschaft: string[];
  initialLizenzen: string[];
}

export default function MannschaftLizenzen({
  userId,
  initialMannschaft,
  initialLizenzen,
}: MannschaftLizenzenProps) {
  const supabase = createClient();

  // Mannschaft wird nur initial aus Props gelesen; Änderungen laufen über Anfragen (kein lokales Update)
  const [mannschaft] = useState<string[]>(initialMannschaft);
  const [lizenzen, setLizenzen] = useState<string[]>(initialLizenzen);
  const [offeneAnfragen, setOffeneAnfragen] = useState<Anfrage[]>([]);
  // Abgelehnte Anfragen werden separat gespeichert, um ein rotes Banner anzuzeigen
  const [abgelehnteAnfragen, setAbgelehnteAnfragen] = useState<Anfrage[]>([]);
  // Abgelehnte Banner, die der User bewusst geschlossen hat – per localStorage dauerhaft gemerkt
  const lsKey = `fcb_abgelehnte_geschlossen_${userId}`;
  const [geschlosseneAnfragen, setGeschlosseneAnfragen] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(lsKey);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });
  const [modal, setModal] = useState<{
    typ: "hinzufuegen" | "entfernen";
    mannschaft?: string;
  } | null>(null);
  const [lizenzSpeichern, setLizenzSpeichern] = useState(false);
  const [lizenzErfolg, setLizenzErfolg] = useState("");
  const [lizenzFehler, setLizenzFehler] = useState("");

  useEffect(() => {
    ladeAnfragen();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lädt offene und abgelehnte Anfragen in einem Query – beide Status werden für die UI benötigt
  const ladeAnfragen = async () => {
    const { data } = await supabase
      .from("mannschaftsanfragen")
      .select("id, typ, mannschaft, status")
      .eq("user_id", userId)
      .in("status", ["offen", "abgelehnt"]);

    const alle = (data as Anfrage[]) ?? [];
    setOffeneAnfragen(alle.filter((a) => a.status === "offen"));
    setAbgelehnteAnfragen(alle.filter((a) => a.status === "abgelehnt"));
  };

  const toggleLizenz = (lizenz: string) => {
    setLizenzen((prev) =>
      prev.includes(lizenz) ? prev.filter((l) => l !== lizenz) : [...prev, lizenz]
    );
  };

  const handleLizenzSpeichern = async () => {
    setLizenzFehler("");
    setLizenzErfolg("");
    setLizenzSpeichern(true);

    const { error } = await supabase
      .from("profiles")
      .update({ trainer_lizenzen: lizenzen })
      .eq("id", userId);

    if (error) {
      setLizenzFehler("Fehler beim Speichern: " + error.message);
    } else {
      setLizenzErfolg("Lizenzen gespeichert.");
    }
    setLizenzSpeichern(false);
  };

  const handleAnfrageErfolg = () => {
    setModal(null);
    ladeAnfragen();
  };

  // Offene Anfrage zurückziehen = löschen (RLS erlaubt DELETE nur für eigene, offene Zeilen)
  const zurueckziehen = async (id: string) => {
    const { error } = await supabase
      .from("mannschaftsanfragen")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Fehler beim Zurückziehen der Anfrage:", error.message);
    } else {
      ladeAnfragen(); // Banner verschwindet sofort
    }
  };

  // Mannschaften, für die noch keine offene Anfrage läuft
  const hatOffeneAnfrageFuer = (m: string, t: "hinzufuegen" | "entfernen") =>
    offeneAnfragen.some((a) => a.mannschaft === m && a.typ === t);

  // Verfügbare Mannschaften zum Hinzufügen: nicht zugewiesen UND keine offene Anfrage
  const hinzufuegenMoeglich = MANNSCHAFTEN.filter(
    (m) => !mannschaft.includes(m) && !hatOffeneAnfrageFuer(m, "hinzufuegen")
  );

  return (
    <div className="space-y-8">
      {/* Mannschafts-Sektion (read-only, Änderungen per Anfrage) */}
      <section>
        <h2 className="text-base font-semibold mb-3">Meine Mannschaft(en)</h2>
        <p className="text-sm opacity-60 mb-3">
          Mannschaftszuweisungen werden vom Vorstand verwaltet. Du kannst Anfragen stellen.
        </p>

        {/* Abgelehnte Anfragen als rote Fehlermeldungs-Cards (vom User wegklickbar) */}
        {abgelehnteAnfragen.filter((a) => !geschlosseneAnfragen.includes(a.id)).length > 0 && (
          <div className="space-y-2 mb-4">
            {abgelehnteAnfragen
              .filter((a) => !geschlosseneAnfragen.includes(a.id))
              .map((a) => (
                <div
                  key={a.id}
                  className="flex items-start justify-between gap-3 text-sm p-3 border border-red-400 rounded bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                >
                  <span>
                    Anfrage abgelehnt: <strong>{a.mannschaft}</strong>{" "}
                    {a.typ === "hinzufuegen" ? "hinzufügen" : "entfernen"} – vom Vorstand abgelehnt
                  </span>
                  {/* Schließen merkt sich die ID dauerhaft im localStorage – Banner erscheint nicht mehr */}
                  <button
                    type="button"
                    onClick={() => {
                      setGeschlosseneAnfragen((prev) => {
                        const next = [...prev, a.id];
                        try { localStorage.setItem(lsKey, JSON.stringify(next)); } catch { /* ignore */ }
                        return next;
                      });
                    }}
                    className="shrink-0 text-lg leading-none font-bold opacity-60 hover:opacity-100 transition"
                    aria-label="Meldung ausblenden"
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>
        )}

        {/* Offene Anfragen als gelbe Info-Cards (mit Zurückziehen-Option) */}
        {offeneAnfragen.length > 0 && (
          <div className="space-y-2 mb-4">
            {offeneAnfragen.map((a) => (
              <div
                key={a.id}
                className="flex items-start justify-between gap-3 text-sm p-3 border border-yellow-400 rounded bg-yellow-50 dark:bg-yellow-900/20"
              >
                <span>
                  Anfrage ausstehend: <strong>{a.mannschaft}</strong>{" "}
                  {a.typ === "hinzufuegen" ? "hinzufügen" : "entfernen"} – wird vom Vorstand geprüft
                </span>
                <button
                  type="button"
                  onClick={() => zurueckziehen(a.id)}
                  className="shrink-0 text-xs underline opacity-70 hover:opacity-100 transition"
                >
                  Zurückziehen
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Zugewiesene Mannschaften */}
        {mannschaft.length > 0 ? (
          <ul className="space-y-2 mb-3">
            {mannschaft.map((m) => (
              <li
                key={m}
                className="flex items-center justify-between border rounded p-3"
              >
                <span className="text-sm">{m}</span>
                {!hatOffeneAnfrageFuer(m, "entfernen") && (
                  <button
                    type="button"
                    onClick={() => setModal({ typ: "entfernen", mannschaft: m })}
                    className="text-xs text-red-600 underline hover:text-red-800 transition"
                  >
                    Entfernen anfragen
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm italic opacity-60 mb-3">Noch keine Mannschaft zugewiesen.</p>
        )}

        {hinzufuegenMoeglich.length > 0 && (
          <button
            type="button"
            onClick={() => setModal({ typ: "hinzufuegen" })}
            className="text-sm underline opacity-70 hover:opacity-100 transition"
          >
            + Mannschaft hinzufügen anfragen
          </button>
        )}
      </section>

      {/* Trainer-Lizenzen */}
      <section>
        <h2 className="text-base font-semibold mb-3">Trainer-Lizenzen</h2>

        {lizenzFehler && (
          <p className="text-red-600 text-sm p-3 border border-red-300 rounded bg-red-50 mb-3">
            {lizenzFehler}
          </p>
        )}
        {lizenzErfolg && (
          <p className="text-green-700 text-sm p-3 border border-green-300 rounded bg-green-50 mb-3">
            {lizenzErfolg}
          </p>
        )}

        <div className="space-y-2 mb-4">
          {LIZENZEN.map((lizenz) => (
            <label key={lizenz} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={lizenzen.includes(lizenz)}
                onChange={() => toggleLizenz(lizenz)}
                className="w-4 h-4"
              />
              <span className="text-sm">{lizenz}</span>
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={handleLizenzSpeichern}
          disabled={lizenzSpeichern}
          className="px-5 py-2 bg-[var(--foreground)] text-[var(--background)] rounded hover:opacity-80 transition disabled:opacity-50"
        >
          {lizenzSpeichern ? "Wird gespeichert …" : "Lizenzen speichern"}
        </button>
      </section>

      {/* Anfrage-Modal */}
      {modal && (
        <MannschaftsAnfrageModal
          userId={userId}
          typ={modal.typ}
          mannschaftVorausgefuellt={modal.mannschaft}
          bereitsZugewiesen={mannschaft}
          onClose={() => setModal(null)}
          onErfolg={handleAnfrageErfolg}
        />
      )}
    </div>
  );
}
