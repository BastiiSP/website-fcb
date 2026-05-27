"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabaseClient";
import { FiEdit2, FiTrash2, FiDownload } from "react-icons/fi";
import LoeschenModal from "@/components/LoeschenModal";
import MitgliedBearbeitenModal, {
  type Mitglied,
} from "@/components/MitgliedBearbeitenModal";

interface Props {
  eigeneUserId: string;
}

// Status-Werte als Konstante – müssen mit dem DB-CHECK-Constraint übereinstimmen
const STATUS_OPTIONEN = ["aktiv", "passiv", "ehrenamt", "gekündigt"] as const;

export default function MitgliederVerwaltung({ eigeneUserId }: Props) {
  const supabase = createClient();

  const [mitglieder, setMitglieder] = useState<Mitglied[]>([]);
  const [laden, setLaden] = useState(true);
  const [fehler, setFehler] = useState("");
  const [erfolg, setErfolg] = useState("");

  // Filter- und Suchfelder
  const [suche, setSuche] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMannschaft, setFilterMannschaft] = useState("");

  // Modal-Zustände
  const [bearbeitenMitglied, setBearbeitenMitglied] =
    useState<Mitglied | null>(null);
  const [hinzufuegenOffen, setHinzufuegenOffen] = useState(false);
  const [loeschenMitglied, setLoeschenMitglied] = useState<Mitglied | null>(
    null
  );

  useEffect(() => {
    ladeMitglieder();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Erfolgsmeldung nach 3 Sekunden automatisch ausblenden
  useEffect(() => {
    if (!erfolg) return;
    const t = setTimeout(() => setErfolg(""), 3000);
    return () => clearTimeout(t);
  }, [erfolg]);

  const ladeMitglieder = async () => {
    setLaden(true);
    // RLS stellt sicher, dass nur vorstand/admin diese Daten sehen können
    const { data, error } = await supabase
      .from("mitglieder")
      .select("*")
      .order("nachname");

    if (error) {
      setFehler("Fehler beim Laden der Mitglieder: " + error.message);
    } else {
      setMitglieder((data as Mitglied[]) ?? []);
    }
    setLaden(false);
  };

  const loeschenBestaetigen = async () => {
    if (!loeschenMitglied) return;

    const { error } = await supabase
      .from("mitglieder")
      .delete()
      .eq("id", loeschenMitglied.id);

    if (error) {
      setFehler("Fehler beim Löschen: " + error.message);
    } else {
      setErfolg(
        `${loeschenMitglied.vorname} ${loeschenMitglied.nachname} wurde gelöscht.`
      );
      ladeMitglieder();
    }
    setLoeschenMitglied(null);
  };

  // Alle einzigartigen Mannschaften aus den Daten – für den Mannschafts-Filter
  const alleMannschaften = useMemo(() => {
    const set = new Set<string>();
    mitglieder.forEach((m) => m.mannschaft?.forEach((ms) => set.add(ms)));
    return Array.from(set).sort();
  }, [mitglieder]);

  // Client-seitige Filterung: Suche über Name + E-Mail, plus Status- und Mannschaftsfilter
  const gefiltert = useMemo(() => {
    const suchLower = suche.toLowerCase();
    return mitglieder.filter((m) => {
      const trefferSuche =
        !suche ||
        `${m.vorname} ${m.nachname}`.toLowerCase().includes(suchLower) ||
        (m.email ?? "").toLowerCase().includes(suchLower);
      const trefferStatus = !filterStatus || m.status === filterStatus;
      const trefferMannschaft =
        !filterMannschaft ||
        (m.mannschaft ?? []).includes(filterMannschaft);
      return trefferSuche && trefferStatus && trefferMannschaft;
    });
  }, [mitglieder, suche, filterStatus, filterMannschaft]);

  // CSV-Export: UTF-8 BOM (﻿) für korrekte Umlaut-Anzeige in Excel
  const csvExportieren = () => {
    const kopfzeile = [
      "Mitgliedsnummer",
      "Vorname",
      "Nachname",
      "E-Mail",
      "Telefon",
      "Geburtsdatum",
      "Eintrittsdatum",
      "Status",
      "Mannschaft(en)",
      "Notizen",
    ];

    const zeilen = mitglieder.map((m) => [
      m.mitgliedsnummer,
      m.vorname,
      m.nachname,
      m.email ?? "",
      m.telefonnummer ?? "",
      m.geburtsdatum ?? "",
      m.eintrittsdatum ?? "",
      m.status,
      m.mannschaft?.join("; ") ?? "",
      m.notizen ?? "",
    ]);

    // Jede Zelle in Anführungszeichen – schützt vor Kommas und Zeilenumbrüchen in Feldern
    const csvInhalt = [kopfzeile, ...zeilen]
      .map((zeile) =>
        zeile
          .map((zelle) => `"${String(zelle).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const dateiname = `mitglieder_${new Date().toISOString().slice(0, 10)}.csv`;
    const blob = new Blob(["﻿" + csvInhalt], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = dateiname;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (laden) {
    return (
      <p className="text-center opacity-70 mt-8">Lade Mitgliederliste …</p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rückmeldungen */}
      {fehler && (
        <p className="text-red-600 text-sm p-3 border border-red-300 rounded bg-red-50">
          {fehler}
        </p>
      )}
      {erfolg && (
        <p className="text-green-700 text-sm p-3 border border-green-300 rounded bg-green-50">
          {erfolg}
        </p>
      )}

      {/* Aktionsleiste: Suche + Filter + Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Name oder E-Mail suchen …"
          value={suche}
          onChange={(e) => setSuche(e.target.value)}
          className="form-field sm:flex-1"
        />

        {/* Wrapper mit relativem Positioning, damit der manuelle Pfeil korrekt sitzt.
            appearance-none entfernt den Browser-eigenen Pfeil (inkl. @tailwindcss/forms).
            Das SVG ist pointer-events-none, damit Klicks auf den Select durchgehen. */}
        <div className="relative sm:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-field w-full appearance-none pr-8"
          >
            <option value="">Alle Status</option>
            {STATUS_OPTIONEN.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <svg className="h-4 w-4 opacity-50" fill="none" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {alleMannschaften.length > 0 && (
          <div className="relative sm:w-auto">
            <select
              value={filterMannschaft}
              onChange={(e) => setFilterMannschaft(e.target.value)}
              className="form-field w-full appearance-none pr-8"
            >
              <option value="">Alle Mannschaften</option>
              {alleMannschaften.map((ms) => (
                <option key={ms} value={ms}>
                  {ms}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <svg className="h-4 w-4 opacity-50" fill="none" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        )}

        <button
          onClick={() => setHinzufuegenOffen(true)}
          className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded font-semibold hover:opacity-80 transition whitespace-nowrap"
        >
          + Mitglied hinzufügen
        </button>

        <button
          onClick={csvExportieren}
          className="px-4 py-2 border border-[var(--foreground)] rounded font-semibold hover:bg-[var(--foreground)]/10 transition flex items-center gap-2 whitespace-nowrap"
          title="Alle Mitglieder als CSV exportieren"
        >
          <FiDownload className="w-4 h-4" />
          Als CSV exportieren
        </button>
      </div>

      {/* Ergebniszähler */}
      <p className="text-sm opacity-60">
        {gefiltert.length} von {mitglieder.length} Mitglieder
        {mitglieder.length !== 1 ? "n" : ""}
      </p>

      {/* Tabelle */}
      {gefiltert.length === 0 ? (
        <p className="text-center italic opacity-60 mt-6">
          Keine Mitglieder gefunden.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--foreground)]/20 text-left">
                <th className="py-2 pr-4 font-semibold">Nr.</th>
                <th className="py-2 pr-4 font-semibold">Name</th>
                <th className="py-2 pr-4 font-semibold hidden sm:table-cell">
                  E-Mail
                </th>
                <th className="py-2 pr-4 font-semibold hidden md:table-cell">
                  Status
                </th>
                <th className="py-2 pr-4 font-semibold hidden lg:table-cell">
                  Mannschaft(en)
                </th>
                <th className="py-2 font-semibold text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {gefiltert.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-[var(--foreground)]/10 hover:bg-[var(--foreground)]/5 transition-colors"
                >
                  <td className="py-2 pr-4 opacity-60">{m.mitgliedsnummer}</td>
                  <td className="py-2 pr-4 font-medium">
                    {m.nachname}, {m.vorname}
                  </td>
                  <td className="py-2 pr-4 hidden sm:table-cell opacity-80">
                    {m.email ?? "–"}
                  </td>
                  <td className="py-2 pr-4 hidden md:table-cell">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        m.status === "aktiv"
                          ? "bg-green-100 text-green-800"
                          : m.status === "gekündigt"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="py-2 pr-4 hidden lg:table-cell opacity-80">
                    {m.mannschaft?.join(", ") ?? "–"}
                  </td>
                  <td className="py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setBearbeitenMitglied(m)}
                        className="p-1.5 rounded hover:bg-[var(--foreground)]/10 transition"
                        title="Bearbeiten"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setLoeschenMitglied(m)}
                        className="p-1.5 rounded hover:bg-red-100 text-red-600 transition"
                        title="Löschen"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Hinzufügen */}
      <MitgliedBearbeitenModal
        show={hinzufuegenOffen}
        onClose={() => setHinzufuegenOffen(false)}
        supabase={supabase}
        initialData={null}
        onSave={() => {
          setErfolg("Mitglied erfolgreich hinzugefügt.");
          ladeMitglieder();
        }}
        eigeneUserId={eigeneUserId}
      />

      {/* Modal: Bearbeiten */}
      <MitgliedBearbeitenModal
        show={bearbeitenMitglied !== null}
        onClose={() => setBearbeitenMitglied(null)}
        supabase={supabase}
        initialData={bearbeitenMitglied}
        onSave={() => {
          setErfolg("Mitglied erfolgreich aktualisiert.");
          ladeMitglieder();
        }}
        eigeneUserId={eigeneUserId}
      />

      {/* Modal: Löschen – nutzt erweitertes LoeschenModal mit eigenen Texten */}
      <LoeschenModal
        show={loeschenMitglied !== null}
        onClose={() => setLoeschenMitglied(null)}
        onConfirm={loeschenBestaetigen}
        titel="🗑️ Mitglied löschen"
        beschreibung={
          loeschenMitglied
            ? `Möchtest du ${loeschenMitglied.vorname} ${loeschenMitglied.nachname} wirklich aus der Mitgliederliste entfernen? Diese Aktion kann nicht rückgängig gemacht werden.`
            : undefined
        }
      />
    </div>
  );
}
