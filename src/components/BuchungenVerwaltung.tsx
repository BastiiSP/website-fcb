"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import BearbeitenModal, {
  type Buchung,
  type SerienBereich,
} from "@/components/BearbeitenModal";
import LoeschenModal from "@/components/LoeschenModal";
import { loescheSerie } from "@/lib/serienbuchung";
import ToastMessage from "@/components/ToastMessage";
import { Pencil, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { getEventColor } from "@/utils/getEventColor";
import { ANLASS_LABEL, PLATZANTEIL_LABEL, PLATZ_OPTIONEN } from "@/lib/buchungsOptionen";

// Supabase-Client auf Modul-Ebene → stabile Referenz, kein useCallback-Dep-Churn
// (gleiches Muster wie kalender/page.tsx)
const supabase = createClient();

// Einträge pro Seite – server-seitige Pagination via Supabase .range()
const PRO_SEITE = 20;

// Platz-Filter-Optionen (leere Option = alle Plätze, sonst zentrale Liste)
const PLATZ_FILTER_OPTIONEN = [{ value: "", label: "Alle Plätze" }, ...PLATZ_OPTIONEN];

// Einheitliche Styles für die nativen <input type="date">-Felder (fcb-Tokens,
// gleiches Muster wie die datetime-local-Felder in BearbeitenModal).
const DATUM_INPUT_KLASSEN =
  "w-full rounded-lg border border-fcb-border bg-fcb-bg px-3 py-2.5 font-inter text-sm text-fcb-text focus:border-fcb-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent/40";

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

// Bearbeiten/Löschen-Icon-Buttons – in Tabelle und Card identisch, daher ausgelagert (DRY)
function AktionsButtons({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={onEdit}
        className="p-1.5 rounded text-fcb-muted hover:text-fcb-text hover:bg-fcb-border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent"
        title="Bearbeiten"
        aria-label="Buchung bearbeiten"
      >
        <Pencil size={16} />
      </button>
      <button
        onClick={onDelete}
        className="p-1.5 rounded text-fcb-muted hover:text-fcb-red hover:bg-fcb-red/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-red"
        title="Löschen"
        aria-label="Buchung löschen"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export default function BuchungenVerwaltung() {
  const [buchungen, setBuchungen] = useState<Buchung[]>([]);
  const [gesamt, setGesamt] = useState(0);
  const [laden, setLaden] = useState(true);
  const [fehler, setFehler] = useState("");

  // Filter-Zustand – sinnvoller Standard: aktueller Monat, alle Plätze.
  // Verhindert, dass beim Öffnen sofort hunderte Einträge geladen werden.
  const [platzFilter, setPlatzFilter] = useState("");
  const [vonDatum, setVonDatum] = useState(ersterTagDesMonats());
  const [bisDatum, setBisDatum] = useState(letzterTagDesMonats());

  // Pagination – 0-basierter Seitenindex
  const [seite, setSeite] = useState(0);

  // Modal-Zustände: jeweils die betroffene Buchung oder null
  const [bearbeiteBuchung, setBearbeiteBuchung] = useState<Buchung | null>(null);
  const [loeschBuchung, setLoeschBuchung] = useState<Buchung | null>(null);

  // Toast-Meldungen für Aktions-Feedback (Erfolg / Fehler)
  const [erfolg, setErfolg] = useState("");
  const [aktionsFehler, setAktionsFehler] = useState("");

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

  // Setzt Filter auf den Standard zurück (aktueller Monat, alle Plätze, Seite 1)
  const zuruecksetzen = () => {
    setPlatzFilter("");
    setVonDatum(ersterTagDesMonats());
    setBisDatum(letzterTagDesMonats());
    setSeite(0);
  };

  // Löschen bestätigen → DB-Delete → Toast + Liste neu laden (kein Seitenreload).
  // bereich steuert bei Serien: nur diese Instanz oder alle zukünftigen Termine.
  const loeschenBestaetigen = async (bereich: SerienBereich) => {
    if (!loeschBuchung) return;

    if (bereich !== "einzeln" && loeschBuchung.serien_id) {
      try {
        // Pivot ist der ausgewählte Termin: "abDiesem" löscht ihn + alle
        // folgenden, "alle" die komplette Serie inkl. vergangener Termine.
        const anzahl = await loescheSerie(
          loeschBuchung.serien_id,
          supabase,
          bereich === "abDiesem"
            ? new Date(loeschBuchung.startzeit).toISOString()
            : null
        );
        setErfolg(
          `${
            bereich === "abDiesem" ? "Serie ab diesem Termin" : "Ganze Serie"
          } gelöscht: ${anzahl} Termin${anzahl !== 1 ? "e" : ""} entfernt.`
        );
        ladeBuchungen();
      } catch (e) {
        setAktionsFehler(
          e instanceof Error ? e.message : "Löschen der Serie fehlgeschlagen."
        );
      }
      setLoeschBuchung(null);
      return;
    }

    const { error } = await supabase
      .from("buchungen")
      .delete()
      .eq("id", loeschBuchung.id);

    if (error) {
      setAktionsFehler("Löschen fehlgeschlagen: " + error.message);
    } else {
      setErfolg("Buchung erfolgreich gelöscht.");
      ladeBuchungen();
    }
    setLoeschBuchung(null);
  };

  return (
    <div className="space-y-6">
      {/* Ladefehler */}
      {fehler && (
        <p className="font-inter text-sm text-fcb-red p-3 border border-fcb-red/40 rounded-lg bg-fcb-red/10">
          {fehler}
        </p>
      )}

      {/* Filterleiste – mobile gestapelt, ab sm nebeneinander */}
      <div
        role="group"
        aria-label="Buchungen filtern"
        className="flex flex-col sm:flex-row gap-3 flex-wrap items-end"
      >
        <div className="sm:w-52">
          <Select
            label="Platz"
            value={platzFilter}
            // Jede Filteränderung zurück auf Seite 1 → kein leerer Seitenindex
            onChange={(v) => {
              setPlatzFilter(v);
              setSeite(0);
            }}
            options={PLATZ_FILTER_OPTIONEN}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="buchung-von" className="block font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted">
            Von
          </label>
          <input
            id="buchung-von"
            type="date"
            value={vonDatum}
            onChange={(e) => {
              setVonDatum(e.target.value);
              setSeite(0);
            }}
            className={DATUM_INPUT_KLASSEN}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="buchung-bis" className="block font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted">
            Bis
          </label>
          <input
            id="buchung-bis"
            type="date"
            value={bisDatum}
            onChange={(e) => {
              setBisDatum(e.target.value);
              setSeite(0);
            }}
            className={DATUM_INPUT_KLASSEN}
          />
        </div>

        <Button variant="secondary" onClick={zuruecksetzen}>
          Zurücksetzen
        </Button>
      </div>

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
          {/* Mobile: Card-Layout (unter md). Alle relevanten Infos auf einen Blick. */}
          <div className="md:hidden space-y-3">
            {buchungen.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl border border-fcb-border bg-fcb-surface p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-oswald text-base font-semibold uppercase tracking-wide text-fcb-text">
                    {b.mannschaft}
                  </span>
                  <span className="font-inter text-sm text-fcb-muted shrink-0">
                    <PlatzZelle platz={b.platz} />
                  </span>
                </div>

                <p className="font-inter text-sm text-fcb-text">
                  {zeitspanne(b.startzeit, b.endzeit)}
                </p>

                <p className="font-inter text-xs text-fcb-muted">
                  {ANLASS_LABEL[b.anlass] ?? b.anlass} ·{" "}
                  {PLATZANTEIL_LABEL[b.platzanteil] ?? b.platzanteil} · {b.buchende_person}
                </p>

                {b.bemerkung && (
                  <p className="font-inter text-xs italic text-fcb-muted">{b.bemerkung}</p>
                )}

                <div className="pt-1">
                  <AktionsButtons onEdit={() => setBearbeiteBuchung(b)} onDelete={() => setLoeschBuchung(b)} />
                </div>
              </div>
            ))}
          </div>

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
                      <AktionsButtons onEdit={() => setBearbeiteBuchung(b)} onDelete={() => setLoeschBuchung(b)} />
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

      {/* Bearbeiten-Modal: vollständiges Buchungsformular, wiederverwendet aus dem Kalender */}
      <BearbeitenModal
        show={bearbeiteBuchung !== null}
        onClose={() => setBearbeiteBuchung(null)}
        supabase={supabase}
        initialData={bearbeiteBuchung}
        onSave={(meldung) => {
          setErfolg(meldung ?? "Buchung erfolgreich aktualisiert.");
          ladeBuchungen();
        }}
      />

      {/* Löschen-Bestätigung: expliziter Schritt vor dem Entfernen */}
      <LoeschenModal
        show={loeschBuchung !== null}
        onClose={() => setLoeschBuchung(null)}
        onConfirm={loeschenBestaetigen}
        mannschaft={loeschBuchung?.mannschaft}
        serienWahl={!!loeschBuchung?.serien_id}
      />

      {/* Aktions-Feedback */}
      {erfolg && (
        <ToastMessage message={erfolg} type="success" onClose={() => setErfolg("")} />
      )}
      {aktionsFehler && (
        <ToastMessage
          message={aktionsFehler}
          type="error"
          onClose={() => setAktionsFehler("")}
        />
      )}
    </div>
  );
}
