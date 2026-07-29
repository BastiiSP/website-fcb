"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import TextField from "@/components/ui/TextField";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

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
      {/* Profilbild-Block – Avatar-Klick öffnet das Upload-Modal */}
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={onAvatarClick}
          className="w-24 h-24 rounded-full overflow-hidden bg-fcb-surface border border-fcb-border text-fcb-text flex items-center justify-center font-oswald font-bold text-2xl hover:border-fcb-accent transition-colors flex-shrink-0"
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
            className="font-inter text-sm text-fcb-accent underline hover:text-fcb-accent/80 transition-colors"
          >
            Bild ändern
          </button>
          <p className="font-inter text-xs text-fcb-muted mt-0.5">Max. 5 MB (JPG, PNG, WebP)</p>
        </div>
      </div>

      {fehler && <Banner variant="error" message={fehler} />}
      {erfolg && <Banner variant="success" message={erfolg} />}

      <form onSubmit={handleSpeichern} className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[140px]">
            <TextField
              label="Vorname"
              value={vorname}
              onChange={setVorname}
              required
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <TextField
              label="Nachname"
              value={nachname}
              onChange={setNachname}
              required
            />
          </div>
        </div>

        <TextField
          label="Telefonnummer"
          optional
          type="tel"
          value={telefonnummer}
          onChange={setTelefonnummer}
          placeholder="z. B. 0171 123456"
        />

        <TextField
          label="Geburtsdatum"
          optional
          type="date"
          value={geburtsdatum}
          onChange={setGeburtsdatum}
        />

        {/* Adress-Block als Card gruppiert */}
        <Card className="space-y-3">
          <p className="font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted">
            Adresse
          </p>
          <TextField
            label="Straße und Hausnummer"
            optional
            value={strasse}
            onChange={setStrasse}
            placeholder="z. B. Musterstraße 1"
          />
          <div className="flex gap-4">
            <div className="w-28">
              <TextField
                label="PLZ"
                optional
                value={plz}
                onChange={setPlz}
                placeholder="96224"
                maxLength={10}
              />
            </div>
            <div className="flex-1">
              <TextField
                label="Ort"
                optional
                value={ort}
                onChange={setOrt}
                placeholder="Burgkunstadt"
              />
            </div>
          </div>
        </Card>

        <Button type="submit" variant="primary" size="md" disabled={speichern}>
          {speichern ? "Wird gespeichert …" : "Speichern"}
        </Button>
      </form>
    </div>
  );
}
