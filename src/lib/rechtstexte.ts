// ---------------------------------------------------------------------------
// Rechtlich verbindliche Angaben je Marke (Impressum, Datenschutz).
//
// Getrennt von vereinstexte.ts (redaktioneller Inhalt), weil diese Werte
// juristisch verbindlich sind – Vertreter, Vereinsregister, Kontakt – und
// nicht mit den freier formulierten "Wer wir sind"-Texten vermischt werden
// sollen. Beide Vereine (FCB, JFG) sind eigenständige eingetragene Vereine
// (JFG: Amtsgericht Coburg, VR 20394, amtlich per Registerauskunft geprüft),
// keine reine FCB-Unterabteilung.
// ---------------------------------------------------------------------------

import type { TenantId } from "@/lib/tenant";

/** Ein einzelner Ansprechpartner (Name + optional Telefon als klickbarer Link). */
export interface Ansprechpartner {
  name: string;
  telefon?: string;
  telefonHref?: string;
}

/**
 * Kinderschutz-Ansprechpartner nach DFB-Merkblatt "Erstellung eines
 * Kinderschutzkonzepts" (Punkt 02: Ansprechpartner innerhalb des Vereins als
 * Anlaufstelle, mit Weitervermittlung an externe Stellen) – Kommunikation
 * "in Form eines Berichts auf der Homepage" ist im Merkblatt ausdrücklich als
 * zulässiger Weg genannt. Nur gesetzt, wenn der Verein ein eigenes Konzept
 * hat (aktuell nur JFG).
 */
export interface KinderschutzAngaben {
  intern: Ansprechpartner;
  extern: Ansprechpartner;
}

export interface RechtstextAngaben {
  /** Rechtlich vollständiger Name, wie er im Vereinsregister steht. */
  vollerName: string;
  /** Gebräuchlicher Name, falls abweichend vom vollen Namen (sonst undefined). */
  bekanntAls?: string;
  strasse: string;
  ort: string;
  vertreterName: string;
  vertreterFunktion: string;
  registergericht: string;
  registerNummer: string;
  telefon?: string;
  telefonHref?: string;
  email: string;
  kinderschutz?: KinderschutzAngaben;
}

export const RECHTSTEXTE: Record<TenantId, RechtstextAngaben> = {
  fcb: {
    vollerName: "1. FC 1911 Burgkunstadt e.V.",
    strasse: "Alter Postweg 10",
    ort: "96224 Burgkunstadt",
    // Co-Vorsitz (von Basti bestätigt, 2026-07-29) – beide gemeinsam vertretungsberechtigt.
    vertreterName: "Wolfgang Strassgürtel und Elke Wudi",
    vertreterFunktion: "Vorsitzende",
    registergericht: "Amtsgericht Coburg",
    registerNummer: "VR 20074",
    telefon: "09572 2090152",
    telefonHref: "tel:095722090152",
    email: "info@fcburgkunstadt.de",
  },
  jfg: {
    // Voller Name laut Registerauskunft (handelsregister.de, Amtsgericht
    // Coburg, VR 20394) – im Alltag wird durchgehend "JFG Kunstadt-Obermain"
    // verwendet (siehe vereinstexte.ts), im Impressum steht der volle Name
    // Pflicht, ergänzt um den bekannten Kurznamen.
    vollerName: "Junioren-Förder-Gemeinschaft Kunstadt-Obermain e.V.",
    bekanntAls: "JFG Kunstadt-Obermain",
    strasse: "Goethestraße 3",
    ort: "96224 Burgkunstadt",
    vertreterName: "André Petratschek",
    vertreterFunktion: "1. Vorsitzender",
    registergericht: "Amtsgericht Coburg",
    registerNummer: "VR 20394",
    telefon: "0172 2804003",
    telefonHref: "tel:+491722804003",
    email: "jfg-kunstadt-obermain@pm.me",
    // Von André Petratschek an Basti kommuniziert (2026-07-29): eigenes
    // Kinderschutzkonzept nach BFV/DFB-Vorgabe, intern + extern benannter
    // Ansprechpartner. Externe Telefonnummer von Basti bestätigt.
    kinderschutz: {
      intern: { name: "André Petratschek" },
      extern: {
        name: "Yannic Geißler",
        telefon: "0151 70107458",
        telefonHref: "tel:+4915170107458",
      },
    },
  },
};
