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
  },
};
