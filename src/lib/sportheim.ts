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

/**
 * Farbzuordnung der Sportheim-Kalender-Events – gleiche Rolle wie PLATZ_FARBEN
 * im Buchungskalender. Echte Hex-Werte statt Tokens, weil die Event-Chips
 * daraus rgba-Tints berechnen (hexZuRgba); die Werte spiegeln die Brand-Akzente
 * fcb-red (belegt/gesperrt) und fcb-accent (Heimspiel).
 */
export const SPORTHEIM_FARBEN: Record<"belegt" | "heimspiel", string> = {
  belegt: "#cc1f1f",
  heimspiel: "#1d5fad",
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
