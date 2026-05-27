"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseClient";

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

  if (!show) return null;

  const istBearbeiten = initialData !== null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--background)] text-[var(--foreground)] p-6 rounded shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {istBearbeiten ? "✏️ Mitglied bearbeiten" : "➕ Mitglied hinzufügen"}
        </h2>

        {fehler && (
          <p className="text-red-600 text-sm p-3 border border-red-300 rounded bg-red-50 mb-4">
            {fehler}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pflichtfelder */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-sm font-medium mb-1">
                Vorname <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.vorname}
                onChange={(e) => handleChange("vorname", e.target.value)}
                className="form-field"
                required
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-sm font-medium mb-1">
                Nachname <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.nachname}
                onChange={(e) => handleChange("nachname", e.target.value)}
                className="form-field"
                required
              />
            </div>
          </div>

          {/* Kontaktdaten */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-sm font-medium mb-1">E-Mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="form-field"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-sm font-medium mb-1">Telefon</label>
              <input
                type="text"
                value={form.telefonnummer}
                onChange={(e) => handleChange("telefonnummer", e.target.value)}
                className="form-field"
              />
            </div>
          </div>

          {/* Datumsfelder */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-sm font-medium mb-1">
                Geburtsdatum
              </label>
              <input
                type="date"
                value={form.geburtsdatum}
                onChange={(e) => handleChange("geburtsdatum", e.target.value)}
                className="form-field"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-sm font-medium mb-1">
                Eintrittsdatum
              </label>
              <input
                type="date"
                value={form.eintrittsdatum}
                onChange={(e) =>
                  handleChange("eintrittsdatum", e.target.value)
                }
                className="form-field"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) =>
                handleChange(
                  "status",
                  e.target.value as MitgliedFormData["status"]
                )
              }
              className="select-field w-full"
            >
              <option value="aktiv">Aktiv</option>
              <option value="passiv">Passiv</option>
              <option value="ehrenamt">Ehrenamt</option>
              <option value="gekündigt">Gekündigt</option>
            </select>
          </div>

          {/* Mannschaft(en) – kommagetrennte Eingabe für bessere UX */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Mannschaft(en){" "}
              <span className="text-xs opacity-60">(kommagetrennt)</span>
            </label>
            <input
              type="text"
              value={form.mannschaftText}
              onChange={(e) => handleChange("mannschaftText", e.target.value)}
              placeholder="z. B. Herren 1, A-Jugend"
              className="form-field"
            />
          </div>

          {/* Notizen */}
          <div>
            <label className="block text-sm font-medium mb-1">Notizen</label>
            <textarea
              value={form.notizen}
              onChange={(e) => handleChange("notizen", e.target.value)}
              placeholder="Interne Hinweise (optional)"
              rows={3}
              className="form-field"
            />
          </div>

          {/* Aktionen */}
          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-neutral-300 hover:bg-neutral-400 text-[var(--foreground)] font-semibold px-4 py-2 rounded"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={speichert}
              className="bg-[var(--foreground)] hover:opacity-80 text-[var(--background)] font-semibold px-4 py-2 rounded disabled:opacity-50"
            >
              {speichert ? "Wird gespeichert …" : "Speichern"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
