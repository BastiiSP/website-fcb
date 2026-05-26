"use client";

import React from "react";

// 🔧 Komponenteneigenschaften (Props) definieren
interface Props {
  show: boolean; // Gibt an, ob das Modal angezeigt werden soll
  onClose: () => void; // Funktion zum Schließen des Modals
  onConfirm: () => void; // Funktion, die beim Bestätigen des Löschens ausgeführt wird
  mannschaft?: string; // Optional: Name der betroffenen Mannschaft (für Buchungen)
  // Optionale Überschreibungen – ermöglichen Wiederverwendung z. B. für Mitglieder-Löschung
  titel?: string; // Ersetzt den Standard-Titel "🗑️ Buchung löschen"
  beschreibung?: string; // Ersetzt den Standard-Beschreibungstext
}

// 🧩 Hauptkomponente für das Löschbestätigungs-Modal
export default function LoeschenModal({
  show,
  onClose,
  onConfirm,
  mannschaft,
  titel,
  beschreibung,
}: Props) {
  // 👉 Wenn `show` false ist, wird das Modal nicht gerendert
  if (!show) return null;

  return (
    // 🔲 Halbtransparenter Overlay-Hintergrund
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      {/* 📦 Modal-Box mit einheitlichem Design für Light-/Dark-Mode */}
      <div className="bg-[var(--background)] text-[var(--foreground)] p-6 rounded shadow-lg max-w-md w-full animate-fade-in">
        {/* Titel – kann via Prop überschrieben werden (z. B. für Mitglieder-Löschung) */}
        <h2 className="text-xl font-semibold mb-4">
          {titel ?? "🗑️ Buchung löschen"}
        </h2>

        {/* Beschreibung – Fallback auf Buchungs-Standard, wenn kein Override übergeben */}
        <p className="mb-4">
          {beschreibung ?? (
            <>
              Möchtest du die Buchung für{" "}
              <strong>{mannschaft || "diese Mannschaft"}</strong> wirklich löschen?
            </>
          )}
        </p>

        {/* 🔘 Aktions-Buttons */}
        <div className="flex justify-end gap-3">
          {/* ➖ Abbrechen-Button mit neutralem Hintergrund */}
          <button
            onClick={onClose}
            className="bg-neutral-300 hover:bg-neutral-400 text-[var(--foreground)] font-semibold px-4 py-2 rounded"
          >
            Abbrechen
          </button>

          {/* ❌ Löschbestätigung-Button mit rotem Design */}
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded"
          >
            Ja, löschen
          </button>
        </div>
      </div>
    </div>
  );
}
