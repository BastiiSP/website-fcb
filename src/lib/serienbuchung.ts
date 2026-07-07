import type { SupabaseClient } from "@supabase/supabase-js";

export interface SerienSpezifikation {
  startzeit: Date;
  endzeitErsterTermin: Date;
  serienEnddatum: Date;
  platz: string;
  platzanteil: "viertel" | "halb" | "ganz";
  anlass: string;
  mannschaft: string;
  buchendePerson: string;
  bemerkung?: string;
  userId: string;
}

export interface SerienErgebnis {
  erstellt: { startzeit: Date; endzeit: Date }[];
  uebersprungen: { startzeit: Date; endzeit: Date; grund: string }[];
  /** Gemeinsame ID aller angelegten Termine – Grundlage für Serien-Bearbeitung/-Löschung */
  serienId: string;
}

/** Änderungen, die beim Bearbeiten einer ganzen Serie auf alle Termine übertragen werden */
export interface SerienAenderung {
  serienId: string;
  /**
   * Bereichsauswahl des Aufrufers: null bearbeitet die komplette Serie,
   * ein ISO-String nur den ausgewählten Termin und alle folgenden.
   */
  abStartzeitISO: string | null;
  /** Zeiten der bearbeiteten Instanz VOR der Änderung (ISO) – Basis für die Zeitverschiebung */
  alteStartzeit: string;
  alteEndzeit: string;
  /** Zeiten der bearbeiteten Instanz NACH der Änderung (ISO) */
  neueStartzeit: string;
  neueEndzeit: string;
  /** Feldwerte, die alle Serientermine übernehmen */
  felder: {
    platz: string;
    platzanteil: string;
    anlass: string;
    mannschaft: string;
    buchende_person: string;
    bemerkung?: string | null;
  };
}

export interface SerienAktualisierungsErgebnis {
  aktualisiert: { startzeit: Date; endzeit: Date }[];
  uebersprungen: { startzeit: Date; endzeit: Date; grund: string }[];
}

type Platzanteil = SerienSpezifikation["platzanteil"];

type BuchungRow = {
  id: string;
  platz: string;
  platzanteil: Platzanteil;
  anlass: string;
  startzeit: string;
  endzeit: string;
  mannschaft: string;
  buchende_person: string;
  bemerkung: string | null;
  user_id: string | null;
  serien_id: string | null;
  created_at: string;
  updated_at: string;
};

type BuchungInsert = {
  id?: string;
  platz: string;
  platzanteil: Platzanteil;
  anlass: string;
  startzeit: string;
  endzeit: string;
  mannschaft: string;
  buchende_person: string;
  bemerkung?: string | null;
  user_id: string;
  serien_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

type SerienDatabase = {
  public: {
    Tables: {
      buchungen: {
        Row: BuchungRow;
        Insert: BuchungInsert;
        Update: Partial<BuchungInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

type SerienSupabaseClient = SupabaseClient<SerienDatabase>;

const ANTEIL_WERTE: Record<Platzanteil, number> = {
  viertel: 0.25,
  halb: 0.5,
  ganz: 1,
};

export async function erstelleSerienbuchung(
  spezifikation: SerienSpezifikation,
  supabase: SerienSupabaseClient,
): Promise<SerienErgebnis> {
  // Gemeinsame ID verbindet alle Termine der Serie – Voraussetzung dafür,
  // dass später "ganze Serie bearbeiten/löschen" möglich ist.
  const serienId = crypto.randomUUID();

  const ergebnis: SerienErgebnis = {
    erstellt: [],
    uebersprungen: [],
    serienId,
  };

  const serienEndeKalendertag = startOfKalendertag(spezifikation.serienEnddatum).getTime();
  let startzeit = new Date(spezifikation.startzeit);
  let endzeit = new Date(spezifikation.endzeitErsterTermin);

  while (startOfKalendertag(startzeit).getTime() <= serienEndeKalendertag) {
    const terminStart = new Date(startzeit);
    const terminEnde = new Date(endzeit);

    if (terminEnde <= terminStart) {
      ergebnis.uebersprungen.push({
        startzeit: terminStart,
        endzeit: terminEnde,
        grund: "Die Endzeit muss nach der Startzeit liegen.",
      });
    } else {
      await verarbeiteTermin(spezifikation, terminStart, terminEnde, serienId, supabase, ergebnis);
    }

    startzeit = verschiebeUmWochen(startzeit, 1);
    endzeit = verschiebeUmWochen(endzeit, 1);
  }

  return ergebnis;
}

async function verarbeiteTermin(
  spezifikation: SerienSpezifikation,
  startzeit: Date,
  endzeit: Date,
  serienId: string,
  supabase: SerienSupabaseClient,
  ergebnis: SerienErgebnis,
): Promise<void> {
  const startISO = startzeit.toISOString();
  const endISO = endzeit.toISOString();

  // Das Zeitfenster entspricht bewusst dem Buchungsformular. Die nachgelagerte
  // Prüfung bleibt nötig, weil Supabase hier nur grob vorfiltert und RLS pro
  // Anfrage weiterhin die sichtbaren Zeilen begrenzt.
  const { data: existing, error: fetchError } = await supabase
    .from("buchungen")
    .select("startzeit, endzeit, platzanteil")
    .eq("platz", spezifikation.platz)
    .gte("endzeit", startISO)
    .lte("startzeit", endISO);

  if (fetchError) {
    ergebnis.uebersprungen.push({
      startzeit,
      endzeit,
      grund: `Fehler beim Abrufen bestehender Buchungen: ${fetchError.message}`,
    });
    return;
  }

  let belegung = 0;
  for (const buchung of existing ?? []) {
    const startB = new Date(buchung.startzeit).getTime();
    const endB = new Date(buchung.endzeit).getTime();
    const startN = startzeit.getTime();
    const endN = endzeit.getTime();

    if (startN < endB && endN > startB) {
      belegung += ANTEIL_WERTE[buchung.platzanteil] ?? 0;
    }
  }

  const neuerWert = ANTEIL_WERTE[spezifikation.platzanteil];
  if (belegung + neuerWert > 1) {
    ergebnis.uebersprungen.push({
      startzeit,
      endzeit,
      grund: "Platz bereits belegt",
    });
    return;
  }

  // Inserts laufen mit dem übergebenen Client, damit die bestehenden RLS-Regeln
  // für die angemeldete Person greifen und Serienbuchungen keine Sonderrechte
  // gegenüber Einzelbuchungen bekommen.
  const { error: insertError } = await supabase.from("buchungen").insert({
    platz: spezifikation.platz,
    platzanteil: spezifikation.platzanteil,
    anlass: spezifikation.anlass,
    startzeit: startISO,
    endzeit: endISO,
    mannschaft: spezifikation.mannschaft,
    buchende_person: spezifikation.buchendePerson,
    bemerkung: spezifikation.bemerkung ?? null,
    user_id: spezifikation.userId,
    serien_id: serienId,
  });

  if (insertError) {
    ergebnis.uebersprungen.push({
      startzeit,
      endzeit,
      grund: `Fehler beim Speichern der Buchung: ${insertError.message}`,
    });
    return;
  }

  ergebnis.erstellt.push({ startzeit, endzeit });
}

/**
 * Überträgt eine Bearbeitung auf den vom Aufrufer gewählten Bereich einer Serie:
 * Die Zeitdifferenz der bearbeiteten Instanz (z. B. Training 30 min später)
 * wird auf jeden Termin angewendet, die übrigen Felder werden übernommen.
 * Jeder verschobene Termin durchläuft erneut die Belegungsprüfung –
 * Konflikte überspringen den Einzeltermin, nie die restliche Serie.
 */
export async function aktualisiereSerie(
  aenderung: SerienAenderung,
  supabase: SerienSupabaseClient,
): Promise<SerienAktualisierungsErgebnis> {
  const ergebnis: SerienAktualisierungsErgebnis = {
    aktualisiert: [],
    uebersprungen: [],
  };

  // Verschiebung aus der bearbeiteten Instanz ableiten – Start und Ende
  // getrennt, damit auch eine geänderte Termindauer übernommen wird.
  const deltaStartMs =
    new Date(aenderung.neueStartzeit).getTime() - new Date(aenderung.alteStartzeit).getTime();
  const deltaEndeMs =
    new Date(aenderung.neueEndzeit).getTime() - new Date(aenderung.alteEndzeit).getTime();

  let termineAbfrage = supabase
    .from("buchungen")
    .select("*")
    .eq("serien_id", aenderung.serienId);

  if (aenderung.abStartzeitISO !== null) {
    termineAbfrage = termineAbfrage.gte("startzeit", aenderung.abStartzeitISO);
  }

  const { data: termine, error: ladeFehler } = await termineAbfrage.order("startzeit", {
    ascending: true,
  });

  if (ladeFehler) {
    throw new Error(`Fehler beim Laden der Serientermine: ${ladeFehler.message}`);
  }

  for (const termin of termine ?? []) {
    const neuerStart = new Date(new Date(termin.startzeit).getTime() + deltaStartMs);
    const neuesEnde = new Date(new Date(termin.endzeit).getTime() + deltaEndeMs);

    if (neuesEnde <= neuerStart) {
      ergebnis.uebersprungen.push({
        startzeit: neuerStart,
        endzeit: neuesEnde,
        grund: "Die Endzeit muss nach der Startzeit liegen.",
      });
      continue;
    }

    const startISO = neuerStart.toISOString();
    const endISO = neuesEnde.toISOString();

    // Belegungsprüfung wie beim Anlegen; nur der Termin selbst wird
    // ausgeschlossen. Andere Serienmitglieder liegen im Wochenraster ohnehin
    // auf anderen Tagen und kollidieren mit der Verschiebung nicht.
    const { data: existing, error: fetchError } = await supabase
      .from("buchungen")
      .select("startzeit, endzeit, platzanteil")
      .eq("platz", aenderung.felder.platz)
      .neq("id", termin.id)
      .gte("endzeit", startISO)
      .lte("startzeit", endISO);

    if (fetchError) {
      ergebnis.uebersprungen.push({
        startzeit: neuerStart,
        endzeit: neuesEnde,
        grund: `Fehler beim Abrufen bestehender Buchungen: ${fetchError.message}`,
      });
      continue;
    }

    let belegung = 0;
    for (const buchung of existing ?? []) {
      const startB = new Date(buchung.startzeit).getTime();
      const endB = new Date(buchung.endzeit).getTime();
      if (neuerStart.getTime() < endB && neuesEnde.getTime() > startB) {
        belegung += ANTEIL_WERTE[buchung.platzanteil] ?? 0;
      }
    }

    const neuerWert =
      ANTEIL_WERTE[aenderung.felder.platzanteil as Platzanteil] ?? 0;
    if (belegung + neuerWert > 1) {
      ergebnis.uebersprungen.push({
        startzeit: neuerStart,
        endzeit: neuesEnde,
        grund: "Platz bereits belegt",
      });
      continue;
    }

    const { error: updateError } = await supabase
      .from("buchungen")
      .update({
        ...aenderung.felder,
        platzanteil: aenderung.felder.platzanteil as Platzanteil,
        startzeit: startISO,
        endzeit: endISO,
      })
      .eq("id", termin.id);

    if (updateError) {
      ergebnis.uebersprungen.push({
        startzeit: neuerStart,
        endzeit: neuesEnde,
        grund: `Fehler beim Speichern: ${updateError.message}`,
      });
      continue;
    }

    ergebnis.aktualisiert.push({ startzeit: neuerStart, endzeit: neuesEnde });
  }

  return ergebnis;
}

/**
 * Löscht den vom Aufrufer gewählten Bereich einer Serie und gibt die Anzahl
 * der gelöschten Termine zurück.
 */
export async function loescheSerie(
  serienId: string,
  supabase: SerienSupabaseClient,
  abStartzeitISO: string | null,
): Promise<number> {
  let loeschenAbfrage = supabase
    .from("buchungen")
    .delete()
    .eq("serien_id", serienId);

  if (abStartzeitISO !== null) {
    loeschenAbfrage = loeschenAbfrage.gte("startzeit", abStartzeitISO);
  }

  const { data, error } = await loeschenAbfrage.select("id");

  if (error) {
    throw new Error(`Fehler beim Löschen der Serie: ${error.message}`);
  }

  return data?.length ?? 0;
}

function startOfKalendertag(datum: Date): Date {
  const kalendertag = new Date(datum);
  kalendertag.setHours(0, 0, 0, 0);
  return kalendertag;
}

function verschiebeUmWochen(datum: Date, wochen: number): Date {
  const verschoben = new Date(datum);
  verschoben.setDate(verschoben.getDate() + wochen * 7);
  return verschoben;
}
