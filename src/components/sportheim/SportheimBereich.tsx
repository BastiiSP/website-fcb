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

// Nach dem Anstoß bleibt das Sportheim 4 Stunden für den Spielbetrieb
// reserviert (Duschen + Beisammensein) – Basis für Kalender-Events und
// die Blockade im Anfrageformular.
const HEIMSPIEL_NACHLAUF_STUNDEN = 4;

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
        // Anstoß bis +4 h: solange ist das Sportheim für den Spielbetrieb
        // reserviert (Duschen + Beisammensein nach dem Spiel).
        start: spiel.anstoss,
        end: new Date(
          anstoss.getTime() + HEIMSPIEL_NACHLAUF_STUNDEN * 60 * 60 * 1000
        ).toISOString(),
        backgroundColor: "transparent",
        borderColor: "transparent",
        extendedProps: props,
      };
    });

    return [...belegt, ...spiele];
  }, [belegteZeiten, heimspiele]);

  // Zeitfenster für die Überschneidungsprüfung im Formular. Heimspiele
  // blockieren pro Tag EIN zusammenhängendes Fenster: vom frühesten Anstoß
  // bis 4 h nach dem spätesten Anstoß des Tages (bei mehreren Spielen zählt
  // fürs Ende das zeitlich letzte Spiel).
  const belegteZeitfenster = useMemo<BelegtesZeitfenster[]>(() => {
    const fenster: BelegtesZeitfenster[] = belegteZeiten.map((zeit) => ({
      start: new Date(zeit.startzeit),
      ende: new Date(zeit.endzeit),
      istHeimspieltag: false,
    }));

    // Anstoßzeiten nach lokalem Kalendertag gruppieren
    const anstosseProTag = new Map<string, Date[]>();
    for (const spiel of heimspiele) {
      const anstoss = new Date(spiel.anstoss);
      const tagKey = format(anstoss, "yyyy-MM-dd");
      const liste = anstosseProTag.get(tagKey) ?? [];
      liste.push(anstoss);
      anstosseProTag.set(tagKey, liste);
    }

    for (const anstoesse of anstosseProTag.values()) {
      const zeiten = anstoesse.map((a) => a.getTime());
      const fruehester = Math.min(...zeiten);
      const spaetester = Math.max(...zeiten);
      fenster.push({
        start: new Date(fruehester),
        ende: new Date(
          spaetester + HEIMSPIEL_NACHLAUF_STUNDEN * 60 * 60 * 1000
        ),
        istHeimspieltag: true,
      });
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
