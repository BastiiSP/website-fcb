// Vereinslinks – zentral pflegbar ohne Datenbankzugriff
//
// 👉 So pflegst du diese Datei (auch ohne Programmierkenntnisse):
// 1. Jeder Eintrag beginnt mit "{" und endet mit "},".
// 2. "label"        = der angezeigte Name
// 3. "url"          = die vollständige Web-Adresse (mit https://)
// 4. "icon"         = einer der Werte: "whatsapp" | "instagram" | "facebook" | "link"
// 5. "beschreibung" = kurzer Untertitel (optional, kannst du weglassen)
//
// Beispiel für einen neuen Eintrag:
//   { label: "YouTube", url: "https://www.youtube.com/@fcbuku", icon: "link", beschreibung: "Highlights und Videos" },

export type VereinsLinkIcon = "whatsapp" | "instagram" | "facebook" | "link";

export interface VereinsLink {
  label: string;
  url: string;
  icon: VereinsLinkIcon;
  beschreibung?: string;
}

export const VEREINSLINKS: VereinsLink[] = [
  {
    label: "WhatsApp-Gruppe",
    url: "https://chat.whatsapp.com/DfusjYGVNEpE3lBrfkIR41",
    icon: "whatsapp",
    beschreibung: "Vereinsweite WhatsApp-Gruppe",
  },
  {
    label: "Instagram",
    url: "https://www.instagram.com/schuhstaedter1911?igsh=MTRqazk3eHg5eXNzbQ==",
    icon: "instagram",
    beschreibung: "Aktuelle Bilder und Stories",
  },
  {
    label: "Facebook",
    url: "https://www.facebook.com/share/1BLBVT5iNY/",
    icon: "facebook",
    beschreibung: "News und Veranstaltungen",
  },
  {
    label: "Vereinswebseite",
    url: "https://www.fcbuku.de",
    icon: "link",
    beschreibung: "Offizielle Homepage",
  },
];
