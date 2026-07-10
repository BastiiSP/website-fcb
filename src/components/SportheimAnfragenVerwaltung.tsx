"use client";

import { useCallback, useEffect, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarOff, Check, RotateCcw, Trash2, X } from "lucide-react";

import { createClient } from "@/lib/supabaseClient";
import ToastMessage from "@/components/ToastMessage";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import TextField from "@/components/ui/TextField";
import type {
  SportheimAnfrage,
  SportheimAnfrageStatus,
} from "@/lib/sportheimAnfragenTypes";

// Deutsch-Locale für react-datepicker (idempotent, wie Buchungsformular)
registerLocale("de", de);

// Supabase-Client auf Modul-Ebene → stabile Referenz (Muster wie BuchungenVerwaltung)
const supabase = createClient();

// Einträge pro Seite – server-seitige Pagination via .range()
const PRO_SEITE = 20;

const STATUS_LABEL: Record<SportheimAnfrageStatus, string> = {
  offen: "Offen",
  angenommen: "Angenommen",
  abgelehnt: "Abgelehnt",
};

// Badge-Farben: offen = wartet (gelb), angenommen = grün, abgelehnt = rot
const STATUS_BADGE: Record<SportheimAnfrageStatus, "yellow" | "green" | "red"> = {
  offen: "yellow",
  angenommen: "green",
  abgelehnt: "red",
};

const STATUS_FILTER_OPTIONEN = [
  { value: "", label: "Alle Status" },
  { value: "offen", label: "Offen" },
  { value: "angenommen", label: "Angenommen" },
  { value: "abgelehnt", label: "Abgelehnt" },
];

const TYP_FILTER_OPTIONEN = [
  { value: "", label: "Anfragen & Sperrtermine" },
  { value: "anfrage", label: "Nur Anfragen" },
  { value: "sperrung", label: "Nur Sperrtermine" },
];

// Gleicher DatePicker-Input-Stil wie Buchungs- und Anfrageformular
const DATEPICKER_INPUT_KLASSEN =
  "w-full rounded-lg border border-fcb-border bg-fcb-bg px-3 py-2.5 font-inter text-sm text-fcb-text placeholder:text-fcb-muted/60 focus:border-fcb-blue focus:outline-none";

// Zeitspanne lesbar formatieren (Muster aus BuchungenVerwaltung)
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

// Status-Aktionen einer Anfrage: nur sinnvolle Übergänge anbieten.
// Sperrtermine sind per DB-Constraint immer "angenommen" → keine Aktionen.
function StatusAktionen({
  anfrage,
  onStatus,
}: {
  anfrage: SportheimAnfrage;
  onStatus: (status: SportheimAnfrageStatus) => void;
}) {
  if (anfrage.typ === "sperrung") return null;
  return (
    <div className="flex justify-end gap-1.5">
      {anfrage.status !== "angenommen" && (
        <button
          onClick={() => onStatus("angenommen")}
          className="p-1.5 rounded text-fcb-muted hover:text-green-500 hover:bg-green-500/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue"
          title="Anfrage annehmen"
          aria-label="Anfrage annehmen"
        >
          <Check size={16} />
        </button>
      )}
      {anfrage.status !== "abgelehnt" && (
        <button
          onClick={() => onStatus("abgelehnt")}
          className="p-1.5 rounded text-fcb-muted hover:text-fcb-red hover:bg-fcb-red/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-red"
          title="Anfrage ablehnen"
          aria-label="Anfrage ablehnen"
        >
          <X size={16} />
        </button>
      )}
      {anfrage.status !== "offen" && (
        <button
          onClick={() => onStatus("offen")}
          className="p-1.5 rounded text-fcb-muted hover:text-fcb-text hover:bg-fcb-border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue"
          title="Zurück auf offen setzen"
          aria-label="Zurück auf offen setzen"
        >
          <RotateCcw size={16} />
        </button>
      )}
    </div>
  );
}

/**
 * Vorstandsübersicht der Sportheim-Anfragen: alle Anfragen inkl. Kontaktdaten,
 * Status setzen (offen/angenommen/abgelehnt) und eigene Sperrtermine anlegen.
 * Zugriff nur für vorstand/admin – abgesichert durch RLS, die Seite /vorstandsbereich
 * prüft die Rolle zusätzlich im Frontend.
 */
export default function SportheimAnfragenVerwaltung() {
  const [anfragen, setAnfragen] = useState<SportheimAnfrage[]>([]);
  const [gesamt, setGesamt] = useState(0);
  const [laden, setLaden] = useState(true);
  const [fehler, setFehler] = useState("");

  // Standard-Filter "offen": der Haupt-Arbeitsvorrat des Vorstands
  const [statusFilter, setStatusFilter] = useState("offen");
  const [typFilter, setTypFilter] = useState("");
  const [seite, setSeite] = useState(0);

  // Sperrtermin-Modal
  const [sperrModalOffen, setSperrModalOffen] = useState(false);
  const [sperrStart, setSperrStart] = useState<Date | null>(null);
  const [sperrEnde, setSperrEnde] = useState<Date | null>(null);
  const [sperrGrund, setSperrGrund] = useState("");
  const [sperrSendet, setSperrSendet] = useState(false);
  const [sperrFehler, setSperrFehler] = useState("");

  // Löschen-Bestätigung
  const [loeschAnfrage, setLoeschAnfrage] = useState<SportheimAnfrage | null>(null);

  // Toast-Feedback
  const [erfolg, setErfolg] = useState("");
  const [aktionsFehler, setAktionsFehler] = useState("");

  const ladeAnfragen = useCallback(async () => {
    setLaden(true);
    setFehler("");

    const von = seite * PRO_SEITE;
    const bis = von + PRO_SEITE - 1;

    let query = supabase
      .from("sportheim_anfragen")
      .select("*", { count: "exact" })
      // Nächste Termine zuerst – der Vorstand arbeitet chronologisch
      .order("startzeit", { ascending: true })
      .range(von, bis);

    if (statusFilter) query = query.eq("status", statusFilter);
    if (typFilter) query = query.eq("typ", typFilter);

    const { data, error, count } = await query;

    if (error) {
      setFehler("Fehler beim Laden der Anfragen: " + error.message);
      setAnfragen([]);
    } else {
      setAnfragen((data as SportheimAnfrage[]) ?? []);
      setGesamt(count ?? 0);
    }
    setLaden(false);
  }, [seite, statusFilter, typFilter]);

  useEffect(() => {
    ladeAnfragen();
  }, [ladeAnfragen]);

  const letzteSeite = Math.max(0, Math.ceil(gesamt / PRO_SEITE) - 1);

  // Status einer Anfrage setzen – die Annahme macht den Zeitraum sofort im
  // öffentlichen Kalender sichtbar (sportheim_belegte_zeiten).
  const setzeStatus = async (
    anfrage: SportheimAnfrage,
    status: SportheimAnfrageStatus
  ) => {
    const { error } = await supabase
      .from("sportheim_anfragen")
      .update({ status })
      .eq("id", anfrage.id);

    if (error) {
      setAktionsFehler("Status konnte nicht gesetzt werden: " + error.message);
    } else {
      setErfolg(`Anfrage auf „${STATUS_LABEL[status]}“ gesetzt.`);
      ladeAnfragen();
    }
  };

  // Sperrtermin anlegen: Kontaktfelder bleiben null, Status ist per
  // DB-Constraint immer "angenommen".
  const sperrterminAnlegen = async () => {
    setSperrFehler("");

    if (!sperrStart || !sperrEnde) {
      setSperrFehler("Bitte Beginn und Ende der Sperrung auswählen.");
      return;
    }
    if (sperrEnde <= sperrStart) {
      setSperrFehler("Das Ende muss nach dem Beginn liegen.");
      return;
    }

    setSperrSendet(true);

    // erstellt_von dokumentiert, wer die Sperrung eingetragen hat
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { error } = await supabase.from("sportheim_anfragen").insert({
      typ: "sperrung",
      status: "angenommen",
      startzeit: sperrStart.toISOString(),
      endzeit: sperrEnde.toISOString(),
      anlass: sperrGrund.trim() || null,
      erstellt_von: session?.user?.id ?? null,
    });

    setSperrSendet(false);

    if (error) {
      setSperrFehler("Sperrtermin konnte nicht angelegt werden: " + error.message);
      return;
    }

    setErfolg("Sperrtermin angelegt.");
    setSperrModalOffen(false);
    setSperrStart(null);
    setSperrEnde(null);
    setSperrGrund("");
    ladeAnfragen();
  };

  const loeschenBestaetigen = async () => {
    if (!loeschAnfrage) return;

    const { error } = await supabase
      .from("sportheim_anfragen")
      .delete()
      .eq("id", loeschAnfrage.id);

    if (error) {
      setAktionsFehler("Löschen fehlgeschlagen: " + error.message);
    } else {
      setErfolg(
        loeschAnfrage.typ === "sperrung"
          ? "Sperrtermin gelöscht."
          : "Anfrage gelöscht."
      );
      ladeAnfragen();
    }
    setLoeschAnfrage(null);
  };

  // Name + Kontakt einer Zeile – Sperrtermine haben bewusst keine Kontaktdaten
  const nameZeile = (a: SportheimAnfrage) =>
    a.typ === "sperrung" ? "Sperrtermin" : `${a.vorname ?? ""} ${a.nachname ?? ""}`.trim();

  return (
    <div className="space-y-6">
      {fehler && (
        <p className="font-inter text-sm text-fcb-red p-3 border border-fcb-red/40 rounded-lg bg-fcb-red/10">
          {fehler}
        </p>
      )}

      {/* Filterleiste + Sperrtermin-Aktion */}
      <div
        role="group"
        aria-label="Sportheim-Anfragen filtern"
        className="flex flex-col sm:flex-row gap-3 flex-wrap items-end"
      >
        <div className="sm:w-52">
          <Select
            label="Status"
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v);
              setSeite(0);
            }}
            options={STATUS_FILTER_OPTIONEN}
          />
        </div>

        <div className="sm:w-60">
          <Select
            label="Typ"
            value={typFilter}
            onChange={(v) => {
              setTypFilter(v);
              setSeite(0);
            }}
            options={TYP_FILTER_OPTIONEN}
          />
        </div>

        <Button
          variant="secondary"
          onClick={() => {
            setStatusFilter("offen");
            setTypFilter("");
            setSeite(0);
          }}
        >
          Zurücksetzen
        </Button>

        {/* Sperrtermin rechtsbündig – die "neue Daten anlegen"-Aktion der Ansicht */}
        <div className="sm:ml-auto">
          <Button variant="primary" onClick={() => setSperrModalOffen(true)}>
            <CalendarOff size={16} aria-hidden />
            Sperrtermin eintragen
          </Button>
        </div>
      </div>

      {!laden && (
        <p className="font-inter text-sm text-fcb-muted">
          {gesamt} Eintrag{gesamt !== 1 ? "e" : ""} im gewählten Filter
        </p>
      )}

      {laden ? (
        <p className="font-inter text-center text-fcb-muted mt-6">Lade Anfragen …</p>
      ) : anfragen.length === 0 ? (
        <p className="font-inter text-center italic text-fcb-muted mt-6">
          Keine Einträge im gewählten Filter.
        </p>
      ) : (
        <>
          {/* Mobile: Card-Layout (unter md) */}
          <div className="md:hidden space-y-3">
            {anfragen.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl border border-fcb-border bg-fcb-surface p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-oswald text-base font-semibold uppercase tracking-wide text-fcb-text">
                    {nameZeile(a)}
                  </span>
                  <Badge variant={a.typ === "sperrung" ? "purple" : STATUS_BADGE[a.status]}>
                    {a.typ === "sperrung" ? "Sperrung" : STATUS_LABEL[a.status]}
                  </Badge>
                </div>

                <p className="font-inter text-sm text-fcb-text">
                  {zeitspanne(a.startzeit, a.endzeit)}
                </p>

                {a.anlass && (
                  <p className="font-inter text-xs text-fcb-muted">{a.anlass}</p>
                )}

                {a.typ === "anfrage" && (
                  <p className="font-inter text-xs text-fcb-muted">
                    {a.email} · {a.telefonnummer}
                  </p>
                )}

                {a.nachricht && (
                  <p className="font-inter text-xs italic text-fcb-muted">{a.nachricht}</p>
                )}

                <div className="flex items-center justify-between pt-1">
                  <StatusAktionen anfrage={a} onStatus={(s) => setzeStatus(a, s)} />
                  <button
                    onClick={() => setLoeschAnfrage(a)}
                    className="p-1.5 rounded text-fcb-muted hover:text-fcb-red hover:bg-fcb-red/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-red"
                    title="Eintrag löschen"
                    aria-label="Eintrag löschen"
                  >
                    <Trash2 size={16} />
                  </button>
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
                  <th className="py-3 px-4 font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted">Name</th>
                  <th className="py-3 px-4 font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted hidden lg:table-cell">Kontakt</th>
                  <th className="py-3 px-4 font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted">Anlass</th>
                  <th className="py-3 px-4 font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted">Status</th>
                  <th className="py-3 px-4 font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {anfragen.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-fcb-border hover:bg-fcb-border/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-inter text-fcb-text whitespace-nowrap">
                      {zeitspanne(a.startzeit, a.endzeit)}
                    </td>
                    <td className="py-3 px-4 font-inter text-fcb-text">{nameZeile(a)}</td>
                    <td className="py-3 px-4 font-inter text-fcb-muted hidden lg:table-cell">
                      {a.typ === "anfrage" ? (
                        <span className="block">
                          {a.email}
                          <span className="block text-xs">{a.telefonnummer}</span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 px-4 font-inter text-fcb-muted">
                      {a.anlass ?? "—"}
                      {a.nachricht && (
                        <span className="block max-w-[24rem] truncate text-xs italic" title={a.nachricht}>
                          {a.nachricht}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={a.typ === "sperrung" ? "purple" : STATUS_BADGE[a.status]}>
                        {a.typ === "sperrung" ? "Sperrung" : STATUS_LABEL[a.status]}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <StatusAktionen anfrage={a} onStatus={(s) => setzeStatus(a, s)} />
                        <button
                          onClick={() => setLoeschAnfrage(a)}
                          className="p-1.5 rounded text-fcb-muted hover:text-fcb-red hover:bg-fcb-red/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-red"
                          title="Eintrag löschen"
                          aria-label="Eintrag löschen"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination – nur bei mehr als einer Seite */}
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

      {/* Sperrtermin-Modal */}
      <Modal
        open={sperrModalOffen}
        onClose={() => setSperrModalOffen(false)}
        title="Sperrtermin eintragen"
      >
        <div className="space-y-4">
          <p className="font-inter text-sm text-fcb-muted">
            Der Zeitraum wird im öffentlichen Kalender sofort als belegt
            angezeigt – ohne weitere Details.
          </p>

          <div className="space-y-1.5">
            <label className="block font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted">
              Beginn <span className="text-fcb-red normal-case">*</span>
            </label>
            <DatePicker
              selected={sperrStart}
              onChange={(date) => {
                if (date) {
                  setSperrStart(date);
                  // Endzeit-Vorschlag +4 h wie im Anfrageformular
                  if (!sperrEnde) {
                    setSperrEnde(new Date(date.getTime() + 4 * 60 * 60 * 1000));
                  }
                }
              }}
              locale="de"
              showTimeSelect
              timeCaption="Uhrzeit"
              timeFormat="HH:mm"
              timeIntervals={30}
              dateFormat="dd.MM.yyyy HH:mm"
              placeholderText="Beginn wählen"
              className={DATEPICKER_INPUT_KLASSEN}
              wrapperClassName="w-full"
              popperPlacement="bottom-start"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted">
              Ende <span className="text-fcb-red normal-case">*</span>
            </label>
            <DatePicker
              selected={sperrEnde}
              onChange={(date) => setSperrEnde(date)}
              locale="de"
              showTimeSelect
              timeCaption="Uhrzeit"
              timeFormat="HH:mm"
              timeIntervals={30}
              dateFormat="dd.MM.yyyy HH:mm"
              minDate={sperrStart ?? undefined}
              placeholderText="Ende wählen"
              className={DATEPICKER_INPUT_KLASSEN}
              wrapperClassName="w-full"
            />
          </div>

          <TextField
            label="Grund"
            value={sperrGrund}
            onChange={setSperrGrund}
            placeholder="Interner Vermerk, z. B. Vereinsfeier"
            optional
          />

          {sperrFehler && (
            <p className="font-inter text-sm text-fcb-red">{sperrFehler}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setSperrModalOffen(false)}>
              Abbrechen
            </Button>
            <Button variant="primary" onClick={sperrterminAnlegen} disabled={sperrSendet}>
              {sperrSendet ? "Wird angelegt …" : "Sperrtermin anlegen"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Löschen-Bestätigung */}
      <Modal
        open={loeschAnfrage !== null}
        onClose={() => setLoeschAnfrage(null)}
        title="Eintrag löschen"
        size="sm"
      >
        <div className="space-y-4">
          <p className="font-inter text-sm text-fcb-text">
            {loeschAnfrage?.typ === "sperrung"
              ? "Diesen Sperrtermin wirklich löschen?"
              : `Die Anfrage von ${loeschAnfrage ? nameZeile(loeschAnfrage) : ""} wirklich löschen?`}
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setLoeschAnfrage(null)}>
              Abbrechen
            </Button>
            <Button variant="danger" onClick={loeschenBestaetigen}>
              Löschen
            </Button>
          </div>
        </div>
      </Modal>

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
