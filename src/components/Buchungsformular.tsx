import { useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { de } from "date-fns/locale";
import { format } from "date-fns";
import { CheckCircle2, Repeat, TriangleAlert, X } from "lucide-react";
import { fetchEvents } from "@/utils/fetchEvents";
import { PLATZ_FARBEN } from "@/utils/getEventColor";
import { SupabaseClient } from "@supabase/supabase-js";
import type { EventInput } from "@fullcalendar/core";
import TextField from "@/components/ui/TextField";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import {
  erstelleSerienbuchung,
  type SerienErgebnis,
  type SerienSpezifikation,
} from "@/lib/serienbuchung";
import { PLATZANTEIL_OPTIONEN, ANLASS_OPTIONEN } from "@/lib/buchungsOptionen";

// Deutsch-Locale für react-datepicker registrieren
registerLocale("de", de);

type Props = {
  userId: string;
  supabase: SupabaseClient;
  setEvents: (events: EventInput[]) => void;
  setSuccessMessage: (msg: string) => void;
  setErrorMessage: (msg: string) => void;
};

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

  // Serien-Zustand: wöchentliche Wiederholung bis zu einem Enddatum.
  // Das Ergebnis bleibt nach dem Anlegen sichtbar, damit nachvollziehbar ist,
  // welche Termine wegen Belegungskonflikten übersprungen wurden.
  const [serieAktiv, setSerieAktiv] = useState(false);
  const [serienEnddatum, setSerienEnddatum] = useState<Date | null>(null);
  const [serienErgebnis, setSerienErgebnis] = useState<SerienErgebnis | null>(null);

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

    // Serien-Zweig: Termine erzeugt und geprüft von erstelleSerienbuchung –
    // Konflikte überspringen dort die Einzeltermine, nie die ganze Serie.
    if (serieAktiv) {
      if (!serienEnddatum) {
        setErrorMessage("Bitte ein Enddatum für die Serie auswählen.");
        return;
      }
      if (serienEnddatum < startzeit) {
        setErrorMessage("Das Serien-Enddatum darf nicht vor dem ersten Termin liegen.");
        return;
      }
      // Obergrenze 1 Jahr: schützt vor versehentlichen Dauerschleifen-Serien
      // (falsches Jahr im Datepicker) und unnötig vielen Inserts.
      const einJahrSpaeter = new Date(startzeit);
      einJahrSpaeter.setFullYear(einJahrSpaeter.getFullYear() + 1);
      if (serienEnddatum > einJahrSpaeter) {
        setErrorMessage("Eine Serie kann maximal ein Jahr umfassen.");
        return;
      }

      const spezifikation: SerienSpezifikation = {
        startzeit,
        endzeitErsterTermin: endzeit,
        serienEnddatum,
        platz,
        // Die Select-Optionen erlauben nur die drei gültigen Werte,
        // daher ist die Zusicherung auf den Union-Typ sicher.
        platzanteil: platzanteil as SerienSpezifikation["platzanteil"],
        anlass,
        mannschaft,
        buchendePerson,
        bemerkung,
        userId,
      };

      const ergebnis = await erstelleSerienbuchung(spezifikation, supabase);
      setSerienErgebnis(ergebnis);

      if (ergebnis.erstellt.length === 0) {
        setErrorMessage(
          "Es konnte kein Termin der Serie angelegt werden – Details in der Zusammenfassung."
        );
      } else {
        setErrorMessage("");
        setSuccessMessage(
          `Serie angelegt: ${ergebnis.erstellt.length} Termin${
            ergebnis.erstellt.length !== 1 ? "e" : ""
          } erstellt, ${ergebnis.uebersprungen.length} übersprungen.`
        );
        // Formular nur bei Erfolg zurücksetzen – bei kompletter Kollision
        // bleiben die Eingaben zum Korrigieren erhalten.
        setMannschaft("");
        setBuchendePerson("");
        setBemerkung("");
        setStartzeit(null);
        setEndzeit(null);
        setSerienEnddatum(null);
        setSerieAktiv(false);
      }

      await fetchEvents(supabase, setEvents);
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
    setSerienErgebnis(null); // alte Serien-Zusammenfassung passt nicht mehr zur neuen Buchung
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

      {/* Surface-Karte hebt das Formular vom Seiten-Hintergrund (bg-fcb-bg) ab –
          dadurch haben die bg-fcb-bg-Eingabefelder ihren sichtbaren Kontrast. */}
      <div className="rounded-2xl border border-fcb-border bg-fcb-surface p-6">
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
                        ? "bg-fcb-accent text-white"
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
              timeCaption="Uhrzeit"
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd.MM.yyyy HH:mm"
              placeholderText="Startzeit wählen"
              // Wrapper-Klasse: Input-Stil nutzt fcb-Tokens via globals.css-Regeln
              className="w-full rounded-lg border border-fcb-border bg-fcb-bg px-3 py-2.5 font-inter text-sm text-fcb-text placeholder:text-fcb-muted/60 focus:border-fcb-accent focus:outline-none"
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
              timeCaption="Uhrzeit"
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd.MM.yyyy HH:mm"
              placeholderText="Endzeit wählen"
              className="w-full rounded-lg border border-fcb-border bg-fcb-bg px-3 py-2.5 font-inter text-sm text-fcb-text placeholder:text-fcb-muted/60 focus:border-fcb-accent focus:outline-none"
              wrapperClassName="w-full"
            />
          </div>
        </div>

        {/* Serien-Option: wöchentliche Wiederholung bis zu einem Enddatum */}
        <div className="space-y-3">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={serieAktiv}
              onChange={(e) => setSerieAktiv(e.target.checked)}
              className="h-4 w-4 rounded border-fcb-border accent-fcb-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent"
            />
            <span className="inline-flex items-center gap-1.5 font-inter text-sm text-fcb-text">
              <Repeat size={16} aria-hidden className="text-fcb-muted" />
              Wöchentlich wiederholen (Serie)
            </span>
          </label>

          {serieAktiv && (
            <div className="space-y-1.5">
              <label className="block font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted">
                Serie endet am <span className="text-fcb-red normal-case">*</span>
              </label>
              <DatePicker
                selected={serienEnddatum}
                onChange={(date) => setSerienEnddatum(date)}
                locale="de"
                dateFormat="dd.MM.yyyy"
                minDate={startzeit ?? undefined}
                placeholderText="Enddatum der Serie wählen"
                className="w-full rounded-lg border border-fcb-border bg-fcb-bg px-3 py-2.5 font-inter text-sm text-fcb-text placeholder:text-fcb-muted/60 focus:border-fcb-accent focus:outline-none"
                wrapperClassName="w-full sm:w-64"
              />
              <p className="font-inter text-xs text-fcb-muted">
                Der Termin wird jede Woche zur gleichen Zeit angelegt. Bereits
                belegte Termine werden übersprungen – die restliche Serie wird
                trotzdem gebucht.
              </p>
            </div>
          )}
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
            {serieAktiv ? "Serie speichern" : "Buchung speichern"}
          </Button>
          <p className="font-inter text-xs text-fcb-muted">
            <span className="text-fcb-red">*</span> Pflichtfeld
          </p>
        </div>
      </form>

      {/* Serien-Zusammenfassung: bleibt nach dem Anlegen stehen, damit
          nachvollziehbar ist, welche Termine es in den Kalender geschafft haben. */}
      {serienErgebnis && (
        <div className="mt-6 rounded-lg border border-fcb-border bg-fcb-bg p-4 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-oswald text-lg font-semibold uppercase tracking-wide text-fcb-text">
              Serien-Zusammenfassung
            </h3>
            <button
              type="button"
              onClick={() => setSerienErgebnis(null)}
              aria-label="Zusammenfassung schließen"
              className="p-1 rounded text-fcb-muted hover:text-fcb-text transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent"
            >
              <X size={16} />
            </button>
          </div>

          {/* Erstellte Termine – grünes Tint-Muster wie ui/Banner (success) */}
          {serienErgebnis.erstellt.length > 0 && (
            <div className="rounded-lg border border-green-500/40 bg-green-500/10 p-3 space-y-1.5">
              <p className="inline-flex items-center gap-1.5 font-inter text-sm font-medium text-fcb-text">
                <CheckCircle2
                  size={16}
                  aria-hidden
                  className="text-green-600 dark:text-green-500"
                />
                {serienErgebnis.erstellt.length} Termin
                {serienErgebnis.erstellt.length !== 1 ? "e" : ""} erstellt
              </p>
              <ul className="font-inter text-sm text-fcb-muted space-y-0.5 pl-6 list-disc">
                {serienErgebnis.erstellt.map((termin) => (
                  <li key={termin.startzeit.toISOString()}>
                    {format(termin.startzeit, "EEEE, dd.MM.yyyy HH:mm", { locale: de })}
                    {" – "}
                    {format(termin.endzeit, "HH:mm", { locale: de })} Uhr
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Übersprungene Termine mit Grund – gelbes Tint-Muster wie ui/Banner (warning) */}
          {serienErgebnis.uebersprungen.length > 0 && (
            <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 space-y-1.5">
              <p className="inline-flex items-center gap-1.5 font-inter text-sm font-medium text-fcb-text">
                <TriangleAlert
                  size={16}
                  aria-hidden
                  className="text-yellow-600 dark:text-yellow-500"
                />
                {serienErgebnis.uebersprungen.length} Termin
                {serienErgebnis.uebersprungen.length !== 1 ? "e" : ""} übersprungen
              </p>
              <ul className="font-inter text-sm text-fcb-muted space-y-0.5 pl-6 list-disc">
                {serienErgebnis.uebersprungen.map((termin) => (
                  <li key={termin.startzeit.toISOString()}>
                    {format(termin.startzeit, "EEEE, dd.MM.yyyy HH:mm", { locale: de })}
                    {" – "}
                    {termin.grund}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      </div>
    </>
  );
}
