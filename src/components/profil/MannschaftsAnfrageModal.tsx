"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { MANNSCHAFTEN } from "@/lib/mannschaften";

interface MannschaftsAnfrageModalProps {
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
  userId,
  typ,
  mannschaftVorausgefuellt,
  bereitsZugewiesen,
  onClose,
  onErfolg,
}: MannschaftsAnfrageModalProps) {
  const supabase = createClient();

  const verfuegbareMannschaften =
    typ === "hinzufuegen"
      ? MANNSCHAFTEN.filter((m) => !bereitsZugewiesen.includes(m))
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--background)] text-[var(--foreground)] rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-semibold">
          Mannschaft {typLabel} – Anfrage stellen
        </h2>

        {fehler && (
          <p className="text-red-600 text-sm p-3 border border-red-300 rounded bg-red-50">
            {fehler}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mannschaft</label>
            {typ === "entfernen" || verfuegbareMannschaften.length === 0 ? (
              <p className="form-field opacity-70 cursor-not-allowed">{mannschaft}</p>
            ) : (
              <select
                value={mannschaft}
                onChange={(e) => setMannschaft(e.target.value)}
                required
                className="select-field w-full"
              >
                {verfuegbareMannschaften.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Begründung (optional)
            </label>
            <textarea
              value={begruendung}
              onChange={(e) => setBegruendung(e.target.value)}
              placeholder="z. B. Ich trainiere seit dieser Saison bei dieser Mannschaft."
              rows={3}
              className="form-field resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:opacity-70 transition"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={laden || !mannschaft}
              className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded hover:opacity-80 transition disabled:opacity-50"
            >
              {laden ? "Wird gesendet …" : "Anfrage senden"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
