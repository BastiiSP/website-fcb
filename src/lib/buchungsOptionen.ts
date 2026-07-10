// Zentrale Optionslisten + Anzeige-Labels für die enum-artigen Felder der
// Tabelle `buchungen` (CHECK-Constraints) – single source of truth statt
// Duplikate in Formular, Bearbeiten-Modal, Verwaltung und Kalender-Anzeige.

export const PLATZ_OPTIONEN = [
  { value: "hauptplatz", label: "Hauptplatz" },
  { value: "nebenplatz", label: "Nebenplatz" },
];

export const PLATZANTEIL_OPTIONEN = [
  { value: "viertel", label: "1/4 Platz" },
  { value: "halb", label: "1/2 Platz" },
  { value: "ganz", label: "Ganzer Platz" },
];

export const ANLASS_OPTIONEN = [
  { value: "training", label: "Training" },
  { value: "freundschaftsspiel", label: "Freundschaftsspiel" },
  { value: "punktspiel", label: "Punktspiel" },
  { value: "platzpflege", label: "Platzpflege" },
];

function zuLabelMap(optionen: { value: string; label: string }[]): Record<string, string> {
  return Object.fromEntries(optionen.map((o) => [o.value, o.label]));
}

export const PLATZ_LABEL = zuLabelMap(PLATZ_OPTIONEN);
export const PLATZANTEIL_LABEL = zuLabelMap(PLATZANTEIL_OPTIONEN);
export const ANLASS_LABEL = zuLabelMap(ANLASS_OPTIONEN);
