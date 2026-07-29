"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { getMannschaftenFuerTenant } from "@/lib/mannschaften";
import { useTenant } from "@/components/tenant/TenantProvider";
import Modal from "@/components/ui/Modal";
import Banner from "@/components/ui/Banner";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

interface MannschaftsAnfrageModalProps {
  // Sichtbarkeit: Modal-Primitive steuert via headlessui Dialog
  open: boolean;
  userId: string;
  typ: "hinzufuegen" | "entfernen";
  // Bei 'entfernen' ist die Mannschaft bereits bekannt
  mannschaftVorausgefuellt?: string;
  // Bereits zugewiesene Mannschaften (für 'hinzufuegen' filtern wir diese heraus)
  bereitsZugewiesen: string[];
  onClose: () => void;
  onErfolg: () => void;
}

export default function MannschaftsAnfrageModal({
  open,
  userId,
  typ,
  mannschaftVorausgefuellt,
  bereitsZugewiesen,
  onClose,
  onErfolg,
}: MannschaftsAnfrageModalProps) {
  const supabase = createClient();
  const tenant = useTenant();

  // Auswahl passend zum Auftritt: auf der JFG-Domain nur A–D-Junioren, beim
  // FCB weiterhin alle Mannschaften (er verwaltet die JFG-Jahrgänge mit).
  // Bei 'entfernen' ist die Mannschaft vorgegeben – dann ist keine Liste nötig.
  const verfuegbareMannschaften =
    typ === "hinzufuegen"
      ? getMannschaftenFuerTenant(tenant.id).filter(
          (m) => !bereitsZugewiesen.includes(m)
        )
      : [];

  const [mannschaft, setMannschaft] = useState(
    mannschaftVorausgefuellt ?? (verfuegbareMannschaften[0] ?? "")
  );
  const [begruendung, setBegruendung] = useState("");
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFehler("");
    setLaden(true);

    const { error } = await supabase.from("mannschaftsanfragen").insert({
      user_id: userId,
      typ,
      mannschaft,
      begruendung: begruendung.trim() || null,
      status: "offen",
    });

    if (error) {
      setFehler("Fehler beim Senden der Anfrage: " + error.message);
      setLaden(false);
    } else {
      onErfolg();
    }
  };

  const typLabel = typ === "hinzufuegen" ? "hinzufügen" : "entfernen";

  return (
    // Modal-Primitive übernimmt Overlay, Fokus-Falle und Escape-Handling
    <Modal open={open} onClose={onClose} title={`Mannschaft ${typLabel} – Anfrage stellen`} size="md">
      <div className="space-y-4">
        {fehler && <Banner variant="error" message={fehler} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mannschafts-Auswahl: bei 'entfernen' oder Einzeloption nur anzeigen */}
          {typ === "entfernen" || verfuegbareMannschaften.length === 0 ? (
            <div className="space-y-1.5">
              <p className="font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted">
                Mannschaft
              </p>
              <p className="rounded-lg border border-fcb-border bg-fcb-bg px-3 py-2.5 font-inter text-sm text-fcb-muted">
                {mannschaft}
              </p>
            </div>
          ) : (
            <Select
              label="Mannschaft"
              value={mannschaft}
              onChange={setMannschaft}
              options={verfuegbareMannschaften.map((m) => ({ value: m, label: m }))}
              required
            />
          )}

          <Textarea
            label="Begründung"
            optional
            value={begruendung}
            onChange={setBegruendung}
            placeholder="z. B. Ich trainiere seit dieser Saison bei dieser Mannschaft."
            rows={3}
          />

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Abbrechen
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={laden || !mannschaft}
            >
              {laden ? "Wird gesendet …" : "Anfrage senden"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
