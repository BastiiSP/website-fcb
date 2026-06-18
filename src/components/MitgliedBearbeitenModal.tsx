"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseClient";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";

// Typdefinition für ein Vereinsmitglied – spiegelt das DB-Schema der mitglieder-Tabelle
export type Mitglied = {
  id: string;
  mitgliedsnummer: number;
  vorname: string;
  nachname: string;
  email: string | null;
  telefonnummer: string | null;
  geburtsdatum: string | null;
  eintrittsdatum: string | null;
  status: "aktiv" | "passiv" | "ehrenamt" | "gekündigt";
  mannschaft: string[] | null;
  notizen: string | null;
  erstellt_von: string | null;
  created_at: string;
  updated_at: string;
};

// Formular-State ist losgelöst vom vollen Mitglied-Typ (keine Auto-Felder, kein mitgliedsnummer-Input)
type MitgliedFormData = {
  vorname: string;
  nachname: string;
  email: string;
  telefonnummer: string;
  geburtsdatum: string;
  eintrittsdatum: string;
  status: "aktiv" | "passiv" | "ehrenamt" | "gekündigt";
  mannschaftText: string; // Kommagetrennte Eingabe, wird beim Speichern in TEXT[] konvertiert
  notizen: string;
};

const LEERES_FORMULAR: MitgliedFormData = {
  vorname: "",
  nachname: "",
  email: "",
  telefonnummer: "",
  geburtsdatum: "",
  eintrittsdatum: "",
  status: "aktiv",
  mannschaftText: "",
  notizen: "",
};

// Status-Optionen für das Select-Primitive
const STATUS_SELECT_OPTIONEN = [
  { value: "aktiv", label: "Aktiv" },
  { value: "passiv", label: "Passiv" },
  { value: "ehrenamt", label: "Ehrenamt" },
  { value: "gekündigt", label: "Gekündigt" },
];

type Props = {
  show: boolean;
  onClose: () => void;
  supabase: ReturnType<typeof createClient>;
  initialData: Mitglied | null; // null = Hinzufügen-Modus, Objekt = Bearbeiten-Modus
  onSave: () => void;
  eigeneUserId: string; // wird beim INSERT als erstellt_von gesetzt
};

export default function MitgliedBearbeitenModal({
  show,
  onClose,
  supabase,
  initialData,
  onSave,
  eigeneUserId,
}: Props) {
  const [form, setForm] = useState<MitgliedFormData>(LEERES_FORMULAR);
  const [fehler, setFehler] = useState("");
  const [speichert, setSpeichert] = useState(false);

  // Formular befüllen wenn Modal geöffnet wird – leeren bei Hinzufügen-Modus
  useEffect(() => {
    if (!show) return;
    if (initialData) {
      setForm({
        vorname: initialData.vorname,
        nachname: initialData.nachname,
        email: initialData.email ?? "",
        telefonnummer: initialData.telefonnummer ?? "",
        geburtsdatum: initialData.geburtsdatum ?? "",
        eintrittsdatum: initialData.eintrittsdatum ?? "",
        status: initialData.status,
        mannschaftText: initialData.mannschaft?.join(", ") ?? "",
        notizen: initialData.notizen ?? "",
      });
    } else {
      setForm(LEERES_FORMULAR);
    }
    setFehler("");
  }, [show, initialData]);

  const handleChange = (
    field: keyof MitgliedFormData,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vorname.trim() || !form.nachname.trim()) {
      setFehler("Vorname und Nachname sind Pflichtfelder.");
      return;
    }

    setSpeichert(true);
    setFehler("");

    // Kommagetrennte Mannschaftsliste → getrimmtes Array (leere Strings herausfiltern)
    const mannschaftArray = form.mannschaftText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload = {
      vorname: form.vorname.trim(),
      nachname: form.nachname.trim(),
      email: form.email.trim() || null,
      telefonnummer: form.telefonnummer.trim() || null,
      geburtsdatum: form.geburtsdatum || null,
      eintrittsdatum: form.eintrittsdatum || null,
      status: form.status,
      mannschaft: mannschaftArray.length > 0 ? mannschaftArray : null,
      notizen: form.notizen.trim() || null,
    };

    let error;

    if (initialData) {
      // UPDATE – bestehenden Datensatz aktualisieren
      ({ error } = await supabase
        .from("mitglieder")
        .update(payload)
        .eq("id", initialData.id));
    } else {
      // INSERT – neues Mitglied anlegen und erstellt_von mit dem aktuellen User befüllen
      ({ error } = await supabase
        .from("mitglieder")
        .insert({ ...payload, erstellt_von: eigeneUserId }));
    }

    setSpeichert(false);

    if (error) {
      setFehler("Fehler beim Speichern: " + error.message);
    } else {
      onSave();
      onClose();
    }
  };

  const istBearbeiten = initialData !== null;

  return (
    <Modal
      open={show}
      onClose={onClose}
      title={istBearbeiten ? "Mitglied bearbeiten" : "Mitglied hinzufügen"}
      size="lg"
    >
      {fehler && (
        <p className="font-inter text-sm text-fcb-red p-3 border border-fcb-red/40 rounded-lg bg-fcb-red/10 mb-4">
          {fehler}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Pflichtfelder */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[140px]">
            <TextField
              label="Vorname"
              value={form.vorname}
              onChange={(v) => handleChange("vorname", v)}
              required
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <TextField
              label="Nachname"
              value={form.nachname}
              onChange={(v) => handleChange("nachname", v)}
              required
            />
          </div>
        </div>

        {/* Kontaktdaten */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[140px]">
            <TextField
              label="E-Mail"
              type="email"
              value={form.email}
              onChange={(v) => handleChange("email", v)}
              optional
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <TextField
              label="Telefon"
              value={form.telefonnummer}
              onChange={(v) => handleChange("telefonnummer", v)}
              optional
            />
          </div>
        </div>

        {/* Datumsfelder */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[140px]">
            <TextField
              label="Geburtsdatum"
              type="date"
              value={form.geburtsdatum}
              onChange={(v) => handleChange("geburtsdatum", v)}
              optional
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <TextField
              label="Eintrittsdatum"
              type="date"
              value={form.eintrittsdatum}
              onChange={(v) => handleChange("eintrittsdatum", v)}
              optional
            />
          </div>
        </div>

        {/* Status */}
        <Select
          label="Status"
          value={form.status}
          onChange={(v) => handleChange("status", v as MitgliedFormData["status"])}
          options={STATUS_SELECT_OPTIONEN}
          required
        />

        {/* Mannschaft(en) – kommagetrennte Eingabe für bessere UX als Freitext */}
        <TextField
          label="Mannschaft(en) – kommagetrennt"
          value={form.mannschaftText}
          onChange={(v) => handleChange("mannschaftText", v)}
          placeholder="z. B. Herren 1, A-Jugend"
          optional
        />

        {/* Notizen */}
        <Textarea
          label="Notizen"
          value={form.notizen}
          onChange={(v) => handleChange("notizen", v)}
          placeholder="Interne Hinweise (optional)"
          rows={3}
          optional
        />

        {/* Aktionen */}
        <div className="flex justify-between pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Abbrechen
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={speichert}
          >
            {speichert ? "Wird gespeichert …" : "Speichern"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
