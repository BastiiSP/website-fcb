// Inhalte und Konstanten der öffentlichen Sportheim-Seite.
//
// WICHTIG: Preise und Nutzungsvorgaben sind PLATZHALTER – die echten Werte
// liefert der Vorstand. Zum Pflegen nur die Arrays unten anpassen, die Seite
// rendert sie automatisch.

/** Eine Position der Preisliste des Sportheims. */
export interface PreisPosition {
  leistung: string;
  preis: string;
  hinweis?: string;
}

/** Preisliste – Reihenfolge = Anzeige-Reihenfolge auf der Seite. */
export const SPORTHEIM_PREISE: PreisPosition[] = [
  {
    leistung: "Private Feier (Vereinsmitglieder)",
    preis: "auf Anfrage",
    hinweis: "z. B. Geburtstage, Familienfeiern",
  },
  {
    leistung: "Private Feier (Externe)",
    preis: "auf Anfrage",
  },
  {
    leistung: "Vereine & Gruppen",
    preis: "auf Anfrage",
    hinweis: "Versammlungen, Vereinsabende",
  },
];

/** Nutzungsvorgaben – werden als Liste auf der Seite angezeigt. */
export const SPORTHEIM_NUTZUNGSVORGABEN: string[] = [
  "Die Anfrage ist unverbindlich – die Vergabe erfolgt erst nach Bestätigung durch den Vorstand.",
  "Die Räumlichkeiten sind besenrein zu übergeben.",
  "Rund um Heimspiele der Herrenmannschaften ist das Sportheim für den Spielbetrieb reserviert (bis vier Stunden nach Anstoß).",
  "Details zu Kaution, Getränkeabnahme und Schlüsselübergabe werden bei der Bestätigung geklärt.",
];

/** Die drei fachlichen Kategorien des öffentlichen Belegungskalenders. */
export type SportheimEventArt =
  | "heimspiel-fcb"
  | "heimspiel-jfg"
  | "buchung";

export interface SportheimKategorie {
  farbe: string;
  label: string;
  kurzlabel: string;
}

/**
 * Single Source of Truth für Kalender-Chips, Legende und Indikatoren – analog
 * zu PLATZ_FARBEN. Brand-Blau und -Rot entsprechen den festen fcb-Tokens.
 * Amber ist im Platzkalender (Blau/Grün) noch ungenutzt und signalisiert eine
 * neutrale Belegung statt Vereinszugehörigkeit. Bewusst gelblich statt satt
 * orange: ein kräftiges Orange läge zu nah am JFG-Rot und wäre bei
 * Rot-Grün-Sehschwäche kaum davon zu trennen.
 *
 * Hex-Werte sind hier bewusst nötig, weil FullCalendar daraus per hexZuRgba
 * theme-unabhängige Tints mit kräftiger Akzentkante erzeugt.
 */
export const SPORTHEIM_KATEGORIEN: Record<
  SportheimEventArt,
  SportheimKategorie
> = {
  "heimspiel-fcb": {
    farbe: "#1d5fad",
    label: "FCB-Heimspiel",
    kurzlabel: "FCB",
  },
  "heimspiel-jfg": {
    farbe: "#cc1f1f",
    label: "JFG-Heimspiel",
    kurzlabel: "JFG",
  },
  // Deckt Anfragen UND manuelle Sperrtermine ab – beides ist eine Belegung des
  // Sportheims, kein Heimspiel. "Buchung" wäre für einen Sperrtermin falsch.
  buchung: {
    farbe: "#f59e0b",
    label: "Belegung Sportheim",
    kurzlabel: "Belegt",
  },
};

/**
 * Anlass-Vorschläge für das Anfrageformular. Freitext-Eingabe bleibt möglich,
 * die Liste dient nur der schnellen Auswahl.
 */
// value = label: der Anlass landet als lesbarer Text in der DB (Spalte ist
// Freitext ohne CHECK), so sieht der Vorstand direkt "Geburtstag" statt Slug.
export const SPORTHEIM_ANLASS_OPTIONEN = [
  { value: "Geburtstag", label: "Geburtstag" },
  { value: "Familienfeier", label: "Familienfeier" },
  { value: "Vereinsveranstaltung", label: "Vereinsveranstaltung" },
  { value: "Sonstiges", label: "Sonstiges" },
];
