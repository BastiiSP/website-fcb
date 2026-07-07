"use client";

import React, { useState, useEffect } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { Repeat } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import TextField from "@/components/ui/TextField";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import Banner from "@/components/ui/Banner";
import { aktualisiereSerie } from "@/lib/serienbuchung";

export type Buchung = {
  id: string;
  platz: string;
  platzanteil: string;
  anlass: string;
  startzeit: string;
  endzeit: string;
  buchende_person: string;
  mannschaft: string;
  bemerkung?: string;
  user_id: string;
  /** Gemeinsame ID aller Termine einer wöchentlichen Serie; null/undefined = Einzelbuchung */
  serien_id?: string | null;
};

/**
 * Bearbeitungs-/Lösch-Umfang bei Serienterminen (Outlook-Semantik, relativ
 * zum AUSGEWÄHLTEN Termin – nicht zu "jetzt"):
 * einzeln = nur dieser Termin, abDiesem = dieser + alle folgenden,
 * alle = jeder Termin der Serie (auch vergangene).
 */
export type SerienBereich = "einzeln" | "abDiesem" | "alle";

type Props = {
  show: boolean;
  onClose: () => void;
  supabase: SupabaseClient;
  initialData: Buchung | null;
  /** meldung: optionaler Erfolgstext (z. B. Serien-Zusammenfassung) für den Toast des Aufrufers */
  onSave: (meldung?: string) => void;
};

// Optionslisten für die Auswahl-Felder
const PLATZ_OPTIONEN = [
  { value: "hauptplatz", label: "Hauptplatz" },
  { value: "nebenplatz", label: "Nebenplatz" },
];

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

export default function BearbeitenModal({
  show,
  onClose,
  supabase,
  initialData,
  onSave,
}: Props) {
  // Lokaler Zustand für das Formular, wird erst gesetzt wenn initialData vorhanden
  const [form, setForm] = useState<Buchung | null>(initialData || null);

  // Fehlermeldung im Modal (z. B. Belegungskonflikt) – ersetzt das frühere alert()
  const [fehler, setFehler] = useState("");

  // Bei Serienterminen wählbar: nur diese Instanz oder alle zukünftigen Termine.
  // Default bewusst "einzeln" – Einzeltermine einer Serie bleiben frei anpassbar.
  const [bereich, setBereich] = useState<SerienBereich>("einzeln");

  // Wenn sich die übergebenen Props ändern, Formular aktualisieren
  useEffect(() => {
    setForm(initialData || null);
    setFehler("");
    setBereich("einzeln");
  }, [initialData]);

  // Formularfeldänderungen übernehmen
  const handleChange = (field: keyof Buchung, value: string) => {
    if (!form) return;
    setForm((prev) => ({ ...prev!, [field]: value }));
  };

  // Speichern der bearbeiteten Daten in Supabase – vorher Belegungsprüfung,
  // damit das Bearbeiten die Kollisionslogik des Buchungsformulars nicht umgeht.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    const startISO = new Date(form.startzeit).toISOString();
    const endISO = new Date(form.endzeit).toISOString();

    if (new Date(endISO) <= new Date(startISO)) {
      setFehler("Die Endzeit muss nach der Startzeit liegen.");
      return;
    }

    // Serien-Pfad: Änderung auf die gewählten Termine der Serie übertragen
    // (dieser + folgende oder alle). Die Belegungsprüfung läuft dort pro
    // Termin – Konflikte werden übersprungen.
    if (bereich !== "einzeln" && form.serien_id && initialData) {
      try {
        const serienErgebnis = await aktualisiereSerie(
          {
            serienId: form.serien_id,
            alteStartzeit: new Date(initialData.startzeit).toISOString(),
            alteEndzeit: new Date(initialData.endzeit).toISOString(),
            neueStartzeit: startISO,
            neueEndzeit: endISO,
            // Pivot ist der ausgewählte Termin, nicht "jetzt": bei "abDiesem"
            // bleiben frühere Termine der Serie unangetastet.
            abStartzeitISO:
              bereich === "abDiesem"
                ? new Date(initialData.startzeit).toISOString()
                : null,
            felder: {
              platz: form.platz,
              platzanteil: form.platzanteil,
              anlass: form.anlass,
              mannschaft: form.mannschaft,
              buchende_person: form.buchende_person,
              bemerkung: form.bemerkung ?? null,
            },
          },
          supabase
        );

        const anzahl = serienErgebnis.aktualisiert.length;
        let meldung = `${
          bereich === "abDiesem" ? "Serie ab diesem Termin" : "Ganze Serie"
        } aktualisiert: ${anzahl} Termin${anzahl !== 1 ? "e" : ""} angepasst`;
        if (serienErgebnis.uebersprungen.length > 0) {
          meldung += `, ${serienErgebnis.uebersprungen.length} übersprungen (z. B. Platz belegt)`;
        }
        meldung += ".";

        setFehler("");
        onSave(meldung);
        onClose();
      } catch (e) {
        setFehler(
          e instanceof Error ? e.message : "Fehler beim Aktualisieren der Serie."
        );
      }
      return;
    }

    // Belegungsprüfung – gleiches Muster wie Buchungsformular/Kalender,
    // die eigene Buchung wird dabei ausgeschlossen.
    const { data: existing, error: fetchError } = await supabase
      .from("buchungen")
      .select("startzeit, endzeit, platzanteil")
      .eq("platz", form.platz)
      .neq("id", form.id)
      .gte("endzeit", startISO)
      .lte("startzeit", endISO);

    if (fetchError) {
      setFehler("Fehler bei der Überprüfung der Platzbelegung.");
      return;
    }

    const anteilWerte: Record<string, number> = {
      viertel: 0.25,
      halb: 0.5,
      ganz: 1,
    };

    let belegung = 0;
    for (const buchung of existing || []) {
      const startB = new Date(buchung.startzeit).getTime();
      const endB = new Date(buchung.endzeit).getTime();
      const startN = new Date(startISO).getTime();
      const endN = new Date(endISO).getTime();

      if (startN < endB && endN > startB) {
        belegung += anteilWerte[buchung.platzanteil] || 0;
      }
    }

    if (belegung + (anteilWerte[form.platzanteil] || 0) > 1) {
      setFehler("Der Platz ist zu diesem Zeitpunkt bereits belegt.");
      return;
    }

    const { error } = await supabase
      .from("buchungen")
      .update({
        platz: form.platz,
        platzanteil: form.platzanteil,
        anlass: form.anlass,
        startzeit: startISO,
        endzeit: endISO,
        buchende_person: form.buchende_person,
        mannschaft: form.mannschaft,
        bemerkung: form.bemerkung,
      })
      .eq("id", form.id);

    if (!error) {
      setFehler("");
      onSave();
      onClose();
    } else {
      console.error("Fehler beim Speichern:", error);
      setFehler("Fehler beim Speichern. Bitte versuche es erneut.");
    }
  };

  return (
    <Modal open={show} onClose={onClose} title="Buchung bearbeiten" size="md">
      {/* Formular nur rendern, wenn Daten geladen sind. Das Modal selbst bleibt
          gemountet (open={show}), damit headlessui die Schließen-Animation
          abspielen kann – ein vorzeitiges `return null` würde sie überspringen. */}
      {form ? (
        <form onSubmit={handleSubmit} className="space-y-4">
        {/* Fehlermeldung (z. B. Belegungskonflikt) direkt im Modal */}
        {fehler && <Banner variant="error" message={fehler} />}

        {/* Bereichswahl nur bei Serienterminen: Einzeltermin bleibt der Default */}
        {form.serien_id && (
          <div
            role="radiogroup"
            aria-label="Bearbeitungsumfang"
            className="rounded-lg border border-fcb-border bg-fcb-bg p-3 space-y-2"
          >
            <p className="flex items-center gap-1.5 font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted">
              <Repeat size={14} aria-hidden />
              Teil einer wöchentlichen Serie
            </p>
            <label className="flex items-center gap-2 cursor-pointer font-inter text-sm text-fcb-text">
              <input
                type="radio"
                name="serien-bereich"
                checked={bereich === "einzeln"}
                onChange={() => setBereich("einzeln")}
                className="h-4 w-4 accent-fcb-blue"
              />
              Nur diesen Termin bearbeiten
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-inter text-sm text-fcb-text">
              <input
                type="radio"
                name="serien-bereich"
                checked={bereich === "abDiesem"}
                onChange={() => setBereich("abDiesem")}
                className="h-4 w-4 accent-fcb-blue"
              />
              Diesen und alle folgenden Termine bearbeiten
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-inter text-sm text-fcb-text">
              <input
                type="radio"
                name="serien-bereich"
                checked={bereich === "alle"}
                onChange={() => setBereich("alle")}
                className="h-4 w-4 accent-fcb-blue"
              />
              Alle Termine der Serie bearbeiten (auch vergangene)
            </label>
            {bereich !== "einzeln" && (
              <p className="font-inter text-xs text-fcb-muted">
                Die Zeitverschiebung und alle Feldänderungen werden auf{" "}
                {bereich === "abDiesem"
                  ? "diesen und alle folgenden Termine"
                  : "sämtliche Termine der Serie"}{" "}
                übertragen. Termine mit Belegungskonflikt bleiben unverändert.
              </p>
            )}
          </div>
        )}

        {/* Platz, Platzanteil, Anlass */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[140px]">
            <Select
              label="Platz"
              value={form.platz}
              onChange={(v) => handleChange("platz", v)}
              options={PLATZ_OPTIONEN}
            />
          </div>

          <div className="flex-1 min-w-[140px]">
            <Select
              label="Platzanteil"
              value={form.platzanteil}
              onChange={(v) => handleChange("platzanteil", v)}
              options={PLATZANTEIL_OPTIONEN}
            />
          </div>

          <div className="flex-1 min-w-[140px]">
            <Select
              label="Anlass"
              value={form.anlass}
              onChange={(v) => handleChange("anlass", v)}
              options={ANLASS_OPTIONEN}
            />
          </div>
        </div>

        {/* Start- und Endzeit – native datetime-local Felder (Bearbeitungsformular
            nutzt String-Werte aus Supabase ISO-Timestamps, nicht react-datepicker) */}
        <div className="flex gap-4 flex-wrap">
          <div className="space-y-1.5 flex-1 min-w-[180px]">
            <label className="block font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted">
              Startzeit
            </label>
            <input
              type="datetime-local"
              value={form.startzeit.slice(0, 16)}
              onChange={(e) => handleChange("startzeit", e.target.value)}
              className="w-full rounded-lg border border-fcb-border bg-fcb-bg px-3 py-2.5 font-inter text-sm text-fcb-text focus:border-fcb-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue/40"
            />
          </div>
          <div className="space-y-1.5 flex-1 min-w-[180px]">
            <label className="block font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted">
              Endzeit
            </label>
            <input
              type="datetime-local"
              value={form.endzeit.slice(0, 16)}
              onChange={(e) => handleChange("endzeit", e.target.value)}
              className="w-full rounded-lg border border-fcb-border bg-fcb-bg px-3 py-2.5 font-inter text-sm text-fcb-text focus:border-fcb-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue/40"
            />
          </div>
        </div>

        {/* Buchende Person und Mannschaft */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[180px]">
            <TextField
              label="Buchende Person"
              value={form.buchende_person}
              onChange={(v) => handleChange("buchende_person", v)}
              placeholder="Name"
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <TextField
              label="Mannschaft"
              value={form.mannschaft}
              onChange={(v) => handleChange("mannschaft", v)}
              placeholder="Mannschaft"
            />
          </div>
        </div>

        {/* Optionale Bemerkung */}
        <Textarea
          label="Bemerkung"
          value={form.bemerkung || ""}
          onChange={(v) => handleChange("bemerkung", v)}
          placeholder="Weitere Infos (optional)"
          optional
        />

        {/* Aktionen */}
        <div className="flex justify-between pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="submit" variant="primary">
            Speichern
          </Button>
        </div>
        </form>
      ) : null}
    </Modal>
  );
}
