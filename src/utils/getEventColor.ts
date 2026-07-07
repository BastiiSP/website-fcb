// Zentrale Farbzuordnung pro Platz – gemeinsame Quelle für Kalender-Events,
// die Pill-Legende und den Platz-Indikator im Buchungsformular.
export const PLATZ_FARBEN: Record<string, string> = {
  hauptplatz: "#3b82f6", // kräftiges Blau
  nebenplatz: "#22c55e", // kräftiges Grün
};

export function getEventColor(platz: string): string {
  return PLATZ_FARBEN[platz.toLowerCase()] || "#999999";
}

// Hex-Farbe → rgba mit Alpha. Grundlage für die getinteten Event-Chips im
// Kalender (Outlook-Muster: dezente Farbfläche + kräftige Akzentkante),
// funktioniert dadurch auf hellem UND dunklem Theme.
export function hexZuRgba(hex: string, alpha: number): string {
  const bereinigt = hex.replace("#", "");
  const r = parseInt(bereinigt.slice(0, 2), 16);
  const g = parseInt(bereinigt.slice(2, 4), 16);
  const b = parseInt(bereinigt.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
