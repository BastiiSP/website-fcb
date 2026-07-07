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
import Tabs from "@/components/ui/Tabs";
import { getEventColor } from "@/utils/getEventColor";

// Supabase-Client auf Modul-Ebene → stabile Referenz (Muster wie BuchungenVerwaltung)
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

const TABS = [
  { id: "kommende", label: "Kommende" },
  { id: "vergangene", label: "Vergangene" },
];

// Zeitspanne lesbar formatieren – gleiches Muster wie BuchungenVerwaltung
function zeitspanne(startISO: string, endISO: string): string {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const gleicherTag = start.toDateString() === end.toDateString();
  const startStr = format(start, "EEEE, dd.MM.yyyy HH:mm", { locale: de });
  const endStr = gleicherTag
    ? format(end, "HH:mm", { locale: de })
    : format(end, "dd.MM.yyyy HH:mm", { locale: de });
  return `${startStr} – ${endStr}`;
}

// Farb-Punkt + Platzname – gleiche Farbquelle wie die Kalender-Events
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

// Bearbeiten/Stornieren-Buttons – nur für kommende Buchungen sichtbar
function AktionsButtons({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={onEdit}
        className="p-1.5 rounded text-fcb-muted hover:text-fcb-text hover:bg-fcb-border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue"
        title="Bearbeiten"
        aria-label="Buchung bearbeiten"
      >
        <Pencil size={16} />
      </button>
      <button
        onClick={onDelete}
        className="p-1.5 rounded text-fcb-muted hover:text-fcb-red hover:bg-fcb-red/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-red"
        title="Stornieren"
        aria-label="Buchung stornieren"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

type Props = {
  /** ID der eingeloggten Person – die Liste zeigt ausschließlich deren Buchungen */
  userId: string;
};

export default function MeineBuchungen({ userId }: Props) {
  const [buchungen, setBuchungen] = useState<Buchung[]>([]);
  const [gesamt, setGesamt] = useState(0);
  const [laden, setLaden] = useState(true);
  const [fehler, setFehler] = useState("");

  // Tab-Zustand: kommende Buchungen sind der Normalfall (bearbeitbar),
  // vergangene sind reine Historie (keine Aktionen).
  const [tab, setTab] = useState("kommende");

  // Pagination – 0-basierter Seitenindex
  const [seite, setSeite] = useState(0);

  // Modal-Zustände: jeweils die betroffene Buchung oder null
  const [bearbeiteBuchung, setBearbeiteBuchung] = useState<Buchung | null>(null);
  const [loeschBuchung, setLoeschBuchung] = useState<Buchung | null>(null);

  // Toast-Meldungen für Aktions-Feedback (Erfolg / Fehler)
  const [erfolg, setErfolg] = useState("");
  const [aktionsFehler, setAktionsFehler] = useState("");

  // Lädt eine Seite der EIGENEN Buchungen. Der user_id-Filter ist doppelt
  // abgesichert: hier in der Query und zusätzlich durch die RLS-Policies.
  const ladeBuchungen = useCallback(async () => {
    setLaden(true);
    setFehler("");

    const von = seite * PRO_SEITE;
    const bis = von + PRO_SEITE - 1;
    const jetztISO = new Date().toISOString();

    let query = supabase
      .from("buchungen")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .range(von, bis);

    // Kommende: nächste zuerst; Vergangene: jüngste zuerst
    if (tab === "kommende") {
      query = query.gte("startzeit", jetztISO).order("startzeit", { ascending: true });
    } else {
      query = query.lt("startzeit", jetztISO).order("startzeit", { ascending: false });
    }

    const { data, error, count } = await query;

    if (error) {
      setFehler("Fehler beim Laden deiner Buchungen: " + error.message);
      setBuchungen([]);
    } else {
      setBuchungen((data as Buchung[]) ?? []);
      setGesamt(count ?? 0);
    }
    setLaden(false);
  }, [seite, tab, userId]);

  useEffect(() => {
    ladeBuchungen();
  }, [ladeBuchungen]);

  // Index der letzten Seite (0-basiert)
  const letzteSeite = Math.max(0, Math.ceil(gesamt / PRO_SEITE) - 1);

  // Stornieren bestätigen → DB-Delete → Toast + Liste neu laden.
  // bereich steuert bei Serien: nur diese Instanz oder alle zukünftigen Termine.
  const loeschenBestaetigen = async (bereich: SerienBereich) => {
    if (!loeschBuchung) return;

    if (bereich !== "einzeln" && loeschBuchung.serien_id) {
      try {
        // Pivot ist der ausgewählte Termin: "abDiesem" storniert ihn + alle
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
          } storniert: ${anzahl} Termin${anzahl !== 1 ? "e" : ""} entfernt.`
        );
        ladeBuchungen();
      } catch (e) {
        setAktionsFehler(
          e instanceof Error ? e.message : "Stornieren der Serie fehlgeschlagen."
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
      setAktionsFehler("Stornieren fehlgeschlagen: " + error.message);
    } else {
      setErfolg("Buchung erfolgreich storniert.");
      ladeBuchungen();
    }
    setLoeschBuchung(null);
  };

  // Aktionen nur im Kommende-Tab: Vergangenes zu ändern ergibt fachlich keinen Sinn
  const aktionenSichtbar = tab === "kommende";

  return (
    <div className="space-y-6">
      <Tabs
        tabs={TABS}
        active={tab}
        onChange={(id) => {
          setTab(id);
          setSeite(0); // Tab-Wechsel → zurück auf Seite 1, sonst leerer Seitenindex
        }}
      />

      {/* Ladefehler */}
      {fehler && (
        <p className="font-inter text-sm text-fcb-red p-3 border border-fcb-red/40 rounded-lg bg-fcb-red/10">
          {fehler}
        </p>
      )}

      {/* Ergebniszähler – erst nach dem Laden zeigen, sonst flackert "0 Buchungen" auf */}
      {!laden && (
        <p className="font-inter text-sm text-fcb-muted">
          {gesamt} {tab === "kommende" ? "kommende" : "vergangene"} Buchung
          {gesamt !== 1 ? "en" : ""}
        </p>
      )}

      {laden ? (
        <p className="font-inter text-center text-fcb-muted mt-6">Lade Buchungen …</p>
      ) : buchungen.length === 0 ? (
        <p className="font-inter text-center italic text-fcb-muted mt-6">
          {tab === "kommende"
            ? "Du hast keine kommenden Buchungen."
            : "Keine vergangenen Buchungen vorhanden."}
        </p>
      ) : (
        <>
          {/* Mobile: Card-Layout (unter md) */}
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
                  {PLATZANTEIL_LABEL[b.platzanteil] ?? b.platzanteil}
                </p>

                {b.bemerkung && (
                  <p className="font-inter text-xs italic text-fcb-muted">{b.bemerkung}</p>
                )}

                {aktionenSichtbar && (
                  <div className="pt-1">
                    <AktionsButtons
                      onEdit={() => setBearbeiteBuchung(b)}
                      onDelete={() => setLoeschBuchung(b)}
                    />
                  </div>
                )}
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
                  {aktionenSichtbar && (
                    <th className="py-3 px-4 font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted text-right">Aktionen</th>
                  )}
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
                    {aktionenSichtbar && (
                      <td className="py-3 px-4 text-right">
                        <AktionsButtons
                          onEdit={() => setBearbeiteBuchung(b)}
                          onDelete={() => setLoeschBuchung(b)}
                        />
                      </td>
                    )}
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

      {/* Bearbeiten-Modal: gleiches Formular wie im Kalender (inkl. Belegungsprüfung) */}
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

      {/* Stornieren-Bestätigung: expliziter Schritt vor dem Entfernen */}
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
