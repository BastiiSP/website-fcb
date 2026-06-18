"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { LIZENZEN } from "@/lib/lizenzen";
import { MANNSCHAFTEN } from "@/lib/mannschaften";
import MannschaftsAnfrageModal from "./MannschaftsAnfrageModal";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";

interface Anfrage {
  id: string;
  typ: "hinzufuegen" | "entfernen";
  mannschaft: string;
  status: string;
  // NULL = Banner sichtbar; Timestamp = Nutzer hat das abgelehnt-Banner geschlossen (geräteübergreifend in DB)
  banner_geschlossen_am: string | null;
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
  // Abgelehnte Anfragen inkl. banner_geschlossen_am – Filterung erfolgt am DB-Feld, nicht im lokalen State
  const [abgelehnteAnfragen, setAbgelehnteAnfragen] = useState<Anfrage[]>([]);
  const [modal, setModal] = useState<{
    typ: "hinzufuegen" | "entfernen";
    mannschaft?: string;
  } | null>(null);
  const [lizenzSpeichern, setLizenzSpeichern] = useState(false);
  const [lizenzErfolg, setLizenzErfolg] = useState("");
  const [lizenzFehler, setLizenzFehler] = useState("");

  useEffect(() => {
    // Einmaliger Cleanup: alter localStorage-Key aus der Vorgängerversion entfernen,
    // da der „geschlossen"-Zustand jetzt geräteübergreifend in der DB lebt.
    try { localStorage.removeItem(`fcb_abgelehnte_geschlossen_${userId}`); } catch { /* ignore */ }
    ladeAnfragen();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lädt offene und abgelehnte Anfragen in einem Query – beide Status werden für die UI benötigt
  const ladeAnfragen = async () => {
    const { data } = await supabase
      .from("mannschaftsanfragen")
      .select("id, typ, mannschaft, status, banner_geschlossen_am")
      .eq("user_id", userId)
      .in("status", ["offen", "abgelehnt"]);

    const alle = (data as Anfrage[]) ?? [];
    setOffeneAnfragen(alle.filter((a) => a.status === "offen"));
    setAbgelehnteAnfragen(alle.filter((a) => a.status === "abgelehnt"));
  };

  // Schließt das rote Banner für eine abgelehnte Anfrage geräteübergreifend.
  // Optimistic Update: UI reagiert sofort, RPC schreibt im Hintergrund in die DB.
  // Bei Fehler wird der lokale State zurückgesetzt, damit das Banner wieder erscheint.
  const schliesseBanner = async (id: string) => {
    setAbgelehnteAnfragen((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, banner_geschlossen_am: new Date().toISOString() } : a
      )
    );
    const { error } = await supabase.rpc("close_mannschaftsanfrage_banner", {
      anfrage_id: id,
    });
    if (error) {
      console.error("Fehler beim Schließen des Banners:", error.message);
      setAbgelehnteAnfragen((prev) =>
        prev.map((a) => (a.id === id ? { ...a, banner_geschlossen_am: null } : a))
      );
    }
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
        <h2 className="font-oswald text-base font-semibold uppercase tracking-wide text-fcb-text mb-3">
          Meine Mannschaft(en)
        </h2>
        <p className="font-inter text-sm text-fcb-muted mb-3">
          Mannschaftszuweisungen werden vom Vorstand verwaltet. Du kannst Anfragen stellen.
        </p>

        {/* Abgelehnte Anfragen als rote Fehlermeldungs-Cards (vom User wegklickbar, Status in DB) */}
        {abgelehnteAnfragen.filter((a) => !a.banner_geschlossen_am).length > 0 && (
          <div className="space-y-2 mb-4">
            {abgelehnteAnfragen
              .filter((a) => !a.banner_geschlossen_am)
              .map((a) => (
                <div
                  key={a.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-fcb-red/40 bg-fcb-red/10 px-3 py-2.5 font-inter text-sm text-fcb-text"
                >
                  <span>
                    Anfrage abgelehnt: <strong>{a.mannschaft}</strong>{" "}
                    {a.typ === "hinzufuegen" ? "hinzufügen" : "entfernen"} – vom Vorstand abgelehnt
                  </span>
                  {/* Schließen schreibt banner_geschlossen_am via RPC – wirkt geräteübergreifend */}
                  <button
                    type="button"
                    onClick={() => schliesseBanner(a.id)}
                    className="shrink-0 text-lg leading-none font-bold text-fcb-muted hover:text-fcb-text transition-colors"
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
                className="flex items-start justify-between gap-3 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-3 py-2.5 font-inter text-sm text-fcb-text"
              >
                <span>
                  Anfrage ausstehend: <strong>{a.mannschaft}</strong>{" "}
                  {a.typ === "hinzufuegen" ? "hinzufügen" : "entfernen"} – wird vom Vorstand geprüft
                </span>
                <button
                  type="button"
                  onClick={() => zurueckziehen(a.id)}
                  className="shrink-0 font-inter text-xs text-fcb-muted underline hover:text-fcb-text transition-colors"
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
                className="flex items-center justify-between rounded-lg border border-fcb-border bg-fcb-surface px-3 py-2.5"
              >
                <span className="font-inter text-sm text-fcb-text">{m}</span>
                {!hatOffeneAnfrageFuer(m, "entfernen") && (
                  <button
                    type="button"
                    onClick={() => setModal({ typ: "entfernen", mannschaft: m })}
                    className="font-inter text-xs text-fcb-red underline hover:text-fcb-red/80 transition-colors"
                  >
                    Entfernen anfragen
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-inter text-sm italic text-fcb-muted mb-3">
            Noch keine Mannschaft zugewiesen.
          </p>
        )}

        {hinzufuegenMoeglich.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => setModal({ typ: "hinzufuegen" })}
          >
            + Mannschaft hinzufügen anfragen
          </Button>
        )}
      </section>

      {/* Trainer-Lizenzen */}
      <section>
        <h2 className="font-oswald text-base font-semibold uppercase tracking-wide text-fcb-text mb-3">
          Trainer-Lizenzen
        </h2>

        {lizenzFehler && <div className="mb-3"><Banner variant="error" message={lizenzFehler} /></div>}
        {lizenzErfolg && <div className="mb-3"><Banner variant="success" message={lizenzErfolg} /></div>}

        <div className="space-y-2 mb-4">
          {LIZENZEN.map((lizenz) => (
            <label key={lizenz} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={lizenzen.includes(lizenz)}
                onChange={() => toggleLizenz(lizenz)}
                className="w-4 h-4 accent-fcb-blue"
              />
              <span className="font-inter text-sm text-fcb-text">{lizenz}</span>
            </label>
          ))}
        </div>

        <Button
          variant="primary"
          size="md"
          type="button"
          onClick={handleLizenzSpeichern}
          disabled={lizenzSpeichern}
        >
          {lizenzSpeichern ? "Wird gespeichert …" : "Lizenzen speichern"}
        </Button>
      </section>

      {/* Anfrage-Modal – modal-State steuert open-Prop */}
      <MannschaftsAnfrageModal
        userId={userId}
        typ={modal?.typ ?? "hinzufuegen"}
        mannschaftVorausgefuellt={modal?.mannschaft}
        bereitsZugewiesen={mannschaft}
        onClose={() => setModal(null)}
        onErfolg={handleAnfrageErfolg}
        open={modal !== null}
      />
    </div>
  );
}
