"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";

interface PersoenlicheDatenProps {
  userId: string;
  initialDaten: {
    vorname: string;
    nachname: string;
    telefonnummer: string | null;
    geburtsdatum: string | null;
    strasse: string | null;
    plz: string | null;
    ort: string | null;
  };
  avatarUrl: string | null;
  onAvatarClick: () => void;
}

export default function PersoenlicheDaten({
  userId,
  initialDaten,
  avatarUrl,
  onAvatarClick,
}: PersoenlicheDatenProps) {
  const supabase = createClient();

  const [vorname, setVorname] = useState(initialDaten.vorname);
  const [nachname, setNachname] = useState(initialDaten.nachname);
  const [telefonnummer, setTelefonnummer] = useState(initialDaten.telefonnummer ?? "");
  const [geburtsdatum, setGeburtsdatum] = useState(initialDaten.geburtsdatum ?? "");
  const [strasse, setStrasse] = useState(initialDaten.strasse ?? "");
  const [plz, setPlz] = useState(initialDaten.plz ?? "");
  const [ort, setOrt] = useState(initialDaten.ort ?? "");

  const [speichern, setSpeichern] = useState(false);
  const [fehler, setFehler] = useState("");
  const [erfolg, setErfolg] = useState("");

  const initialen = `${vorname.charAt(0)}${nachname.charAt(0)}`.toUpperCase();

  const handleSpeichern = async (e: React.FormEvent) => {
    e.preventDefault();
    setFehler("");
    setErfolg("");
    setSpeichern(true);

    if (!vorname.trim() || !nachname.trim()) {
      setFehler("Vor- und Nachname sind Pflichtfelder.");
      setSpeichern(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        vorname: vorname.trim(),
        nachname: nachname.trim(),
        telefonnummer: telefonnummer.trim() || null,
        geburtsdatum: geburtsdatum || null,
        strasse: strasse.trim() || null,
        plz: plz.trim() || null,
        ort: ort.trim() || null,
      })
      .eq("id", userId);

    if (error) {
      setFehler("Fehler beim Speichern: " + error.message);
    } else {
      setErfolg("Daten erfolgreich gespeichert.");
    }

    setSpeichern(false);
  };

  return (
    <div className="space-y-6">
      {/* Profilbild-Block */}
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={onAvatarClick}
          className="w-24 h-24 rounded-full overflow-hidden bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center font-bold text-2xl hover:opacity-80 transition flex-shrink-0"
          title="Profilbild ändern"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profilbild"
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{initialen}</span>
          )}
        </button>
        <div>
          <button
            type="button"
            onClick={onAvatarClick}
            className="text-sm underline opacity-70 hover:opacity-100 transition"
          >
            Bild ändern
          </button>
          <p className="text-xs opacity-50 mt-0.5">Max. 5 MB (JPG, PNG, WebP)</p>
        </div>
      </div>

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

      <form onSubmit={handleSpeichern} className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-sm font-medium mb-1">Vorname *</label>
            <input
              type="text"
              value={vorname}
              onChange={(e) => setVorname(e.target.value)}
              required
              className="form-field"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-sm font-medium mb-1">Nachname *</label>
            <input
              type="text"
              value={nachname}
              onChange={(e) => setNachname(e.target.value)}
              required
              className="form-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Telefonnummer</label>
          <input
            type="tel"
            value={telefonnummer}
            onChange={(e) => setTelefonnummer(e.target.value)}
            placeholder="z. B. 0171 123456"
            className="form-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Geburtsdatum</label>
          <input
            type="date"
            value={geburtsdatum}
            onChange={(e) => setGeburtsdatum(e.target.value)}
            className="form-field"
          />
        </div>

        <fieldset className="border rounded p-4 space-y-3">
          <legend className="text-sm font-medium px-1">Adresse</legend>
          <div>
            <label className="block text-sm mb-1">Straße und Hausnummer</label>
            <input
              type="text"
              value={strasse}
              onChange={(e) => setStrasse(e.target.value)}
              placeholder="z. B. Musterstraße 1"
              className="form-field"
            />
          </div>
          <div className="flex gap-4">
            <div className="w-28">
              <label className="block text-sm mb-1">PLZ</label>
              <input
                type="text"
                value={plz}
                onChange={(e) => setPlz(e.target.value)}
                placeholder="96224"
                maxLength={10}
                className="form-field"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1">Ort</label>
              <input
                type="text"
                value={ort}
                onChange={(e) => setOrt(e.target.value)}
                placeholder="Burgkunstadt"
                className="form-field"
              />
            </div>
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={speichern}
          className="px-5 py-2 bg-[var(--foreground)] text-[var(--background)] rounded hover:opacity-80 transition disabled:opacity-50"
        >
          {speichern ? "Wird gespeichert …" : "Speichern"}
        </button>
      </form>
    </div>
  );
}
