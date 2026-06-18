import { useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { de } from "date-fns/locale";
import { fetchEvents } from "@/utils/fetchEvents";
import { PLATZ_FARBEN } from "@/utils/getEventColor";
import { SupabaseClient } from "@supabase/supabase-js";
import type { EventInput } from "@fullcalendar/core";
import TextField from "@/components/ui/TextField";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

// Deutsch-Locale für react-datepicker registrieren
registerLocale("de", de);

type Props = {
  userId: string;
  supabase: SupabaseClient;
  setEvents: (events: EventInput[]) => void;
  setSuccessMessage: (msg: string) => void;
  setErrorMessage: (msg: string) => void;
};

// Optionslisten für die Auswahl-Felder
const PLATZANTEIL_OPTIONEN = [
  { value: "viertel", label: "1/4 Platz" },
  { value: "halb", label: "1/2 Platz" },
  { value: "ganz", label: "Ganzer Platz" },
];

const ANLASS_OPTIONEN = [
  { value: "training", label: "Training" },
  { value: "freundschaftsspiel", label: "Freundschaftsspiel" },
  { value: "punktspiel", label: "Punktspiel" },
  { value: "platzpflege", label: "Platzpflege" },
];

export default function Buchungsformular({
  userId,
  supabase,
  setEvents,
  setSuccessMessage,
  setErrorMessage,
}: Props) {
  // Formular-Zustände – Logik unverändert
  const [platz, setPlatz] = useState("hauptplatz");
  const [platzanteil, setPlatzanteil] = useState("ganz");
  const [anlass, setAnlass] = useState("training");
  const [startzeit, setStartzeit] = useState<Date | null>(null);
  const [endzeit, setEndzeit] = useState<Date | null>(null);
  const [mannschaft, setMannschaft] = useState("");
  const [buchendePerson, setBuchendePerson] = useState("");
  const [bemerkung, setBemerkung] = useState("");

  // Formularübermittlung + Platzbelegungs-Logik (unverändert)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validierung: Start- und Endzeit müssen vorhanden sein
    if (!startzeit || !endzeit) {
      setErrorMessage("Bitte Start- und Endzeit auswählen.");
      return;
    }

    if (endzeit <= startzeit) {
      setErrorMessage("Die Endzeit muss nach der Startzeit liegen.");
      return;
    }

    const startISO = startzeit.toISOString();
    const endISO = endzeit.toISOString();

    // Abfrage aller bestehenden Buchungen für diesen Platz im selben Zeitraum
    const { data: existing, error: fetchError } = await supabase
      .from("buchungen")
      .select("startzeit, endzeit, platzanteil")
      .eq("platz", platz)
      .gte("endzeit", startISO)
      .lte("startzeit", endISO);

    if (fetchError) {
      setErrorMessage("Fehler beim Abrufen bestehender Buchungen.");
      return;
    }

    // Überschneidungsprüfung auf Basis von Platzanteilen
    const anteilWerte: Record<string, number> = {
      viertel: 0.25,
      halb: 0.5,
      ganz: 1,
    };

    let belegung = 0;
    for (const buchung of existing || []) {
      const startB = new Date(buchung.startzeit).getTime();
      const endB = new Date(buchung.endzeit).getTime();
      const startN = startzeit.getTime();
      const endN = endzeit.getTime();

      if (startN < endB && endN > startB) {
        belegung += anteilWerte[buchung.platzanteil] || 0;
      }
    }

    const neuerWert = anteilWerte[platzanteil];
    if (belegung + neuerWert > 1) {
      setErrorMessage("Der Platz ist zu diesem Zeitpunkt bereits belegt.");
      return;
    }

    // Speichern der neuen Buchung – Supabase-Call unverändert
    const { error: insertError } = await supabase.from("buchungen").insert({
      platz,
      platzanteil,
      anlass,
      startzeit: startISO,
      endzeit: endISO,
      mannschaft,
      buchende_person: buchendePerson,
      bemerkung,
      user_id: userId,
    });

    if (insertError) {
      setErrorMessage("Fehler beim Speichern. Bitte versuche es erneut.");
      return;
    }

    // Formular zurücksetzen + Erfolgsmeldung anzeigen
    setMannschaft("");
    setBuchendePerson("");
    setBemerkung("");
    setStartzeit(null);
    setEndzeit(null);
    setErrorMessage("");
    setSuccessMessage("Die Buchung wurde erfolgreich gespeichert.");

    // Kalender-Einträge aktualisieren
    await fetchEvents(supabase, setEvents);
  };

  return (
    <>
      <h2 className="font-oswald text-2xl font-semibold uppercase tracking-wide text-fcb-text mt-8 mb-4">
        Neue Buchung
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Platzwahl als Segmented Control – Farb-Punkte dienen als Legende
            (gleiche Farben wie die Kalender-Events) */}
        <div className="flex gap-4 flex-wrap items-end">
          <div className="space-y-1.5">
            <span className="block font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted">
              Platz
            </span>
            <div
              role="radiogroup"
              aria-label="Platz"
              className="inline-flex rounded-lg border border-fcb-border overflow-hidden self-start"
            >
              {Object.entries(PLATZ_FARBEN).map(([wert, farbe]) => {
                const aktiv = platz === wert;
                return (
                  <button
                    key={wert}
                    type="button"
                    role="radio"
                    aria-checked={aktiv}
                    onClick={() => setPlatz(wert)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 font-inter text-sm font-medium transition border-r last:border-r-0 border-fcb-border ${
                      aktiv
                        ? "bg-fcb-blue text-white"
                        : "bg-fcb-bg text-fcb-text hover:bg-fcb-surface"
                    }`}
                  >
                    <span
                      className="inline-block h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: farbe }}
                    />
                    {wert.charAt(0).toUpperCase() + wert.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 min-w-[160px]">
            <Select
              label="Platzanteil"
              value={platzanteil}
              onChange={setPlatzanteil}
              options={PLATZANTEIL_OPTIONEN}
              required
            />
          </div>

          <div className="flex-1 min-w-[160px]">
            <Select
              label="Anlass"
              value={anlass}
              onChange={setAnlass}
              options={ANLASS_OPTIONEN}
              required
            />
          </div>
        </div>

        {/* Zeitangaben – react-datepicker Logik unverändert, nur Styling */}
        <div className="flex gap-4 flex-wrap">
          <div className="space-y-1.5">
            <label className="block font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted">
              Startzeit <span className="text-fcb-red normal-case">*</span>
            </label>
            <DatePicker
              selected={startzeit}
              onChange={(date) => {
                if (date) {
                  setStartzeit(date);
                  const hours = date.getHours();
                  const minutes = date.getMinutes();
                  const hatUhrzeit = hours !== 0 || minutes !== 0;

                  // Automatischer Endzeit-Vorschlag: +90 Minuten
                  if (!endzeit && hatUhrzeit) {
                    const endzeitVorschlag = new Date(date.getTime() + 90 * 60 * 1000);
                    setEndzeit(endzeitVorschlag);
                  }
                }
              }}
              locale="de"
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd.MM.yyyy HH:mm"
              placeholderText="Startzeit wählen"
              // Wrapper-Klasse: Input-Stil nutzt fcb-Tokens via globals.css-Regeln
              className="w-full rounded-lg border border-fcb-border bg-fcb-bg px-3 py-2.5 font-inter text-sm text-fcb-text placeholder:text-fcb-muted/60 focus:border-fcb-blue focus:outline-none"
              wrapperClassName="w-full"
              popperPlacement="bottom-start"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted">
              Endzeit <span className="text-fcb-red normal-case">*</span>
            </label>
            <DatePicker
              selected={endzeit}
              onChange={(date) => setEndzeit(date)}
              locale="de"
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd.MM.yyyy HH:mm"
              placeholderText="Endzeit wählen"
              className="w-full rounded-lg border border-fcb-border bg-fcb-bg px-3 py-2.5 font-inter text-sm text-fcb-text placeholder:text-fcb-muted/60 focus:border-fcb-blue focus:outline-none"
              wrapperClassName="w-full"
            />
          </div>
        </div>

        {/* Buchende Person und Mannschaft */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <TextField
              label="Buchende Person"
              value={buchendePerson}
              onChange={setBuchendePerson}
              placeholder="Name der buchenden Person"
              required
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <TextField
              label="Mannschaft"
              value={mannschaft}
              onChange={setMannschaft}
              placeholder="Mannschaftsname"
              required
            />
          </div>
        </div>

        {/* Optionale Bemerkung */}
        <Textarea
          label="Bemerkung"
          value={bemerkung}
          onChange={setBemerkung}
          placeholder="Weitere Informationen (optional)"
          rows={3}
          optional
        />

        {/* Absenden */}
        <div className="flex items-center gap-4 flex-wrap">
          <Button type="submit" variant="primary">
            Buchung speichern
          </Button>
          <p className="font-inter text-xs text-fcb-muted">
            <span className="text-fcb-red">*</span> Pflichtfeld
          </p>
        </div>
      </form>
    </>
  );
}
