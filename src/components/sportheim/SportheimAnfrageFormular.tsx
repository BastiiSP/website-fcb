"use client";

import { useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { de } from "date-fns/locale";
import type { SupabaseClient } from "@supabase/supabase-js";

import TextField from "@/components/ui/TextField";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import Banner from "@/components/ui/Banner";
import { SPORTHEIM_ANLASS_OPTIONEN } from "@/lib/sportheim";
import type { SportheimAnfrageInsert } from "@/lib/sportheimAnfragenTypes";

// Deutsch-Locale für react-datepicker registrieren (idempotent, wie Buchungsformular)
registerLocale("de", de);

// Gleicher Input-Stil wie die DatePicker im Buchungsformular
const DATEPICKER_INPUT_KLASSEN =
  "w-full rounded-lg border border-fcb-border bg-fcb-bg px-3 py-2.5 font-inter text-sm text-fcb-text placeholder:text-fcb-muted/60 focus:border-fcb-accent focus:outline-none";

/** Ein bereits belegtes Zeitfenster – Grundlage der Überschneidungsprüfung. */
export interface BelegtesZeitfenster {
  start: Date;
  ende: Date;
  /** Nur für die Fehlermeldung: Heimspieltage bekommen einen eigenen Hinweis. */
  istHeimspieltag: boolean;
}

interface Props {
  supabase: SupabaseClient;
  belegteZeitfenster: BelegtesZeitfenster[];
  /** Vorbelegung der Startzeit durch Klick in den Kalender */
  startzeitVorschlag: Date | null;
}

/**
 * Öffentliches Anfrageformular fürs Sportheim – ohne Login nutzbar.
 * Kontaktdaten sind Pflicht (DB-Constraint), die Anfrage landet mit Status
 * "offen" in sportheim_anfragen. Bewusst keine E-Mail-Bestätigung: die
 * Erfolgsmeldung auf der Seite reicht (Phase 3b).
 */
export default function SportheimAnfrageFormular({
  supabase,
  belegteZeitfenster,
  startzeitVorschlag,
}: Props) {
  const [vorname, setVorname] = useState("");
  const [nachname, setNachname] = useState("");
  const [email, setEmail] = useState("");
  const [telefonnummer, setTelefonnummer] = useState("");
  const [anlass, setAnlass] = useState(SPORTHEIM_ANLASS_OPTIONEN[0].value);
  const [startzeit, setStartzeit] = useState<Date | null>(null);
  const [endzeit, setEndzeit] = useState<Date | null>(null);
  const [nachricht, setNachricht] = useState("");

  const [fehler, setFehler] = useState("");
  const [erfolg, setErfolg] = useState(false);
  const [sendet, setSendet] = useState(false);

  // Kalender-Klick übernehmen, ohne eine bereits getroffene Auswahl zu überschreiben.
  // Vergleich über getTime, damit derselbe Vorschlag nicht mehrfach angewendet wird.
  const [uebernommenerVorschlag, setUebernommenerVorschlag] = useState<number | null>(null);
  if (
    startzeitVorschlag &&
    startzeitVorschlag.getTime() !== uebernommenerVorschlag
  ) {
    setUebernommenerVorschlag(startzeitVorschlag.getTime());
    const start = new Date(startzeitVorschlag);
    // Monatsansicht liefert 00:00 Uhr → sinnvoller Abend-Default für Feiern
    if (start.getHours() === 0 && start.getMinutes() === 0) {
      start.setHours(18, 0, 0, 0);
    }
    setStartzeit(start);
    setEndzeit(new Date(start.getTime() + 4 * 60 * 60 * 1000));
    setErfolg(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFehler("");
    setErfolg(false);

    if (!startzeit || !endzeit) {
      setFehler("Bitte Beginn und Ende der Veranstaltung auswählen.");
      return;
    }
    if (endzeit <= startzeit) {
      setFehler("Das Ende muss nach dem Beginn liegen.");
      return;
    }
    if (startzeit < new Date()) {
      setFehler("Der Termin liegt in der Vergangenheit.");
      return;
    }

    // Überschneidungsprüfung gegen belegte Fenster (angenommene Anfragen,
    // Sperrtermine, Heimspieltage). Nur Komfort fürs Frontend – verbindlich
    // entscheidet ohnehin der Vorstand über jede Anfrage.
    const konflikt = belegteZeitfenster.find(
      (fenster) => startzeit < fenster.ende && endzeit > fenster.start
    );
    if (konflikt) {
      setFehler(
        konflikt.istHeimspieltag
          ? "Rund um das Heimspiel ist das Sportheim für den Spielbetrieb reserviert (bis 4 Stunden nach Anstoß). Bitte wähle eine Zeit davor oder danach."
          : "Der gewünschte Zeitraum ist bereits belegt. Bitte wähle einen freien Termin."
      );
      return;
    }

    setSendet(true);

    try {
      const neueAnfrage: SportheimAnfrageInsert = {
        vorname: vorname.trim(),
        nachname: nachname.trim(),
        email: email.trim(),
        telefonnummer: telefonnummer.trim(),
        startzeit: startzeit.toISOString(),
        endzeit: endzeit.toISOString(),
        anlass,
        nachricht: nachricht.trim() || null,
      };

      const { error } = await supabase
        .from("sportheim_anfragen")
        .insert(neueAnfrage);

      if (error) {
        console.error("Fehler beim Senden der Sportheim-Anfrage:", error.message);
        setFehler("Die Anfrage konnte nicht gesendet werden. Bitte versuche es später erneut.");
        return;
      }

      // Bestätigung auf der Seite + Formular leeren (bewusst keine E-Mail)
      setErfolg(true);
      setVorname("");
      setNachname("");
      setEmail("");
      setTelefonnummer("");
      setAnlass(SPORTHEIM_ANLASS_OPTIONEN[0].value);
      setStartzeit(null);
      setEndzeit(null);
      setNachricht("");
    } catch (err) {
      console.error("Unerwarteter Fehler beim Senden der Sportheim-Anfrage:", err);
      setFehler("Die Anfrage konnte nicht gesendet werden. Bitte versuche es später erneut.");
    } finally {
      setSendet(false);
    }
  };

  return (
    <div className="rounded-2xl border border-fcb-border bg-fcb-surface p-6">
      <h2 className="mb-1 font-oswald text-2xl font-semibold uppercase tracking-wide text-fcb-text">
        Unverbindlich anfragen
      </h2>
      <p className="mb-6 font-inter text-sm text-fcb-muted">
        Deine Anfrage ist keine feste Buchung – der Vorstand prüft sie und
        meldet sich bei dir.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Wunschtermin – gleicher DatePicker-Baustein wie die Platzbuchung */}
        <div className="flex flex-wrap gap-4">
          <div className="space-y-1.5">
            <label className="block font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted">
              Beginn <span className="text-fcb-red normal-case">*</span>
            </label>
            <DatePicker
              selected={startzeit}
              onChange={(date) => {
                if (date) {
                  setStartzeit(date);
                  // Endzeit-Vorschlag +4 h – typische Dauer einer Feier
                  if (!endzeit) {
                    setEndzeit(new Date(date.getTime() + 4 * 60 * 60 * 1000));
                  }
                }
              }}
              locale="de"
              showTimeSelect
              timeCaption="Uhrzeit"
              timeFormat="HH:mm"
              timeIntervals={30}
              dateFormat="dd.MM.yyyy HH:mm"
              minDate={new Date()}
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
              selected={endzeit}
              onChange={(date) => setEndzeit(date)}
              locale="de"
              showTimeSelect
              timeCaption="Uhrzeit"
              timeFormat="HH:mm"
              timeIntervals={30}
              dateFormat="dd.MM.yyyy HH:mm"
              minDate={startzeit ?? new Date()}
              placeholderText="Ende wählen"
              className={DATEPICKER_INPUT_KLASSEN}
              wrapperClassName="w-full"
            />
          </div>

          <div className="min-w-[200px] flex-1">
            <Select
              label="Anlass"
              value={anlass}
              onChange={setAnlass}
              options={SPORTHEIM_ANLASS_OPTIONEN}
              required
            />
          </div>
        </div>

        {/* Kontaktdaten – alle Pflicht (DB-Constraint), sonst kann der Vorstand
            die Anfrage nicht beantworten */}
        <div className="flex flex-wrap gap-4">
          <div className="min-w-[200px] flex-1">
            <TextField
              label="Vorname"
              value={vorname}
              onChange={setVorname}
              autoComplete="given-name"
              required
            />
          </div>
          <div className="min-w-[200px] flex-1">
            <TextField
              label="Nachname"
              value={nachname}
              onChange={setNachname}
              autoComplete="family-name"
              required
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="min-w-[200px] flex-1">
            <TextField
              label="E-Mail"
              value={email}
              onChange={setEmail}
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="min-w-[200px] flex-1">
            <TextField
              label="Telefonnummer"
              value={telefonnummer}
              onChange={setTelefonnummer}
              type="tel"
              autoComplete="tel"
              required
            />
          </div>
        </div>

        <Textarea
          label="Nachricht"
          value={nachricht}
          onChange={setNachricht}
          placeholder="Weitere Informationen zur Veranstaltung (optional)"
          rows={3}
          optional
        />

        {/* Feedback direkt am Formular */}
        {fehler && <Banner variant="error" message={fehler} />}
        {erfolg && (
          <Banner
            variant="success"
            message="Vielen Dank! Deine unverbindliche Anfrage ist eingegangen – der Vorstand meldet sich bei dir."
          />
        )}

        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" variant="primary" disabled={sendet}>
            {sendet ? "Wird gesendet …" : "Anfrage senden"}
          </Button>
          <p className="font-inter text-xs text-fcb-muted">
            <span className="text-fcb-red">*</span> Pflichtfeld
          </p>
        </div>
      </form>
    </div>
  );
}
