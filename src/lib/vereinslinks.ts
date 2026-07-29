// Vereinslinks – zentral pflegbar ohne Datenbankzugriff, je Marke getrennt.
//
// 👉 So pflegst du diese Datei (auch ohne Programmierkenntnisse):
// 1. Jeder Eintrag beginnt mit "{" und endet mit "},".
// 2. "label"        = der angezeigte Name
// 3. "url"          = die vollständige Web-Adresse (mit https://)
// 4. "icon"         = einer der Werte: "whatsapp" | "instagram" | "facebook" | "shop" | "link"
// 5. "beschreibung" = kurzer Untertitel (optional, kannst du weglassen)
//
// Beispiel für einen neuen Eintrag:
//   { label: "YouTube", url: "https://www.youtube.com/@fcbuku", icon: "link", beschreibung: "Highlights und Videos" },
//
// Jede Marke (FCB/JFG) hat ihre eigene Liste – nur echte, bestätigte Kanäle
// eintragen. Kein WhatsApp/Facebook für die JFG, solange es die nicht gibt.

import type { TenantId } from "@/lib/tenant";

export type VereinsLinkIcon = "whatsapp" | "instagram" | "facebook" | "shop" | "link";

export interface VereinsLink {
  label: string;
  url: string;
  icon: VereinsLinkIcon;
  beschreibung?: string;
}

export const VEREINSLINKS: Record<TenantId, VereinsLink[]> = {
  fcb: [
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
      label: "Spieler- & Fanshop",
      url: "https://www.dein-sportshop.de/vereine/fc-burgkunstadt",
      icon: "shop",
      beschreibung: "Trikots und Fanartikel",
    },
    {
      label: "Vereinswebseite",
      url: "https://www.fcbuku.de",
      icon: "link",
      beschreibung: "Offizielle Homepage",
    },
  ],
  jfg: [
    {
      label: "Instagram",
      url: "https://www.instagram.com/jfgkunstadtobermain",
      icon: "instagram",
      beschreibung: "Aktuelle Bilder und Stories",
    },
    {
      label: "Spieler- & Fanshop",
      url: "https://www.dein-sportshop.de/vereine/jfg-kunstadt-obermain",
      icon: "shop",
      beschreibung: "Trikots und Fanartikel",
    },
  ],
};
