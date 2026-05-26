"use client";

import React, { useState, useEffect } from "react";
import { SupabaseClient } from "@supabase/supabase-js";

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

export default function BearbeitenModal({
  show,
  onClose,
  supabase,
  initialData,
  onSave,
}: Props) {
  // 📦 Lokaler Zustand für das Formular, wird erst gesetzt, wenn initialData vorhanden ist
  const [form, setForm] = useState<Buchung | null>(initialData || null);

  // 🔁 Wenn sich die übergebenen Props ändern, aktualisiere das Formular
  useEffect(() => {
    setForm(initialData || null);
  }, [initialData]);

  // 🖊️ Formularfeldänderungen übernehmen
  const handleChange = (field: keyof Buchung, value: string) => {
    if (!form) return;
    setForm((prev) => ({ ...prev!, [field]: value }));
  };

  // 💾 Speichern der bearbeiteten Daten in Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    const { error } = await supabase
      .from("buchungen")
      .update({
        platz: form.platz,
        platzanteil: form.platzanteil,
        anlass: form.anlass,
        startzeit: new Date(form.startzeit).toISOString(),
        endzeit: new Date(form.endzeit).toISOString(),
        buchende_person: form.buchende_person,
        mannschaft: form.mannschaft,
        bemerkung: form.bemerkung,
      })
      .eq("id", form.id);

    if (!error) {
      onSave();
      onClose();
    } else {
      console.error("Fehler beim Speichern:", error);
      alert("Fehler beim Speichern!");
    }
  };

  // ⛔ Modal wird nur angezeigt, wenn es aktiv ist und gültige Daten geladen sind
  if (!show || !form) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[var(--background)] text-[var(--foreground)] p-6 rounded shadow-lg w-full max-w-xl">
        <h2 className="text-xl font-bold mb-4">✏️ Buchung bearbeiten</h2>

        {/* 🧾 Bearbeitungsformular */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 🏟️ Platzwahl, Platzanteil, Anlass */}
          <div className="flex gap-4 flex-wrap">
            <select
              value={form.platz}
              onChange={(e) => handleChange("platz", e.target.value)}
              className="border p-2 rounded text-[var(--foreground)]"
            >
              <option value="hauptplatz">Hauptplatz</option>
              <option value="nebenplatz">Nebenplatz</option>
            </select>

            <select
              value={form.platzanteil}
              onChange={(e) => handleChange("platzanteil", e.target.value)}
              className="border p-2 rounded text-[var(--foreground)]"
            >
              <option value="viertel">1/4 Platz</option>
              <option value="halb">1/2 Platz</option>
              <option value="ganz">Ganzer Platz</option>
            </select>

            <select
              value={form.anlass}
              onChange={(e) => handleChange("anlass", e.target.value)}
              className="border p-2 rounded text-[var(--foreground)]"
            >
              <option value="training">Training</option>
              <option value="freundschaftsspiel">Freundschaftsspiel</option>
              <option value="punktspiel">Punktspiel</option>
              <option value="platzpflege">Platzpflege</option>
            </select>
          </div>

          {/* 🕓 Start- und Endzeit */}
          <div className="flex gap-4 flex-wrap">
            <input
              type="datetime-local"
              value={form.startzeit.slice(0, 16)}
              onChange={(e) => handleChange("startzeit", e.target.value)}
              className="border p-2 rounded text-[var(--foreground)]"
            />
            <input
              type="datetime-local"
              value={form.endzeit.slice(0, 16)}
              onChange={(e) => handleChange("endzeit", e.target.value)}
              className="border p-2 rounded text-[var(--foreground)]"
            />
          </div>

          {/* 👤 Name & Mannschaft */}
          <div className="flex gap-4 flex-wrap">
            <input
              type="text"
              value={form.buchende_person}
              onChange={(e) => handleChange("buchende_person", e.target.value)}
              placeholder="Name"
              className="form-field md:w-auto"
            />
            <input
              type="text"
              value={form.mannschaft}
              onChange={(e) => handleChange("mannschaft", e.target.value)}
              placeholder="Mannschaft"
              className="form-field md:w-auto"
            />
          </div>

          {/* 📝 Optional: Bemerkung */}
          <textarea
            value={form.bemerkung || ""}
            onChange={(e) => handleChange("bemerkung", e.target.value)}
            placeholder="Weitere Infos (optional)"
            className="form-field md:w-auto"
          />

          {/* ✅ Aktionen */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="bg-gray-300 hover:bg-gray-400 text-[var(--foreground)] px-4 py-2 rounded"
            >
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
