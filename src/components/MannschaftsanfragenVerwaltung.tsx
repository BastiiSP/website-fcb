"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

type Mannschaftsanfrage = {
  id: string;
  user_id: string;
  typ: "hinzufuegen" | "entfernen";
  mannschaft: string;
  begruendung: string | null;
  status: string;
  vorname?: string;
  nachname?: string;
};

/**
 * Zeigt alle offenen Mannschaftsanfragen (status='offen') für Vorstand/Admin.
 * Genehmigen läuft über die RPC approve_mannschaftsanfrage (SECURITY DEFINER),
 * die Profil-Update und Status-Änderung atomar zusammenfasst.
 * Ablehnen setzt den Status direkt per UPDATE (kein Profil-Update nötig).
 */
export default function MannschaftsanfragenVerwaltung() {
  const supabase = createClient();

  const [anfragen, setAnfragen] = useState<Mannschaftsanfrage[]>([]);
  const [laden, setLaden] = useState(true);
  const [fehler, setFehler] = useState("");
  // Meldung mit Ton: Genehmigen = grün, Ablehnen = rot (Grün ist dem Genehmigen vorbehalten)
  const [meldung, setMeldung] = useState<{ text: string; ton: "gruen" | "rot" } | null>(null);

  useEffect(() => {
    ladeAnfragen();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ladeAnfragen = async () => {
    setLaden(true);

    // Alle offenen Anfragen laden + Profilnamen per Join
    const { data, error } = await supabase
      .from("mannschaftsanfragen")
      .select("id, user_id, typ, mannschaft, begruendung, status, profiles(vorname, nachname)")
      .eq("status", "offen")
      .order("created_at");

    if (error) {
      setFehler("Fehler beim Laden der Anfragen: " + error.message);
      setLaden(false);
      return;
    }

    // Profildaten aus dem Join in die flache Struktur überführen
    const gefunden = (data ?? []).map((a) => {
      const profile = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles;
      return {
        id: a.id,
        user_id: a.user_id,
        typ: a.typ as "hinzufuegen" | "entfernen",
        mannschaft: a.mannschaft,
        begruendung: a.begruendung,
        status: a.status,
        vorname: profile?.vorname ?? "",
        nachname: profile?.nachname ?? "",
      };
    });

    setAnfragen(gefunden);
    setLaden(false);
  };

  const genehmigen = async (anfrage: Mannschaftsanfrage) => {
    setFehler("");
    setMeldung(null);

    // Atomar via RPC: genehmigt Profile-Update (mannschaft-Array) + Status auf 'genehmigt'
    const { error } = await supabase.rpc("approve_mannschaftsanfrage", {
      anfrage_id: anfrage.id,
    });

    if (error) {
      setFehler("Fehler beim Genehmigen: " + error.message);
    } else {
      setMeldung({
        text: `Anfrage von ${anfrage.vorname} ${anfrage.nachname} genehmigt.`,
        ton: "gruen",
      });
      ladeAnfragen();
    }
  };

  const ablehnen = async (anfrage: Mannschaftsanfrage) => {
    setFehler("");
    setMeldung(null);

    const { error } = await supabase
      .from("mannschaftsanfragen")
      .update({ status: "abgelehnt" })
      .eq("id", anfrage.id);

    if (error) {
      setFehler("Fehler beim Ablehnen: " + error.message);
    } else {
      // Ablehnen ist kein Erfolg im positiven Sinn → rote Meldung statt grün
      setMeldung({
        text: `Anfrage von ${anfrage.vorname} ${anfrage.nachname} abgelehnt.`,
        ton: "rot",
      });
      ladeAnfragen();
    }
  };

  return (
    <div className="space-y-6">
      {fehler && (
        <p className="font-inter text-sm p-3 border border-fcb-red/40 rounded-lg bg-fcb-red/10 text-fcb-red">
          {fehler}
        </p>
      )}
      {meldung && (
        <p
          className={`font-inter text-sm p-3 border rounded-lg ${
            meldung.ton === "gruen"
              ? "text-green-500 border-green-500/40 bg-green-500/10"
              : "text-fcb-red border-fcb-red/40 bg-fcb-red/10"
          }`}
        >
          {meldung.text}
        </p>
      )}

      {laden ? (
        <p className="font-inter text-sm text-fcb-muted">Lade Anfragen …</p>
      ) : anfragen.length === 0 ? (
        <p className="font-inter text-sm italic text-center text-fcb-muted py-8">
          Keine offenen Mannschaftsanfragen vorhanden.
        </p>
      ) : (
        <div className="space-y-3">
          <h2 className="font-oswald text-lg font-semibold uppercase tracking-wide text-fcb-text">
            Offene Anfragen ({anfragen.length})
          </h2>
          {anfragen.map((a) => (
            <div
              key={a.id}
              className="border border-fcb-border rounded-xl p-4 bg-fcb-surface"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-inter font-semibold text-fcb-text">
                      {a.vorname} {a.nachname}
                    </p>
                    {/* Status-Badge: offen = gelb (alle hier gezeigten Anfragen haben status='offen') */}
                    <Badge variant="yellow">offen</Badge>
                  </div>
                  <p className="font-inter text-sm text-fcb-muted">
                    {a.typ === "hinzufuegen"
                      ? `möchte ${a.mannschaft} hinzufügen`
                      : `möchte ${a.mannschaft} entfernen`}
                  </p>
                  {a.begruendung && (
                    <p className="font-inter text-sm text-fcb-muted/70 mt-1">
                      Begründung: {a.begruendung}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => genehmigen(a)}
                  >
                    Genehmigen
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => ablehnen(a)}
                  >
                    Ablehnen
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
