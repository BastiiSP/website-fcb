"use client";

import { useEffect, useState } from "react";
import { Repeat } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import type { SerienBereich } from "@/components/BearbeitenModal";

// Prop-Interface bleibt vollständig kompatibel mit allen Aufrufern:
// - kalender/page.tsx, BuchungenVerwaltung, MeineBuchungen (Buchungen, ggf. mit Serie)
// - MitgliederVerwaltung.tsx (nutzt: show, onClose, onConfirm, titel, beschreibung)
//   → deren onConfirm ohne Parameter ist zu (bereich) => void zuweisungskompatibel.
interface Props {
  show: boolean;       // Sichtbarkeit des Modals
  onClose: () => void; // Schließen ohne Aktion
  /** Löschen bestätigen; bereich ist nur bei serienWahl relevant (sonst immer "einzeln") */
  onConfirm: (bereich: SerienBereich) => void;
  mannschaft?: string; // Optionaler Buchungs-Kontext (kalender)
  /** true bei Serienterminen: blendet die Auswahl "Nur dieser Termin / Ganze Serie" ein */
  serienWahl?: boolean;
  // Optionale Überschreibungen für Wiederverwendung (z. B. Mitglieder-Löschung)
  titel?: string;
  beschreibung?: string;
}

export default function LoeschenModal({
  show,
  onClose,
  onConfirm,
  mannschaft,
  serienWahl = false,
  titel,
  beschreibung,
}: Props) {
  // Default bewusst "einzeln" – Einzeltermine einer Serie bleiben frei löschbar
  const [bereich, setBereich] = useState<SerienBereich>("einzeln");

  // Bei jedem Öffnen zurücksetzen, damit keine Serie versehentlich
  // mit der Auswahl des vorherigen Dialogs gelöscht wird
  useEffect(() => {
    if (show) setBereich("einzeln");
  }, [show]);

  return (
    <Modal
      open={show}
      onClose={onClose}
      title={titel ?? "Buchung löschen"}
      size="sm"
    >
      {/* Beschreibungstext – Fallback auf Buchungs-Standard wenn kein Override übergeben */}
      <p className="font-inter text-sm text-fcb-muted mb-4">
        {beschreibung ?? (
          <>
            Möchtest du die Buchung für{" "}
            <strong className="text-fcb-text">{mannschaft || "diese Mannschaft"}</strong>{" "}
            wirklich löschen?
          </>
        )}
      </p>

      {/* Bereichswahl nur bei Serienterminen */}
      {serienWahl && (
        <div
          role="radiogroup"
          aria-label="Löschumfang"
          className="mb-6 rounded-lg border border-fcb-border bg-fcb-bg p-3 space-y-2"
        >
          <p className="flex items-center gap-1.5 font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted">
            <Repeat size={14} aria-hidden />
            Teil einer wöchentlichen Serie
          </p>
          <label className="flex items-center gap-2 cursor-pointer font-inter text-sm text-fcb-text">
            <input
              type="radio"
              name="loesch-bereich"
              checked={bereich === "einzeln"}
              onChange={() => setBereich("einzeln")}
              className="h-4 w-4 accent-fcb-blue"
            />
            Nur diesen Termin löschen
          </label>
          <label className="flex items-center gap-2 cursor-pointer font-inter text-sm text-fcb-text">
            <input
              type="radio"
              name="loesch-bereich"
              checked={bereich === "serie"}
              onChange={() => setBereich("serie")}
              className="h-4 w-4 accent-fcb-blue"
            />
            Ganze Serie löschen (alle zukünftigen Termine)
          </label>
        </div>
      )}

      {/* Aktions-Buttons */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose}>
          Abbrechen
        </Button>
        <Button type="button" variant="danger" onClick={() => onConfirm(bereich)}>
          Ja, löschen
        </Button>
      </div>
    </Modal>
  );
}
