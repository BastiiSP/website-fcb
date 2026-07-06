// Strukturierte Team-Daten + Akzent-Helfer für die Mannschaftsdarstellung
// (Design-Spec „Mannschaftsdarstellung").
//
// Träger-Regel: FCB-Teams (Herren, E-/F-/G-Jugend) laufen mit fcb-blue,
// die JFG-Leistungsjugend (A-/B-/C-/D-Junioren) mit fcb-red.
// Die konkreten Teamdaten-Einträge werden separat gepflegt – diese Datei
// enthält nur Typen, Träger-Metadaten und die Klassen-Helfer.

/** Träger einer Mannschaft: Stammverein FCB oder Jugendfördergemeinschaft JFG. */
export type Traeger = "fcb" | "jfg";

export interface Team {
  /** Stabiler, URL-tauglicher Identifier, z. B. "herren-1" oder "c-junioren". */
  id: string;
  /** Anzeigename, z. B. "1. Mannschaft" oder "C-Junioren". */
  name: string;
  /** Optionale Kurzform für enge Layouts, z. B. "U15". */
  kurzname?: string;
  /** Altersklasse, z. B. "Herren" oder "U15". */
  altersklasse?: string;
  /** Liga bzw. Spielklasse, z. B. "Kreisliga Kronach". */
  liga?: string;
  /** Bestimmt den Farbakzent: fcb = blau, jfg = rot. */
  traeger: Traeger;
  /** Optionaler Kurztext zur Mannschaft. */
  beschreibung?: string;
  /** Namen der Trainer/Betreuer – alternativ über den TeamCard-Slot befüllbar. */
  trainer?: string[];
}

/**
 * Kurzlabel + voller Vereinsname pro Träger. Das Label steht im Badge,
 * der volle Name geht an Screenreader (sr-only) und title-Tooltips.
 */
export const TRAEGER_INFO: Record<Traeger, { label: string; name: string }> = {
  fcb: { label: "FCB", name: "1. FC 1911 Burgkunstadt" },
  jfg: { label: "JFG", name: "JFG Kunstadt-Obermain" },
};

/** Tailwind-Klassen-Set für den Trägerakzent eines Teams. */
export interface TeamAccent {
  /** Textfarbe im Akzent, z. B. für Labels/Links. */
  text: string;
  /** Dezente Border im Akzent (40 % Deckkraft). */
  border: string;
  /** Dezente Tint-Fläche im Akzent (10 % Deckkraft). */
  bgSoft: string;
  /** Komplettes Pill-Badge-Set (Border + Tint + Text) – Badge-Muster. */
  badge: string;
  /** Wert für die Card-Prop `accent` (Akzentkante + Hover-Farbe). */
  cardAccent: "blue" | "red";
}

// Vollständige Klassen-Literale statt String-Bau, damit der
// Tailwind-Scanner alle Klassen sicher findet.
const ACCENTS: Record<Traeger, TeamAccent> = {
  fcb: {
    text: "text-fcb-blue",
    border: "border-fcb-blue/40",
    bgSoft: "bg-fcb-blue/10",
    badge: "border-fcb-blue/40 bg-fcb-blue/10 text-fcb-blue",
    cardAccent: "blue",
  },
  jfg: {
    text: "text-fcb-red",
    border: "border-fcb-red/40",
    bgSoft: "bg-fcb-red/10",
    badge: "border-fcb-red/40 bg-fcb-red/10 text-fcb-red",
    cardAccent: "red",
  },
};

/** Liefert das Akzent-Klassen-Set für einen Träger – nie manuell zusammenbauen. */
export function getTeamAccent(traeger: Traeger): TeamAccent {
  return ACCENTS[traeger];
}

// ---------------------------------------------------------------------------
// Konkrete Mannschaften – Namen konsistent zu src/lib/mannschaften.ts.
// Trainer-Namen bewusst weggelassen, bis der Verein sie freigibt.
// Liga-Angaben (Kreisliga/Kreisklasse) bitte pro Saison prüfen.
// ---------------------------------------------------------------------------

export const TEAMS: Team[] = [
  // --- 1. FC 1911 Burgkunstadt ---
  {
    id: "herren-1",
    name: "1. Mannschaft",
    altersklasse: "Herren",
    liga: "Kreisliga",
    traeger: "fcb",
    beschreibung:
      "Unser Aushängeschild. Sonntags am Alten Postweg oder auswärts im Landkreis unterwegs.",
  },
  {
    id: "herren-2",
    name: "2. Mannschaft",
    altersklasse: "Herren",
    liga: "Kreisklasse",
    traeger: "fcb",
    beschreibung:
      "Hier spielt jeder, der Bock auf Fußball hat, vom Routinier bis zum Neuzugang.",
  },
  {
    id: "e-junioren",
    name: "E-Junioren",
    kurzname: "U11",
    altersklasse: "U11",
    traeger: "fcb",
    beschreibung: "Erste Punktspiele und viel Bewegung. Hier zählt der Spaß am Ball.",
  },
  {
    id: "f-junioren",
    name: "F-Junioren",
    kurzname: "U9",
    altersklasse: "U9",
    traeger: "fcb",
    beschreibung: "Spielerisches Kennenlernen von Ball und Mannschaft.",
  },
  {
    id: "g-junioren",
    name: "G-Junioren / Bambini",
    kurzname: "U7",
    altersklasse: "U7",
    traeger: "fcb",
    beschreibung: "Unsere Kleinsten: Toben, Kicken und erste Schritte im Verein.",
  },
  // --- JFG Kunstadt-Obermain (ältere Jugend gemeinsam mit Nachbarvereinen) ---
  {
    id: "a-junioren",
    name: "A-Junioren",
    kurzname: "U19",
    altersklasse: "U19",
    traeger: "jfg",
    beschreibung: "Der letzte Schritt vor den Herren, gemeinsam in der JFG.",
  },
  {
    id: "b-junioren",
    name: "B-Junioren",
    kurzname: "U17",
    altersklasse: "U17",
    traeger: "jfg",
    beschreibung: "Spielbetrieb in der JFG, je nach Jahrgang auch mit zwei Teams.",
  },
  {
    id: "c-junioren",
    name: "C-Junioren",
    kurzname: "U15",
    altersklasse: "U15",
    traeger: "jfg",
    beschreibung: "Übergang aufs Großfeld. Technik und Taktik werden ernster.",
  },
  {
    id: "d-junioren",
    name: "D-Junioren",
    kurzname: "U13",
    altersklasse: "U13",
    traeger: "jfg",
    beschreibung: "Der Einstieg in die JFG. Hier beginnt die leistungsgerechte Förderung.",
  },
];
