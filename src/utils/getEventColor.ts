// Zentrale Farbzuordnung pro Platz – gemeinsame Quelle für Kalender-Events,
// die Pill-Legende und den Platz-Indikator im Buchungsformular.
export const PLATZ_FARBEN: Record<string, string> = {
  hauptplatz: "#3b82f6", // kräftiges Blau
  nebenplatz: "#22c55e", // kräftiges Grün
};

export function getEventColor(platz: string): string {
  return PLATZ_FARBEN[platz.toLowerCase()] || "#999";
}
