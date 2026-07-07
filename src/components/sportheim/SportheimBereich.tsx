"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { EventInput } from "@fullcalendar/core";
import { format } from "date-fns";
import { de } from "date-fns/locale";

import { createClient } from "@/lib/supabaseClient";
import type { Heimspiel } from "@/lib/bfv";
import type { SportheimBelegteZeit } from "@/lib/sportheimAnfragenTypes";
import SportheimKalender, {
  type SportheimEventProps,
} from "@/components/sportheim/SportheimKalender";
import SportheimAnfrageFormular, {
  type BelegtesZeitfenster,
} from "@/components/sportheim/SportheimAnfrageFormular";
import Banner from "@/components/ui/Banner";

// Modul-Ebene → stabile Referenz (gleiches Muster wie kalender/page.tsx)
const supabase = createClient();

interface Props {
  /** Heimspiele der Herrenmannschaften – server-seitig via BFV geladen */
  heimspiele: Heimspiel[];
}

/**
 * Client-Teil der Sportheim-Seite: lädt die belegten Zeitfenster über die
 * anon-lesbare DB-Funktion (nur Start/Ende/Typ, keine Personendaten) und
 * verbindet Belegungskalender und Anfrageformular.
 */
export default function SportheimBereich({ heimspiele }: Props) {
  const [belegteZeiten, setBelegteZeiten] = useState<SportheimBelegteZeit[]>([]);
  const [ladeFehler, setLadeFehler] = useState("");
  // Kalender-Klick → Startzeit-Vorschlag fürs Formular + dorthin scrollen
  const [startzeitVorschlag, setStartzeitVorschlag] = useState<Date | null>(null);
  const formularRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ladeBelegung = async () => {
      try {
        // RPC statt Tabellen-SELECT: anon hat bewusst kein Leserecht auf die
        // Tabelle – die security-definer-Funktion liefert nur belegte Fenster.
        const { data, error } = await supabase.rpc("sportheim_belegte_zeiten");

        if (error) {
          console.error("Fehler beim Laden der Sportheim-Belegung:", error.message);
          setLadeFehler(
            "Die aktuelle Belegung konnte nicht geladen werden. Anfragen sind trotzdem möglich."
          );
          return;
        }

        setBelegteZeiten((data as SportheimBelegteZeit[]) ?? []);
      } catch (err) {
        console.error("Unerwarteter Fehler beim Laden der Sportheim-Belegung:", err);
        setLadeFehler(
          "Die aktuelle Belegung konnte nicht geladen werden. Anfragen sind trotzdem möglich."
        );
      }
    };

    ladeBelegung();
  }, []);

  // Kalender-Events: belegte Fenster aus der DB + Heimspiele als ganztägige
  // Einträge. Hintergrund/Rahmen transparent – die Chips stylen sich selbst
  // (gleiches Muster wie fetchEvents beim Platzbuchungskalender).
  const events = useMemo<EventInput[]>(() => {
    const belegt: EventInput[] = belegteZeiten.map((zeit, index) => {
      const props: SportheimEventProps = {
        art: zeit.typ === "sperrung" ? "gesperrt" : "belegt",
        label: zeit.typ === "sperrung" ? "Gesperrt" : "Belegt",
      };
      return {
        id: `belegt-${index}`,
        title: props.label,
        start: zeit.startzeit,
        end: zeit.endzeit,
        backgroundColor: "transparent",
        borderColor: "transparent",
        extendedProps: props,
      };
    });

    const spiele: EventInput[] = heimspiele.map((spiel, index) => {
      const anstoss = new Date(spiel.anstoss);
      const props: SportheimEventProps = {
        art: "heimspiel",
        label: `Heimspiel ${spiel.mannschaft}`,
        detail: `${format(anstoss, "HH:mm", { locale: de })} Uhr · gegen ${spiel.gast}`,
      };
      return {
        id: `heimspiel-${index}`,
        title: props.label,
        // Ganztägig: an Heimspieltagen ist das Sportheim für den Spielbetrieb
        // reserviert, nicht nur während der Spielzeit.
        start: format(anstoss, "yyyy-MM-dd"),
        allDay: true,
        backgroundColor: "transparent",
        borderColor: "transparent",
        extendedProps: props,
      };
    });

    return [...belegt, ...spiele];
  }, [belegteZeiten, heimspiele]);

  // Zeitfenster für die Überschneidungsprüfung im Formular:
  // Heimspieltage blockieren den ganzen lokalen Tag (00:00–24:00).
  const belegteZeitfenster = useMemo<BelegtesZeitfenster[]>(() => {
    const fenster: BelegtesZeitfenster[] = belegteZeiten.map((zeit) => ({
      start: new Date(zeit.startzeit),
      ende: new Date(zeit.endzeit),
      istHeimspieltag: false,
    }));

    for (const spiel of heimspiele) {
      const anstoss = new Date(spiel.anstoss);
      const tagesbeginn = new Date(anstoss);
      tagesbeginn.setHours(0, 0, 0, 0);
      const tagesende = new Date(tagesbeginn);
      tagesende.setDate(tagesende.getDate() + 1);
      fenster.push({ start: tagesbeginn, ende: tagesende, istHeimspieltag: true });
    }

    return fenster;
  }, [belegteZeiten, heimspiele]);

  return (
    <div className="space-y-8">
      {ladeFehler && <Banner variant="warning" message={ladeFehler} />}

      <SportheimKalender
        events={events}
        onTagKlick={(datum) => {
          setStartzeitVorschlag(datum);
          // Nach dem Klick direkt zum Formular führen – sonst bleibt die
          // Vorbelegung auf mobilen Geräten unbemerkt.
          formularRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />

      <div ref={formularRef} className="scroll-mt-20">
        <SportheimAnfrageFormular
          supabase={supabase}
          belegteZeitfenster={belegteZeitfenster}
          startzeitVorschlag={startzeitVorschlag}
        />
      </div>
    </div>
  );
}
