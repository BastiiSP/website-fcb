"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { type Buchung } from "@/components/BearbeitenModal";
import Button from "@/components/ui/Button";
import { getEventColor } from "@/utils/getEventColor";

// Supabase-Client auf Modul-Ebene → stabile Referenz, kein useCallback-Dep-Churn
// (gleiches Muster wie kalender/page.tsx)
const supabase = createClient();

// Einträge pro Seite – server-seitige Pagination via Supabase .range()
const PRO_SEITE = 20;

// Anzeige-Labels für die enum-artigen DB-Werte (CHECK-Constraints der Tabelle)
const ANLASS_LABEL: Record<string, string> = {
  training: "Training",
  freundschaftsspiel: "Freundschaftsspiel",
  punktspiel: "Punktspiel",
  platzpflege: "Platzpflege",
};

const PLATZANTEIL_LABEL: Record<string, string> = {
  viertel: "1/4 Platz",
  halb: "1/2 Platz",
  ganz: "Ganzer Platz",
};

// YYYY-MM-DD aus LOKALEN Datumsfeldern bauen – nicht über toISOString(),
// das würde in UTC umrechnen und je nach Zeitzone den Tag verschieben.
function ymd(d: Date): string {
  const jahr = d.getFullYear();
  const monat = String(d.getMonth() + 1).padStart(2, "0");
  const tag = String(d.getDate()).padStart(2, "0");
  return `${jahr}-${monat}-${tag}`;
}

// Standard-Datumsbereich = aktueller Monat (erster bis letzter Tag)
export function ersterTagDesMonats(): string {
  const n = new Date();
  return ymd(new Date(n.getFullYear(), n.getMonth(), 1));
}
function letzterTagDesMonats(): string {
  // Tag 0 des Folgemonats = letzter Tag des aktuellen Monats
  const n = new Date();
  return ymd(new Date(n.getFullYear(), n.getMonth() + 1, 0));
}

// Zeitspanne lesbar formatieren: gleicher Tag → "dd.MM.yyyy HH:mm – HH:mm",
// über Tagesgrenze → beide Daten vollständig.
function zeitspanne(startISO: string, endISO: string): string {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const gleicherTag = start.toDateString() === end.toDateString();
  const startStr = format(start, "dd.MM.yyyy HH:mm", { locale: de });
  const endStr = gleicherTag
    ? format(end, "HH:mm", { locale: de })
    : format(end, "dd.MM.yyyy HH:mm", { locale: de });
  return `${startStr} – ${endStr}`;
}

// Farb-Punkt + Platzname – gleiche Farbquelle wie die Kalender-Events.
function PlatzZelle({ platz }: { platz: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
        style={{ backgroundColor: getEventColor(platz) }}
      />
      {platz.charAt(0).toUpperCase() + platz.slice(1)}
    </span>
  );
}

export default function BuchungenVerwaltung() {
  const [buchungen, setBuchungen] = useState<Buchung[]>([]);
  const [gesamt, setGesamt] = useState(0);
  const [laden, setLaden] = useState(true);
  const [fehler, setFehler] = useState("");

  // Filter-Zustand – sinnvoller Standard: aktueller Monat, alle Plätze.
  // Verhindert, dass beim Öffnen sofort hunderte Einträge geladen werden.
  // Setter werden ab Task 2 (Filterleiste) genutzt – noch nicht wegoptimieren.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [platzFilter, setPlatzFilter] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [vonDatum, setVonDatum] = useState(ersterTagDesMonats());
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [bisDatum, setBisDatum] = useState(letzterTagDesMonats());

  // Pagination – 0-basierter Seitenindex
  const [seite, setSeite] = useState(0);

  // Lädt eine Seite Buchungen server-seitig. count:"exact" liefert die
  // Gesamtanzahl passender Zeilen trotz .range() → Basis für die Pagination.
  const ladeBuchungen = useCallback(async () => {
    setLaden(true);
    setFehler("");

    const von = seite * PRO_SEITE;
    const bis = von + PRO_SEITE - 1;

    let query = supabase
      .from("buchungen")
      .select("*", { count: "exact" })
      .order("startzeit", { ascending: false }) // neueste zuerst
      .range(von, bis);

    // Filter nur anhängen, wenn gesetzt
    if (platzFilter) query = query.eq("platz", platzFilter);
    if (vonDatum)
      query = query.gte("startzeit", new Date(`${vonDatum}T00:00:00`).toISOString());
    if (bisDatum)
      query = query.lte("startzeit", new Date(`${bisDatum}T23:59:59`).toISOString());

    const { data, error, count } = await query;

    if (error) {
      setFehler("Fehler beim Laden der Buchungen: " + error.message);
      setBuchungen([]);
    } else {
      setBuchungen((data as Buchung[]) ?? []);
      setGesamt(count ?? 0);
    }
    setLaden(false);
  }, [seite, platzFilter, vonDatum, bisDatum]);

  useEffect(() => {
    ladeBuchungen();
  }, [ladeBuchungen]);

  // Index der letzten Seite (0-basiert)
  const letzteSeite = Math.max(0, Math.ceil(gesamt / PRO_SEITE) - 1);

  return (
    <div className="space-y-6">
      {/* Ladefehler */}
      {fehler && (
        <p className="font-inter text-sm text-fcb-red p-3 border border-fcb-red/40 rounded-lg bg-fcb-red/10">
          {fehler}
        </p>
      )}

      {/* FILTERLEISTE – wird in Task 2 ergänzt */}

      {/* Ergebniszähler – erst nach dem Laden zeigen, sonst flackert "0 Buchungen" auf */}
      {!laden && (
        <p className="font-inter text-sm text-fcb-muted">
          {gesamt} Buchung{gesamt !== 1 ? "en" : ""} im gewählten Zeitraum
        </p>
      )}

      {laden ? (
        <p className="font-inter text-center text-fcb-muted mt-6">Lade Buchungen …</p>
      ) : buchungen.length === 0 ? (
        <p className="font-inter text-center italic text-fcb-muted mt-6">
          Keine Buchungen im gewählten Zeitraum.
        </p>
      ) : (
        <>
          {/* MOBILE CARDS – wird in Task 3 ergänzt */}

          {/* Desktop-Tabelle (ab md) */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-fcb-border bg-fcb-surface">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-fcb-border text-left">
                  <th className="py-3 px-4 font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted">Zeitraum</th>
                  <th className="py-3 px-4 font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted">Platz</th>
                  <th className="py-3 px-4 font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted">Anteil</th>
                  <th className="py-3 px-4 font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted">Anlass</th>
                  <th className="py-3 px-4 font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted">Mannschaft</th>
                  <th className="py-3 px-4 font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted hidden lg:table-cell">Buchende Person</th>
                  <th className="py-3 px-4 font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {buchungen.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-fcb-border hover:bg-fcb-border/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-inter text-fcb-text whitespace-nowrap">
                      {zeitspanne(b.startzeit, b.endzeit)}
                    </td>
                    <td className="py-3 px-4 font-inter text-fcb-text">
                      <PlatzZelle platz={b.platz} />
                    </td>
                    <td className="py-3 px-4 font-inter text-fcb-muted">
                      {PLATZANTEIL_LABEL[b.platzanteil] ?? b.platzanteil}
                    </td>
                    <td className="py-3 px-4 font-inter text-fcb-muted">
                      {ANLASS_LABEL[b.anlass] ?? b.anlass}
                    </td>
                    <td className="py-3 px-4 font-inter text-fcb-text">{b.mannschaft}</td>
                    <td className="py-3 px-4 font-inter text-fcb-muted hidden lg:table-cell">
                      {b.buchende_person}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {/* AKTIONEN DESKTOP – Buttons werden in Task 4 ergänzt */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination – nur zeigen, wenn es mehr als eine Seite gibt */}
          {letzteSeite > 0 && (
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="secondary"
                size="sm"
                disabled={seite <= 0}
                onClick={() => setSeite((s) => Math.max(0, s - 1))}
              >
                Zurück
              </Button>
              <span className="font-inter text-sm text-fcb-muted">
                Seite {seite + 1} von {letzteSeite + 1}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={seite >= letzteSeite}
                onClick={() => setSeite((s) => Math.min(letzteSeite, s + 1))}
              >
                Weiter
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
