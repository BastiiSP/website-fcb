// ---------------------------------------------------------------------------
// Multi-Tenant-Fundament: eine Codebasis, zwei Auftritte (FCB + JFG).
//
// Diese Datei ist die EINZIGE Quelle für markenabhängige Werte (Name, Logo,
// Navigation, Domain, Feed-Quelle). Sie enthält bewusst keine Funktionen im
// Config-Objekt: die Config wird von einer Server Component an einen Client-
// Provider durchgereicht und muss deshalb serialisierbar bleiben.
//
// Wichtig: Diese Datei ist framework-neutral (kein next/headers, kein React) –
// sie wird vom Proxy (src/proxy.ts), von Server Components und von Client
// Components importiert. Serverseitiges Auslesen liegt in tenant.server.ts.
// ---------------------------------------------------------------------------

import type { Traeger } from "@/lib/teams";

/** Kennung eines Auftritts. Identisch zu `Traeger` – jede Marke trägt „ihre" Teams. */
export type TenantId = Traeger;

/** Request-Header, über den der Proxy den erkannten Tenant weitergibt. */
export const TENANT_HEADER = "x-tenant";

/** Cookie für den Test-Override auf Preview/localhost (siehe src/proxy.ts). */
export const TENANT_COOKIE = "fcb-tenant";

/** Query-Parameter für den Test-Override, z. B. `?tenant=jfg`. */
export const TENANT_QUERY_PARAM = "tenant";

/** Fallback, wenn kein Tenant erkennbar ist – der FCB ist der Bestandsauftritt. */
export const DEFAULT_TENANT: TenantId = "fcb";

/** Type Guard für unbekannte Eingaben (Header, Cookie, Query). */
export function istTenantId(wert: string | null | undefined): wert is TenantId {
  return wert === "fcb" || wert === "jfg";
}

export interface TenantNavLink {
  label: string;
  href: string;
}

export interface TenantConfig {
  id: TenantId;
  /** Voller Vereinsname, z. B. für Header und Metadaten. */
  name: string;
  /** Kurzform für enge Layouts (Mobile-Header, Badges). */
  kurzname: string;
  /** Rechtlich vollständige Schreibweise (Footer). */
  vereinsname: string;
  /** Einzeiler unter dem Namen, z. B. im Vereins-Switcher. */
  untertitel: string;
  /** Pfad zum Wappen in /public. */
  logoSrc: string;
  /** Alt-Text des Wappens (Screenreader). */
  logoAlt: string;
  /**
   * Browsertab-Icon (ICO mit 32–256 px) und iOS-Homescreen-Icon (180 px), beide
   * in /public. Müssen pro Marke gesetzt sein: Das Root-Layout deklariert sie
   * in `generateMetadata()`, sonst würde der Browser blind `/favicon.ico`
   * anfragen – das ist das FCB-Wappen und stand deshalb auch im JFG-Tab
   * (Live-Fund 2026-07-30). Neue Marke = neue Icon-Dateien, kein Fallback.
   */
  faviconSrc: string;
  appleTouchIconSrc: string;
  /** Produktionsdomain ohne Protokoll. Für den Vereins-Switcher. */
  domain: string;
  /** Träger, dessen Mannschaften dieser Auftritt zeigt. */
  traeger: Traeger;
  /** Öffentliche Navigation – pro Marke unterschiedlich (JFG ohne Sportheim). */
  navLinks: TenantNavLink[];
  /** Hero-Headline der Startseite (drei Zeilen, Oswald-Uppercase). */
  heroLines: [string, string, string];
  /** Rotierende Schlagworte unter der Hero-Headline. */
  heroWords: string[];
  /**
   * Typografisches Zierelement unter der Hero-Subheadline (zwei Tokens,
   * links im Akzent, rechts in Textfarbe) – beim FCB „1911 Schuhstädter".
   */
  heroBadge: { links: string; rechts: string };
  /** `<title>`-Suffix und Default-Metadaten. */
  metaTitle: string;
  metaDescription: string;
  /** Öffentlicher Instagram-Kanal (Handle inkl. @ und URL). */
  instagramHandle: string;
  instagramUrl: string;
  /**
   * Name der Environment-Variable mit der Behold-Feed-URL dieser Marke.
   * FCB: `BEHOLD_FEED_URL`. JFG: `BEHOLD_FEED_URL_JFG` – beide in Vercel
   * gesetzt (Production + Preview).
   */
  beholdFeedEnvVar: string;
}

// ---------------------------------------------------------------------------
// Marken-Definitionen
// ---------------------------------------------------------------------------

const FCB: TenantConfig = {
  id: "fcb",
  name: "1. FC 1911 Burgkunstadt",
  kurzname: "FCB",
  vereinsname: "1. FC 1911 Burgkunstadt e.V.",
  untertitel: "Hauptverein · seit 1911",
  logoSrc: "/logo.svg",
  logoAlt: "Vereinslogo 1. FC 1911 Burgkunstadt",
  faviconSrc: "/favicon.ico",
  appleTouchIconSrc: "/apple-touch-icon.png",
  domain: "www.fcbuku.de",
  traeger: "fcb",
  navLinks: [
    { label: "Verein", href: "/verein" },
    { label: "Mannschaften", href: "/mannschaften" },
    { label: "News", href: "/news" },
    // Sportheim ist FCB-Anlagenverwaltung und existiert nur auf dieser Domain.
    { label: "Sportheim", href: "/sportheim" },
    { label: "Kontakt", href: "/kontakt" },
  ],
  heroLines: ["FUSSBALL.", "CHARAKTER.", "BURGKUNSTADT."],
  heroWords: ["Leidenschaft", "Heimat", "Gemeinschaft", "Tradition"],
  heroBadge: { links: "1911", rechts: "Schuhstädter" },
  metaTitle: "1. FC 1911 Burgkunstadt",
  metaDescription:
    "Die offizielle Vereinswebsite der Schuhstädter – mit aktuellen Spielberichten, Feierlichkeiten, Platzbuchung und mehr.",
  instagramHandle: "@schuhstaedter1911",
  instagramUrl: "https://www.instagram.com/schuhstaedter1911",
  beholdFeedEnvVar: "BEHOLD_FEED_URL",
};

const JFG: TenantConfig = {
  id: "jfg",
  name: "JFG Kunstadt-Obermain",
  kurzname: "JFG",
  // Rechtlich vollständiger Name laut Registerauskunft (handelsregister.de,
  // Amtsgericht Coburg, VR 20394) – im Alltag/auf der Seite immer
  // "JFG Kunstadt-Obermain" (siehe vereinstexte.ts), volle Schreibweise nur
  // hier für Footer/Impressum-Zwecke.
  vereinsname: "Junioren-Förder-Gemeinschaft Kunstadt-Obermain e.V.",
  untertitel: "Jugendförderung · A- bis D-Junioren",
  logoSrc: "/logo-jfg.png",
  logoAlt: "Wappen JFG Kunstadt-Obermain",
  // Aus logo-jfg.png generiert (gleiche Größenstaffel wie das FCB-Favicon).
  faviconSrc: "/favicon-jfg.ico",
  appleTouchIconSrc: "/apple-touch-icon-jfg.png",
  // Domain registriert und live (2026-07-29): DNS, Redirect und HTTPS geprüft.
  domain: "www.jfg-kunstadt-obermain.de",
  traeger: "jfg",
  navLinks: [
    { label: "Verein", href: "/verein" },
    { label: "Mannschaften", href: "/mannschaften" },
    { label: "News", href: "/news" },
    { label: "Kontakt", href: "/kontakt" },
  ],
  heroLines: ["FUSSBALL.", "CHARAKTER.", "NACHWUCHS."],
  heroWords: ["Leistung", "Förderung", "Zusammenhalt", "Perspektive"],
  // Gründungsjahr 2004 bestätigt (siehe vereinstexte.ts) – gleiches Muster
  // wie beim FCB (Jahr + Kurzform).
  heroBadge: { links: "2004", rechts: "Kunstadt-Obermain" },
  metaTitle: "JFG Kunstadt-Obermain",
  metaDescription:
    "Die Jugendfördergemeinschaft Kunstadt-Obermain: leistungsorientierte Nachwuchsförderung der A- bis D-Junioren aus drei Trägervereinen.",
  // Echter JFG-Instagram-Kanal (2026-07-29 eingerichtet, siehe Behold-Feed).
  instagramHandle: "@jfgkunstadtobermain",
  instagramUrl: "https://www.instagram.com/jfgkunstadtobermain",
  beholdFeedEnvVar: "BEHOLD_FEED_URL_JFG",
};

export const TENANTS: Record<TenantId, TenantConfig> = { fcb: FCB, jfg: JFG };

/** Liefert die Marken-Konfiguration – nie manuell zusammenbauen. */
export function getTenantConfig(id: TenantId): TenantConfig {
  return TENANTS[id];
}

/** Die jeweils andere Marke (für den Vereins-Switcher). */
export function anderenTenant(id: TenantId): TenantId {
  return id === "fcb" ? "jfg" : "fcb";
}

// ---------------------------------------------------------------------------
// Hostname-Erkennung
// ---------------------------------------------------------------------------

/**
 * Produktionsdomains je Marke. Auf diesen Hosts entscheidet AUSSCHLIESSLICH der
 * Hostname – der Test-Override (Query/Cookie) wird dort ignoriert, damit ein
 * altes Cookie den echten Auftritt nie umfärben kann.
 */
const PRODUKTIONS_HOSTS: Record<TenantId, string[]> = {
  fcb: ["fcbuku.de", "www.fcbuku.de"],
  // Domain registriert und live (2026-07-29) – beide Schreibweisen plus die
  // Subdomain-Variante als Rückfalloption.
  jfg: [
    "jfg-kunstadt-obermain.de",
    "www.jfg-kunstadt-obermain.de",
    "jfg.fcbuku.de",
  ],
};

/** True, wenn der Host eine echte Produktionsdomain ist (kein Preview/localhost). */
export function istProduktionsHost(hostname: string): boolean {
  const host = normalisiereHost(hostname);
  return Object.values(PRODUKTIONS_HOSTS).some((hosts) => hosts.includes(host));
}

/** Host normalisieren: Kleinschreibung, Port abschneiden. */
function normalisiereHost(hostname: string): string {
  return hostname.toLowerCase().split(":")[0];
}

/**
 * Tenant aus dem Hostnamen ableiten – ausschließlich per exaktem Abgleich
 * gegen PRODUKTIONS_HOSTS, alles andere fällt auf den FCB zurück
 * (localhost, Vercel-Previews, unbekannte Hosts).
 *
 * Bewusst KEINE Heuristik à la „Hostname enthält jfg": Vercel leitet
 * Preview-Aliase aus dem Branchnamen ab, und ein Branch wie
 * `feature/jfg-multi-tenant` ergibt `…-git-feature-jfg-multi-tenant-….vercel.app`.
 * Eine Substring-Prüfung hätte damit die komplette Preview auf den JFG-Auftritt
 * geschaltet, obwohl dort der FCB-Stand geprüft werden soll (genau so passiert
 * und deshalb entfernt). Auf Previews schaltet stattdessen `?tenant=jfg`.
 */
export function tenantAusHostname(hostname: string | null | undefined): TenantId {
  if (!hostname) return DEFAULT_TENANT;
  const host = normalisiereHost(hostname);

  for (const [id, hosts] of Object.entries(PRODUKTIONS_HOSTS)) {
    if (hosts.includes(host)) return id as TenantId;
  }

  return DEFAULT_TENANT;
}

/**
 * Absolute URL auf der anderen Domain für den Vereins-Switcher.
 *
 * `pfad` wird nur übernommen, wenn er auf beiden Auftritten existiert –
 * sonst landet der Wechsel auf der Startseite der Zieldomain (siehe
 * GEMEINSAME_PFADE).
 */
export function switchUrl(ziel: TenantId, pfad: string): string {
  const config = TENANTS[ziel];
  const zielPfad = pfadExistiertBeiTenant(pfad, ziel) ? pfad : "/";
  return `https://${config.domain}${zielPfad}`;
}

/**
 * Pfade, die auf BEIDEN Auftritten existieren. Alles andere ist markenexklusiv
 * (aktuell nur `/sportheim` beim FCB) und fällt beim Wechsel auf `/` zurück.
 */
const GEMEINSAME_PFADE = [
  "/",
  "/verein",
  "/mannschaften",
  "/news",
  "/kontakt",
  "/platzbuchung",
  "/meine-buchungen",
  "/mitglieder",
  "/vorstandsbereich",
  "/mein-verein",
  "/profil",
  "/impressum",
  "/datenschutz",
];

/** True, wenn der Pfad auf dem Ziel-Auftritt sinnvoll erreichbar ist. */
export function pfadExistiertBeiTenant(pfad: string, ziel: TenantId): boolean {
  // Query/Hash abschneiden, Trailing Slash normalisieren
  const clean = pfad.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  if (!GEMEINSAME_PFADE.includes(clean)) return false;
  // Aktuell keine markenexklusiven Einträge in GEMEINSAME_PFADE – der Check
  // bleibt als Erweiterungspunkt, falls später Pfade nur bei einer Marke gelten.
  void ziel;
  return true;
}
