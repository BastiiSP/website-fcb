/**
 * Gemeinsamer Datenvertrag für die BFV-Spielbetriebsdaten (Tabelle + Spiele).
 *
 * Diese Datei enthält NUR Typen – die Datenbeschaffung liegt in src/lib/bfv.ts,
 * die Darstellung in src/components/spielbetrieb/. Beide Seiten programmieren
 * gegen diese Struktur, damit Datenquelle und UI unabhängig änderbar bleiben.
 *
 * Quelle der Daten: offizielle BFV-Seiten/-Schnittstellen (bewusste
 * Entscheidung für den Verband, nicht fussball.de). Es werden ausschließlich
 * faktische Sportdaten übernommen (Tabellenstand, Ergebnisse, Termine) –
 * keine geschützten Inhalte oder Bilder.
 */

/** Eine Zeile der Ligatabelle. */
export interface TabellenEintrag {
  /** Tabellenplatz (1-basiert). */
  platz: number;
  /** Mannschaftsname, wie der BFV ihn führt (inkl. evtl. SG-Zusatz). */
  mannschaft: string;
  /** Absolvierte Spiele. */
  spiele: number;
  siege: number;
  unentschieden: number;
  niederlagen: number;
  /**
   * Tordifferenz. Die BFV-Widget-API liefert nur `goalsDiff` –
   * getrennte Tore/Gegentore gibt es dort nicht (live verifiziert).
   */
  tordifferenz: number;
  punkte: number;
  /** true bei der eigenen Mannschaft – die Zeile wird im UI hervorgehoben. */
  eigenesTeam: boolean;
}

/** Ein einzelnes Spiel (angesetzt oder bereits gespielt). */
export interface Spiel {
  /** Anstoß als ISO-8601-Zeitstempel (mit Zeitzone). */
  anstoss: string;
  /**
   * Spielart als konsistentes deutsches Label ("Ligaspiel", "Pokalspiel",
   * "Freundschaftsspiel", "Turnierspiel") – abgeleitet aus dem
   * BFV-competitionType, siehe Mapping in src/lib/bfv.ts.
   */
  spielart: string;
  /** Wettbewerbs-/Staffelname, z. B. "Kreisliga 2 Coburg/Kronach/Lichtenfels". */
  wettbewerb?: string;
  heim: string;
  gast: string;
  /**
   * Endstand als "heim:gast" (z. B. "2:1"), nur bei gespielten Partien.
   * Angesetzte Spiele haben kein Ergebnis.
   */
  ergebnis?: string;
}

/** Komplettes Datenpaket für eine Mannschaft. */
export interface SpielbetriebDaten {
  /** Offizieller Staffelname laut BFV, z. B. "Kreisliga 2 Coburg/Kronach/Lichtenfels". */
  ligaName: string;
  /** Vollständige Ligatabelle in Platzierungsreihenfolge. */
  tabelle: TabellenEintrag[];
  /** Kommende Spiele der Mannschaft, chronologisch aufsteigend. */
  naechsteSpiele: Spiel[];
  /** Letzte gespielte Partien der Mannschaft, jüngste zuerst (optional befüllt). */
  letzteSpiele: Spiel[];
  /** Zeitpunkt des Datenabrufs (ISO-8601) – wird im UI als "Stand" angezeigt. */
  abgerufenAm: string;
  /** Link zur öffentlichen BFV-Seite der Mannschaft/Staffel (Quellenangabe). */
  quelleUrl: string;
}
