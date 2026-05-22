"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

type Nutzer = {
  id: string;
  vorname: string;
  nachname: string;
  telefonnummer: string | null;
  rolle: string;
  mannschaft: string[] | null;
};

interface BenutzerListeProps {
  eigeneRolle: string;
}

const ROLLEN_OPTIONEN: Record<string, string[]> = {
  vorstand: ["ausstehend", "trainer"],
  admin: ["ausstehend", "trainer", "vorstand", "admin"],
};

export default function BenutzerListe({ eigeneRolle }: BenutzerListeProps) {
  const supabase = createClient();
  const [nutzer, setNutzer] = useState<Nutzer[]>([]);
  const [suche, setSuche] = useState("");
  const [expandedUserIds, setExpandedUserIds] = useState<string[]>([]);
  const [fehler, setFehler] = useState("");
  const [erfolg, setErfolg] = useState("");

  useEffect(() => {
    ladeNutzer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ladeNutzer = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, vorname, nachname, telefonnummer, rolle, mannschaft")
      .order("nachname");

    if (error) {
      setFehler("Fehler beim Laden der Nutzerliste: " + error.message);
      return;
    }

    setNutzer(data ?? []);
  };

  const rolleAendern = async (userId: string, neueRolle: string) => {
    const erlaubteRollen = ROLLEN_OPTIONEN[eigeneRolle] ?? [];
    if (!erlaubteRollen.includes(neueRolle)) {
      setFehler("Du darfst diese Rolle nicht vergeben.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ rolle: neueRolle })
      .eq("id", userId);

    if (error) {
      setFehler("Fehler beim Ändern der Rolle: " + error.message);
    } else {
      setErfolg("Rolle erfolgreich geändert.");
      ladeNutzer();
    }
  };

  const freischalten = async (userId: string) => {
    await rolleAendern(userId, "trainer");
  };

  const ablehnen = async (userId: string, name: string) => {
    if (!confirm(`Nutzer ${name} wirklich ablehnen und Konto löschen?`)) return;

    const res = await fetch("/api/benutzer-ablehnen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setFehler("Fehler beim Ablehnen: " + (body.error ?? res.statusText));
    } else {
      setErfolg(`Nutzer ${name} wurde abgelehnt und gelöscht.`);
      ladeNutzer();
    }
  };

  const toggleDetails = (id: string) => {
    setExpandedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const ausstehende = nutzer.filter((n) => n.rolle === "ausstehend");
  const aktive = nutzer.filter((n) => n.rolle !== "ausstehend");
  const gefilterteAktive = aktive.filter((n) =>
    `${n.vorname} ${n.nachname}`.toLowerCase().includes(suche.toLowerCase())
  );

  const erlaubteRollen = ROLLEN_OPTIONEN[eigeneRolle] ?? [];

  return (
    <div className="space-y-8">
      {fehler && (
        <p className="text-red-600 text-sm p-3 border border-red-300 rounded bg-red-50">
          {fehler}
        </p>
      )}
      {erfolg && (
        <p className="text-green-700 text-sm p-3 border border-green-300 rounded bg-green-50">
          {erfolg}
        </p>
      )}

      {/* Ausstehende Anfragen */}
      {ausstehende.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">
            Ausstehende Anfragen ({ausstehende.length})
          </h2>
          <div className="space-y-3">
            {ausstehende.map((n) => (
              <div
                key={n.id}
                className="border border-yellow-400 rounded p-4 bg-yellow-50 dark:bg-yellow-900/20"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {n.vorname} {n.nachname}
                    </p>
                    {n.telefonnummer && (
                      <p className="text-sm opacity-80">
                        Telefon: {n.telefonnummer}
                      </p>
                    )}
                    {n.mannschaft && n.mannschaft.length > 0 && (
                      <p className="text-sm opacity-80">
                        Mannschaft(en): {n.mannschaft.join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => freischalten(n.id)}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                      Als Trainer freischalten
                    </button>
                    <button
                      onClick={() => ablehnen(n.id, `${n.vorname} ${n.nachname}`)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                      Ablehnen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Aktive Nutzer */}
      <section>
        <h2 className="text-lg font-semibold mb-3">
          Aktive Nutzer ({aktive.length})
        </h2>

        <input
          type="text"
          placeholder="Nutzer suchen …"
          value={suche}
          onChange={(e) => setSuche(e.target.value)}
          className="form-field mb-4"
        />

        <div className="space-y-3">
          {gefilterteAktive.map((n) => (
            <div
              key={n.id}
              className="border rounded p-4 bg-[var(--background)] text-[var(--foreground)]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-semibold">
                    {n.vorname} {n.nachname}
                  </p>
                  <p className="text-sm opacity-80">Rolle: {n.rolle}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleDetails(n.id)}
                    className="text-sm underline flex items-center"
                  >
                    {expandedUserIds.includes(n.id) ? (
                      <>Details ausblenden <FiChevronUp className="ml-1" /></>
                    ) : (
                      <>Weitere Infos <FiChevronDown className="ml-1" /></>
                    )}
                  </button>

                  {erlaubteRollen.length > 0 && (
                    <select
                      value={n.rolle}
                      onChange={(e) => rolleAendern(n.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1 bg-[var(--background)]"
                    >
                      {erlaubteRollen.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {expandedUserIds.includes(n.id) && (
                <div className="mt-3 text-sm space-y-1">
                  {n.telefonnummer && <p>Telefon: {n.telefonnummer}</p>}
                  {n.mannschaft && n.mannschaft.length > 0 && (
                    <p>Mannschaft(en): {n.mannschaft.join(", ")}</p>
                  )}
                </div>
              )}
            </div>
          ))}

          {gefilterteAktive.length === 0 && (
            <p className="text-sm italic text-center opacity-70">
              Keine Nutzer gefunden.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
