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
  const ergebnis: SerienErgebnis = {
    erstellt: [],
    uebersprungen: [],
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
      await verarbeiteTermin(spezifikation, terminStart, terminEnde, supabase, ergebnis);
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
