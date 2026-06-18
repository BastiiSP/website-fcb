"use client";

import React from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

// Prop-Interface bleibt vollständig kompatibel mit beiden Aufrufern:
// - kalender/page.tsx (nutzt: show, onClose, onConfirm, mannschaft)
// - MitgliederVerwaltung.tsx (nutzt: show, onClose, onConfirm, titel, beschreibung)
interface Props {
  show: boolean;       // Sichtbarkeit des Modals
  onClose: () => void; // Schließen ohne Aktion
  onConfirm: () => void; // Löschen bestätigen
  mannschaft?: string; // Optionaler Buchungs-Kontext (kalender)
  // Optionale Überschreibungen für Wiederverwendung (z. B. Mitglieder-Löschung)
  titel?: string;
  beschreibung?: string;
}

export default function LoeschenModal({
  show,
  onClose,
  onConfirm,
  mannschaft,
  titel,
  beschreibung,
}: Props) {
  return (
    <Modal
      open={show}
      onClose={onClose}
      title={titel ?? "Buchung löschen"}
      size="sm"
    >
      {/* Beschreibungstext – Fallback auf Buchungs-Standard wenn kein Override übergeben */}
      <p className="font-inter text-sm text-fcb-muted mb-6">
        {beschreibung ?? (
          <>
            Möchtest du die Buchung für{" "}
            <strong className="text-fcb-text">{mannschaft || "diese Mannschaft"}</strong>{" "}
            wirklich löschen?
          </>
        )}
      </p>

      {/* Aktions-Buttons */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose}>
          Abbrechen
        </Button>
        <Button type="button" variant="danger" onClick={onConfirm}>
          Ja, löschen
        </Button>
      </div>
    </Modal>
  );
}
