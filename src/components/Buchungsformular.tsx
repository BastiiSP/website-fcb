import { useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { de } from "date-fns/locale";
import { fetchEvents } from "@/utils/fetchEvents";
import { PLATZ_FARBEN } from "@/utils/getEventColor";
import { SupabaseClient } from "@supabase/supabase-js";
import type { EventInput } from "@fullcalendar/core";

// 🗓️ Registrierung der deutschen Sprache für das DatePicker-Modul
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
  // 🧠 Formular-Zustände
  const [platz, setPlatz] = useState("hauptplatz");
  const [platzanteil, setPlatzanteil] = useState("ganz");
  const [anlass, setAnlass] = useState("training");
  const [startzeit, setStartzeit] = useState<Date | null>(null);
  const [endzeit, setEndzeit] = useState<Date | null>(null);
  const [mannschaft, setMannschaft] = useState("");
  const [buchendePerson, setBuchendePerson] = useState("");
  const [bemerkung, setBemerkung] = useState("");

  // 📨 Formularübermittlung + Logik zur Platzbelegung
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ❗ Validierung: Start- und Endzeit müssen vorhanden sein
    if (!startzeit || !endzeit) {
      setErrorMessage("❌ Bitte Start- und Endzeit auswählen.");
      return;
    }

    if (endzeit <= startzeit) {
      setErrorMessage("❌ Die Endzeit muss nach der Startzeit liegen.");
      return;
    }

    const startISO = startzeit.toISOString();
    const endISO = endzeit.toISOString();

    // 🔄 Abfrage aller bestehenden Buchungen für diesen Platz im selben Zeitraum
    const { data: existing, error: fetchError } = await supabase
      .from("buchungen")
      .select("startzeit, endzeit, platzanteil")
      .eq("platz", platz)
      .gte("endzeit", startISO)
      .lte("startzeit", endISO);

    if (fetchError) {
      setErrorMessage("❌ Fehler beim Abrufen bestehender Buchungen.");
      return;
    }

    // 📊 Überschneidungsprüfung auf Basis von Platzanteilen
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
      setErrorMessage("❌ Der Platz ist zu diesem Zeitpunkt bereits belegt.");
      return;
    }

    // ✅ Speichern der neuen Buchung
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
      setErrorMessage("❌ Fehler beim Speichern. Bitte versuche es erneut.");
      return;
    }

    // 🔄 Formular zurücksetzen + Erfolgsmeldung anzeigen
    setMannschaft("");
    setBuchendePerson("");
    setBemerkung("");
    setStartzeit(null);
    setEndzeit(null);
    setErrorMessage("");
    setSuccessMessage("✅ Die Buchung wurde erfolgreich gespeichert.");

    // 🔁 Kalender-Einträge aktualisieren
    await fetchEvents(supabase, setEvents);
  };

  return (
    <>
      <h2 className="text-xl font-semibold mt-8 mb-2">➕ Neue Buchung</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 📌 Platzwahl als Segmented Control – beide Optionen sichtbar, Farb-Punkt
            dient zugleich als Legende (gleiche Farben wie Kalender-Events) */}
        <div className="flex gap-4 flex-wrap items-stretch">
          <div
            role="radiogroup"
            aria-label="Platz"
            className="inline-flex rounded-lg border border-gray-300 overflow-hidden self-start"
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
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition border-r last:border-r-0 border-gray-300 ${
                    aktiv
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "bg-[var(--background)] text-[var(--foreground)] hover:opacity-70"
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

          {/* appearance-none entfernt den Browser-/forms-Plugin-Pfeil;
              SVG-Chevron wird per relativem Wrapper manuell positioniert */}
          <div className="relative">
            <select
              value={platzanteil}
              onChange={(e) => setPlatzanteil(e.target.value)}
              required
              className="form-field appearance-none bg-[var(--background)] pr-8"
            >
              <option value="viertel">1/4 Platz</option>
              <option value="halb">1/2 Platz</option>
              <option value="ganz">Ganzer Platz</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <svg className="h-4 w-4 opacity-50" fill="none" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="relative">
            <select
              value={anlass}
              onChange={(e) => setAnlass(e.target.value)}
              required
              className="form-field appearance-none bg-[var(--background)] pr-8"
            >
              <option value="training">Training</option>
              <option value="freundschaftsspiel">Freundschaftsspiel</option>
              <option value="punktspiel">Punktspiel</option>
              <option value="platzpflege">Platzpflege</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <svg className="h-4 w-4 opacity-50" fill="none" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* ⏱️ Zeitangaben */}
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium mb-1">
              Startzeit <span className="text-red-500">*</span>
            </label>
            <DatePicker
              selected={startzeit}
              onChange={(date) => {
                if (date) {
                  setStartzeit(date);
                  const hours = date.getHours();
                  const minutes = date.getMinutes();
                  const hatUhrzeit = hours !== 0 || minutes !== 0;

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
              className="form-field bg-[var(--background)]"
              popperPlacement="bottom-start"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Endzeit <span className="text-red-500">*</span>
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
              className="form-field bg-[var(--background)]"
            />
          </div>
        </div>

        {/* 👥 Person & Mannschaft */}
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium mb-1">
              Buchende Person <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={buchendePerson}
              onChange={(e) => setBuchendePerson(e.target.value)}
              placeholder="Name der buchenden Person"
              required
              className="form-field bg-[var(--background)] w-full md:w-auto"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Mannschaft <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={mannschaft}
              onChange={(e) => setMannschaft(e.target.value)}
              placeholder="Mannschaftsname"
              required
              className="form-field bg-[var(--background)] w-full md:w-auto"
            />
          </div>
        </div>

        {/* 📝 Bemerkung */}
        <textarea
          value={bemerkung}
          onChange={(e) => setBemerkung(e.target.value)}
          placeholder="Weitere Informationen (optional)"
          className="form-field bg-[var(--background)] w-full"
          rows={3}
        />

        {/* ✅ Absenden */}
        <div className="flex items-center gap-4 flex-wrap">
          <button
            type="submit"
            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded"
          >
            Buchung speichern
          </button>
          <p className="text-xs text-gray-400">
            <span className="text-red-500">*</span> Pflichtfeld
          </p>
        </div>
      </form>
    </>
  );
}
