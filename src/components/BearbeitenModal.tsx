"use client";

import React, { useState, useEffect } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import TextField from "@/components/ui/TextField";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import Banner from "@/components/ui/Banner";

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
};

type Props = {
  show: boolean;
  onClose: () => void;
  supabase: SupabaseClient;
  initialData: Buchung | null;
  onSave: () => void;
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

  // Wenn sich die übergebenen Props ändern, Formular aktualisieren
  useEffect(() => {
    setForm(initialData || null);
    setFehler("");
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
