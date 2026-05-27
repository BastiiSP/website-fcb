"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

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
        <p className="text-red-600 text-sm p-3 border border-red-300 rounded bg-red-50">
          {fehler}
        </p>
      )}
      {meldung && (
        <p
          className={`text-sm p-3 border rounded ${
            meldung.ton === "gruen"
              ? "text-green-700 border-green-300 bg-green-50"
              : "text-red-600 border-red-300 bg-red-50"
          }`}
        >
          {meldung.text}
        </p>
      )}

      {laden ? (
        <p className="text-sm opacity-70">Lade Anfragen …</p>
      ) : anfragen.length === 0 ? (
        <p className="text-sm italic opacity-70 text-center py-8">
          Keine offenen Mannschaftsanfragen vorhanden.
        </p>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">
            Offene Anfragen ({anfragen.length})
          </h2>
          {anfragen.map((a) => (
            <div
              key={a.id}
              className="border border-blue-400 rounded p-4 bg-blue-50 dark:bg-blue-900/20"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {a.vorname} {a.nachname}
                  </p>
                  <p className="text-sm opacity-80">
                    {a.typ === "hinzufuegen"
                      ? `möchte ${a.mannschaft} hinzufügen`
                      : `möchte ${a.mannschaft} entfernen`}
                  </p>
                  {a.begruendung && (
                    <p className="text-sm opacity-70 mt-1">
                      Begründung: {a.begruendung}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => genehmigen(a)}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                  >
                    Genehmigen
                  </button>
                  <button
                    onClick={() => ablehnen(a)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    Ablehnen
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
