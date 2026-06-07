# Design-Runde 2 – Finale Varianten übernehmen + auf main mergen – Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die in Design-Runde 2 gewählten Varianten (Footer dreispaltig, Navbar-Split, Dropdown Card-Style) mit den vereinbarten Anpassungen in die echten Komponenten `Footer.tsx` und `UserDropdown.tsx` übernehmen, alle Preview-Routen + Hilfskomponenten entfernen, `ConditionalChrome` bereinigen und `design-round-2` auf `main` mergen.

**Architecture:** Zwei unabhängige Arbeitsbereiche (Footer / UserDropdown+Cleanup) werden parallel umgesetzt, danach folgt eine serielle Integrationsphase (ConditionalChrome + Layout-Kommentare, Löschungen, Verifikation, Push, Merge). Die gewählten Preview-Varianten dienen als visuelle Vorlage; produktive Logik (Supabase-Auth in `UserDropdown`) bleibt unverändert.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript strict, Tailwind 3.4 (`fcb.*`-Tokens), Framer Motion 12, `@headlessui/react` (Menu), Lucide-Icons + `BrandIcons.tsx` (Inline-SVG für Facebook/Instagram). **Keine neuen Abhängigkeiten.**

**Wichtig – Verifikationsmodell:** Dieses Projekt hat **keine automatisierten Tests** (CLAUDE.md). Verifikation läuft über `npm run lint`, `npx tsc --noEmit` und manuelles Testen im Browser. Die „Test"-Schritte unten sind entsprechend Lint/TS-Checks + visuelle Verifikation statt Unit-Tests. Der lokale `npm run build` schlägt bekanntermaßen an Turbopack+FullCalendar fehl (kein eigener Bug) — Vercel ist die maßgebliche Build-Instanz.

**Parallelisierung:** Task 1 (Footer) und Task 2 (UserDropdown) sind vollständig unabhängig (disjunkte Dateien) und können von zwei SubAgents parallel bearbeitet werden. Task 3–6 sind seriell und laufen erst, wenn 1 + 2 fertig sind.

---

## Dateistruktur

**Geändert:**
- `src/components/Footer.tsx` — komplett ersetzt: dreispaltig, `bg-fcb-surface`, Instagram-Gradient-Hover, Framer-Motion-Scroll-Fade-In. Wird zur Client-Komponente (`"use client"` wegen `motion`).
- `src/components/UserDropdown.tsx` — Rendering ersetzt (Split-Buttons ausgeloggt, Card-Dropdown eingeloggt), **Auth-Logik unverändert**.
- `src/components/ConditionalChrome.tsx` — auf bedingungslose Chrome reduziert (keine Preview-Pfade mehr).
- `src/app/layout.tsx` — nur Kommentare aktualisiert (Verweise auf `/variants`/`/footer-preview` entfernen).

**Gelöscht:**
- `src/app/footer-preview/` (gesamter Ordner)
- `src/app/navbar-preview/` (gesamter Ordner)
- `src/app/dropdown-preview/` (gesamter Ordner)
- `src/components/auth-preview/` (gesamter Ordner)

**Verifizierte Fakten (vor Planung geprüft):**
- `/variants`-Route existiert **nicht** mehr (nur Kommentare verweisen darauf).
- `auth-preview/` wird von **keinem** Produktionscode importiert — nur intern + in `ConditionalChrome` (wird bereinigt).
- `UserDropdown` wird real nur in `Header.tsx:95` als `<UserDropdown />` gerendert (in `profil/page.tsx` nur ein Kommentar). Header platziert es in `<div className="flex items-center gap-3">` neben dem Hamburger → zwei Buttons passen problemlos.
- `Footer` wird nur in `ConditionalChrome` gerendert.
- `fcb.*`-Tokens bestätigt: `bg #0a0a0a`, `surface #161616`, `border #2a2a2a`, `muted #888888`, `nav #52525b`, `blue #1d5fad`, `red #cc1f1f`.

---

## Task 1: Footer.tsx finalisieren (parallelisierbar)

**Files:**
- Modify (komplett ersetzen): `src/components/Footer.tsx`

Ausgangsbasis ist `src/app/footer-preview/_components/FooterDreispaltig.tsx`. Drei Anpassungen: (a) `bg-fcb-bg` → `bg-fcb-surface` (eigene Zone), (b) Instagram-Hover-Gradient, (c) Scroll-Fade-In via Framer Motion. Die Daten aus `footer-preview/_data.ts` werden inline übernommen (die Preview wird in Task 4 gelöscht).

- [ ] **Step 1: Footer.tsx vollständig ersetzen**

Ersetze den **gesamten** Inhalt von `src/components/Footer.tsx` durch:

```tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/components/icons/BrandIcons";

/**
 * Vereins-Footer (Design-Runde 2, dreispaltig).
 * Spalte 1 Vereinsinfo, Spalte 2 Rechtliches, Spalte 3 Social + Copyright.
 * - bg-fcb-surface (#161616) statt bg-fcb-bg → hebt den Footer als eigene Zone
 *   vom schwarzen Seitenhintergrund (bg-fcb-bg) ab, bleibt aber im FCB-System.
 * - Scroll-Fade-In via Framer Motion (whileInView, einmalig) – passt zur
 *   restlichen animierten Site. Daher "use client".
 */

// Vereins- und Social-Daten (zuvor footer-preview/_data.ts; inline übernommen,
// da die Preview-Routen mit Abschluss von Design-Runde 2 entfernt wurden).
// Adresse aus dem Impressum (Stand 2025).
const FCB_FOOTER = {
  vereinsname: "1. FC 1911 Burgkunstadt e.V.",
  strasse: "Alter Postweg 10",
  ort: "96224 Burgkunstadt",
  facebookUrl: "https://www.facebook.com/fc1911?locale=de_DE",
  instagramUrl: "https://www.instagram.com/schuhstaedter1911",
} as const;

// Copyright-Jahr einmal auf Modulebene – stabil über Server/Client.
const JAHR = new Date().getFullYear();

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full border-t border-fcb-border bg-fcb-surface text-fcb-text"
    >
      {/* Instagram-Brand-Gradient: einmal als SVG-Def hinterlegt, beim Hover per
          fill:url(#...) auf dem Icon referenziert. Stops = Instagrams offizielle
          Markenfarben – kein FCB-Token möglich, Hex hier bewusst (Brand-Farben,
          analog zum bestehenden Facebook-/Instagram-Hover-Hex). */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="fcb-ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#feda75" />
            <stop offset="25%" stopColor="#fa7e1e" />
            <stop offset="50%" stopColor="#d62976" />
            <stop offset="75%" stopColor="#962fbf" />
            <stop offset="100%" stopColor="#4f5bd5" />
          </linearGradient>
        </defs>
      </svg>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-3">
        {/* Spalte 1: Vereinsinfo */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Vereinslogo 1. FC 1911 Burgkunstadt"
              width={36}
              height={36}
              className="drop-shadow-lg"
            />
            <span className="font-oswald text-base font-semibold uppercase tracking-wide">
              {FCB_FOOTER.vereinsname}
            </span>
          </div>
          <div className="flex items-start gap-2 font-inter text-sm text-fcb-muted">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-fcb-blue" />
            <span>
              {FCB_FOOTER.strasse}
              <br />
              {FCB_FOOTER.ort}
            </span>
          </div>
        </div>

        {/* Spalte 2: Rechtliches */}
        <div className="flex flex-col gap-2">
          <h3 className="font-oswald text-sm font-semibold uppercase tracking-wide text-fcb-text">
            Rechtliches
          </h3>
          <Link
            href="/impressum"
            className="font-inter text-sm text-fcb-muted transition-colors hover:text-fcb-blue"
          >
            Impressum
          </Link>
          <Link
            href="/datenschutz"
            className="font-inter text-sm text-fcb-muted transition-colors hover:text-fcb-blue"
          >
            Datenschutz
          </Link>
        </div>

        {/* Spalte 3: Social + Copyright */}
        <div className="flex flex-col gap-3 sm:items-end">
          <h3 className="font-oswald text-sm font-semibold uppercase tracking-wide text-fcb-text">
            Folge uns
          </h3>
          <div className="flex items-center gap-4">
            <Link
              href={FCB_FOOTER.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-fcb-muted transition-colors hover:text-fcb-blue"
            >
              <FacebookIcon className="h-6 w-6" />
            </Link>
            <Link
              href={FCB_FOOTER.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="group text-fcb-muted"
            >
              {/* Hover: Icon-Fill wechselt vom muted-Grau auf den Instagram-Gradient */}
              <InstagramIcon className="h-6 w-6 transition-colors group-hover:[fill:url(#fcb-ig-gradient)]" />
            </Link>
          </div>
          <span className="font-inter text-xs text-fcb-muted sm:text-right">
            © {JAHR}
            <br />
            {FCB_FOOTER.vereinsname}
          </span>
        </div>
      </div>
    </motion.footer>
  );
}
```

**Warum so:**
- `bg-fcb-surface` statt `bg-fcb-bg`: einzige Token-Stufe zwischen Seiten-BG (#0a0a0a) und Cards — gibt dem Footer eine erkennbare eigene Fläche im FCB-System (Anpassung 2).
- Gradient-Hover: Tailwind-Arbitrary-Property `group-hover:[fill:url(#fcb-ig-gradient)]` überschreibt die CSS-`fill` und gewinnt gegen das Präsentationsattribut `fill="currentColor"` der `InstagramIcon`-SVG; `transition-colors` schließt `fill` ein. Im Ruhezustand bleibt `currentColor` = `text-fcb-muted` (Anpassung 1).
- `motion.footer` + `whileInView` (`once: true`) = einmaliges, elegantes Einblenden beim Scrollen — selbes Framer-Motion-Idiom wie im Rest der Site (Anpassung 3).
- `react-icons` (alte `FaFacebook`/`FaInstagram`) entfällt zugunsten von `BrandIcons.tsx` (Projektregel).

- [ ] **Step 2: Lint + Typecheck**

Run: `npm run lint && npx tsc --noEmit`
Expected: Keine Fehler in `src/components/Footer.tsx`. (Vorhandene Warnungen aus unverändertem Fremdcode ignorieren — nur Footer-bezogene Fehler sind Blocker.)

- [ ] **Step 3: Visuelle Verifikation (dev)**

Run: `npm run dev`, dann im Browser `http://localhost:3000` öffnen, nach unten scrollen.
Erwartet:
1. Footer hat sichtbar dunkleren-als-schwarz abgesetzten Hintergrund (`#161616`) mit Top-Border.
2. Footer blendet beim Hereinscrollen weich ein (Fade + leichtes Hochschieben), einmalig.
3. Hover über das Instagram-Icon → Icon leuchtet im Instagram-Gradient (Gelb/Orange→Pink→Lila/Blau). Facebook-Icon → FCB-Blau.
Fehlerhinweis: Footer bleibt unsichtbar (opacity 0 stuck) → `whileInView`/`viewport` prüfen; Gradient erscheint nicht → `<defs>`-`id` muss exakt `fcb-ig-gradient` matchen.

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.tsx
git commit -m "feat(footer): finale Dreispaltig-Variante – fcb-surface, Instagram-Gradient-Hover, Scroll-Fade-In"
```

---

## Task 2: UserDropdown.tsx finalisieren (parallelisierbar)

**Files:**
- Modify (komplett ersetzen): `src/components/UserDropdown.tsx`

Split-Navbar (ausgeloggt: zwei Buttons, kein Dropdown) + Card-Style-Dropdown (eingeloggt). **Die gesamte Auth-Logik bleibt unverändert** — `fetchUser`-Effect, Avatar-Event-Listener, `handleLogout`, `getInitials`, `UserData`-Interface. Nur das JSX-Rendering wird ersetzt. `useRouter` und `LogIn` entfallen (nicht mehr genutzt → würden sonst Lint-Fehler erzeugen).

- [ ] **Step 1: UserDropdown.tsx vollständig ersetzen**

Ersetze den **gesamten** Inhalt von `src/components/UserDropdown.tsx` durch:

```tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import Link from "next/link";
import { Menu } from "@headlessui/react";
import { LogOut, User, UserPlus } from "lucide-react";

interface UserData {
  email: string;
  vorname: string | null;
  nachname: string | null;
  avatar_url: string | null;
}

export default function UserDropdown() {
  const supabase = createClient();

  const [user, setUser] = useState<UserData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      // getUser() statt getSession(): validiert Token serverseitig → liefert
      // immer aktuelle E-Mail, auch nach einer bestätigten E-Mail-Änderung.
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        // Profilinformationen setzen – avatar_url aus profiles, E-Mail aus Auth-User
        setUser({
          email: user.email ?? "",
          vorname: profile?.vorname ?? "",
          nachname: profile?.nachname ?? "",
          avatar_url: profile?.avatar_url ?? null,
        });
        setIsLoggedIn(true);
      }
    };

    fetchUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Reagiert auf Profilbild-Uploads von der Profilseite, ohne Seiten-Reload.
    // Die Profilseite dispatcht "avatar-aktualisiert" nach erfolgreichem Upload.
    const handleAvatarAktualisiert = (e: Event) => {
      const neueUrl = (e as CustomEvent<string>).detail;
      setUser((prev) => (prev ? { ...prev, avatar_url: neueUrl } : prev));
    };

    window.addEventListener("avatar-aktualisiert", handleAvatarAktualisiert);
    return () => {
      window.removeEventListener("avatar-aktualisiert", handleAvatarAktualisiert);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const getInitials = () => {
    const vor = user?.vorname?.charAt(0) ?? "";
    const nach = user?.nachname?.charAt(0) ?? "";
    return `${vor}${nach}`.toUpperCase();
  };

  // Ausgeloggt → Split-Variante: zwei eigenständige Buttons direkt in der Navbar,
  // kein Dropdown. „Anmelden" als Outline (weniger dominant), „Registrieren" gefüllt.
  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-full border border-fcb-blue bg-transparent px-3 py-1.5 font-inter text-sm font-medium text-fcb-blue transition-colors hover:bg-fcb-blue/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue focus-visible:ring-offset-2 focus-visible:ring-offset-fcb-nav"
        >
          Anmelden
        </Link>
        <Link
          href="/registrieren"
          className="flex items-center gap-1.5 rounded-full border border-fcb-blue bg-fcb-blue px-3 py-1.5 font-inter text-sm font-medium text-white transition-colors hover:bg-fcb-blue/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue focus-visible:ring-offset-2 focus-visible:ring-offset-fcb-nav"
        >
          <UserPlus className="h-4 w-4" />
          <span>Registrieren</span>
        </Link>
      </div>
    );
  }

  // Eingeloggt → Avatar-Trigger öffnet das Card-Style-Dropdown.
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-fcb-blue font-bold text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue focus-visible:ring-offset-2 focus-visible:ring-offset-fcb-nav">
        {user?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatar_url}
            alt={`Profilbild${user.vorname ? ` von ${user.vorname}` : ""}`}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <span className="text-sm text-white">{getInitials()}</span>
        )}
      </Menu.Button>

      {/* Card-Style-Dropdown: Avatar prominent oben, darunter Aktionen */}
      <Menu.Items className="absolute right-0 z-[9999] mt-2 w-72 origin-top-right overflow-hidden rounded-lg border border-fcb-border bg-fcb-surface text-fcb-text shadow-lg focus:outline-none">
        {/* Kopf: Avatar + Name/E-Mail, zentriert */}
        <div className="flex flex-col items-center gap-2 px-4 pb-3 pt-5 text-center">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-fcb-blue font-inter text-lg font-bold text-white">
            {user?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url}
                alt={`Profilbild${user.vorname ? ` von ${user.vorname}` : ""}`}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              getInitials()
            )}
          </div>
          <div>
            <p className="font-inter text-sm font-semibold text-fcb-text">
              {user?.vorname?.trim() ? user.vorname : "Nutzer"}
            </p>
            <p className="truncate font-inter text-xs text-fcb-muted">
              {user?.email ?? ""}
            </p>
          </div>
        </div>

        {/* Aktionen */}
        <div className="border-t border-fcb-border p-1">
          <Menu.Item>
            {({ active }) => (
              <Link
                href="/profil"
                className={`flex items-center gap-2 rounded-md px-3 py-2 font-inter text-sm transition-colors ${
                  active ? "bg-fcb-border text-fcb-text" : "text-fcb-text"
                }`}
              >
                <User className="h-4 w-4 text-fcb-muted" />
                Profil bearbeiten
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={handleLogout}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 font-inter text-sm font-medium text-fcb-red transition-colors ${
                  active ? "bg-fcb-red/10" : ""
                }`}
              >
                <LogOut className="h-4 w-4" />
                Abmelden
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
}
```

**Warum so:**
- Auth-Logik (Zeilen `fetchUser`, Avatar-Listener, `handleLogout`, `getInitials`, `UserData`) ist **byte-identisch** zur bisherigen Version übernommen — nur das Rendering ändert sich.
- Ausgeloggt: `isLoggedIn === false` rendert zwei `Link`-Buttons (kein `Menu` mehr). „Anmelden" = Outline (`border-fcb-blue bg-transparent text-fcb-blue`, `hover:bg-fcb-blue/10` = spürbarer, sauberer Tint, bleibt weniger dominant). „Registrieren" = gefüllt (`bg-fcb-blue text-white`, `hover:bg-fcb-blue/85`) mit `UserPlus`. Beide mit `focus-visible`-Ring (A11y).
- `router.push("/login")` ist durch ein `Link href="/login"` ersetzt → `useRouter` entfällt; `LogIn`-Icon entfällt → beide Imports entfernt (sonst unused → Lint-Fehler).
- Eingeloggt: Avatar-`Menu.Button` (unverändert) öffnet `Menu.Items` im Card-Layout (`w-72`, Avatar 14×14 mit echtem Bild oder Initialen, Name/E-Mail zentriert, darunter `Profil bearbeiten` + `Abmelden` mit echten `active`-States und echtem `handleLogout`).

- [ ] **Step 2: Lint + Typecheck**

Run: `npm run lint && npx tsc --noEmit`
Expected: Keine Fehler in `src/components/UserDropdown.tsx`. Speziell: keine „unused import"-Fehler (useRouter/LogIn müssen weg sein).

- [ ] **Step 3: Visuelle Verifikation (dev)**

Run: `npm run dev`, `http://localhost:3000`.
Erwartet (ausgeloggt): Rechts in der Navbar zwei Buttons — „Anmelden" mit blauem Rahmen/transparent/blaue Schrift, „Registrieren" gefüllt-blau mit Icon. Hover: Anmelden bekommt leichten blauen Tint, Registrieren wird minimal heller/dunkler. Klick „Anmelden" → `/login`, „Registrieren" → `/registrieren`.
Erwartet (eingeloggt, nach Login): Statt der zwei Buttons ein runder Avatar (Bild oder Initialen). Klick → Card-Dropdown mit großem Avatar, Name + E-Mail zentriert, „Profil bearbeiten" + „Abmelden". „Abmelden" → ausgeloggt + Redirect auf `/`. Profilbild-Upload auf `/profil` aktualisiert den Avatar ohne Reload (Event-Listener).
Fehlerhinweis: Bleibt nach Login bei den zwei Buttons → `isLoggedIn`-State / `fetchUser` prüfen.

- [ ] **Step 4: Commit**

```bash
git add src/components/UserDropdown.tsx
git commit -m "feat(userdropdown): Split-Navbar (Anmelden Outline + Registrieren filled) + Card-Style-Dropdown"
```

---

## Task 3: ConditionalChrome bereinigen + Layout-Kommentare (seriell, nach 1+2)

**Files:**
- Modify (komplett ersetzen): `src/components/ConditionalChrome.tsx`
- Modify: `src/app/layout.tsx` (nur Kommentare)

Nach Abschluss von Runde 2 gibt es **keine** Preview-Routen mehr (`/variants` existiert ohnehin nicht). Die Ausschlussliste wird damit leer → `ConditionalChrome` rendert die Chrome bedingungslos und braucht `usePathname`/`"use client"` nicht mehr.

- [ ] **Step 1: ConditionalChrome.tsx vollständig ersetzen**

Ersetze den **gesamten** Inhalt von `src/components/ConditionalChrome.tsx` durch:

```tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * Rendert die globale Chrome (Header + main-Padding + Footer) um alle Routen.
 * Früher wurden Design-Exploration-Routen (/variants, /footer-preview,
 * /navbar-preview, /dropdown-preview) hier per pathname ausgeblendet – diese
 * Preview-Routen wurden nach Abschluss von Design-Runde 2 entfernt, daher
 * rendert die Chrome jetzt bedingungslos. Wird einmalig im Root-Layout gewrappt.
 */
export default function ConditionalChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="pt-14">{children}</main>
      <Footer />
    </>
  );
}
```

**Warum so:** `"use client"` + `usePathname` + `isPreviewRoute` werden entfernt, da keine auszublendende Route mehr existiert. Würde man die Imports stehen lassen, gäbe es unused-Lint-Fehler. Komponente + Import in `layout.tsx` bleiben unverändert erhalten (geringeres Risiko als Umbenennen/Entfernen).

- [ ] **Step 2: Layout-Kommentare aktualisieren (layout.tsx)**

In `src/app/layout.tsx` drei Kommentarblöcke korrigieren (kein funktionaler Code!).

Ersetze (Zeilen ~7–9):
```tsx
// ConditionalChrome blendet Header/Footer ausschließlich auf den
// Design-Exploration-Routen unter /variants/* aus. Alle bestehenden Routes
// (/, /login, /kalender, ...) bekommen Header und Footer wie gewohnt.
```
durch:
```tsx
// ConditionalChrome rendert Header/Footer + main-Padding um alle Routen.
// (Die früheren Design-Exploration-Routen wurden nach Runde 2 entfernt.)
```

Ersetze (Zeilen ~22–23):
```tsx
// Zusatz-Schriften für die Hero-Varianten (Oswald = Headlines, Inter = Body).
// Werden nur in Komponenten unter /variants/* via font-oswald/font-inter aktiviert.
```
durch:
```tsx
// Marken-Schriften (Oswald = Headlines, Inter = Body) als CSS-Variablen.
// Werden in modernen Komponenten via font-oswald / font-inter genutzt.
```

Ersetze (Zeilen ~52–54, der Kommentar im `body`):
```tsx
        // Oswald & Inter werden als zusätzliche CSS-Variablen verfügbar gemacht;
        // aktiv genutzt werden sie aber nur in den /variants/* Routes via
        // font-oswald / font-inter (Tailwind-Tokens).
```
durch:
```tsx
        // Oswald & Inter werden als CSS-Variablen verfügbar gemacht und in
        // modernen Komponenten via font-oswald / font-inter (Tailwind) genutzt.
```

Ersetze (Zeilen ~57–59, der JSX-Kommentar):
```tsx
        {/* ConditionalChrome rendert Header/Footer und das Main-Padding wie
            bisher, unterdrückt beides aber auf den Design-Exploration-Routen
            /variants/* und /footer-preview/* (eigenes Full-Bleed-Layout). */}
```
durch:
```tsx
        {/* ConditionalChrome rendert Header/Footer und das Main-Padding. */}
```

- [ ] **Step 3: Lint + Typecheck**

Run: `npm run lint && npx tsc --noEmit`
Expected: Keine Fehler. (Noch nicht committen — kommt nach den Löschungen in Task 4, damit ein konsistenter Cleanup-Commit entsteht. Bei subagent-getriebener Ausführung sind Task 3 + 4 zusammen ein Reviewschritt.)

---

## Task 4: Preview-Routen + auth-preview löschen (seriell, nach Task 3)

**Files:**
- Delete: `src/app/footer-preview/` (Ordner)
- Delete: `src/app/navbar-preview/` (Ordner)
- Delete: `src/app/dropdown-preview/` (Ordner)
- Delete: `src/components/auth-preview/` (Ordner)

- [ ] **Step 1: Ordner löschen**

```bash
cd ~/Workspace/website-fcb
git rm -r src/app/footer-preview src/app/navbar-preview src/app/dropdown-preview src/components/auth-preview
```

- [ ] **Step 2: Verifizieren, dass keine Referenzen mehr existieren**

```bash
grep -rn "auth-preview\|footer-preview\|navbar-preview\|dropdown-preview" src
```
Expected: **keine Treffer** (leere Ausgabe). Falls ein Treffer in `src/app/layout.tsx` (Kommentar) auftaucht → es ist nur ein Kommentar, der in Task 3 schon ersetzt sein sollte; sonst dort bereinigen.

- [ ] **Step 3: Lint + Typecheck (Gesamtprojekt)**

Run: `npm run lint && npx tsc --noEmit`
Expected: Keine Fehler in eigenen Dateien. (FullCalendar/Turbopack-Build-Fehler sind hier irrelevant — `tsc`/`lint` betroffen nicht.)

- [ ] **Step 4: Commit (Cleanup + ConditionalChrome aus Task 3)**

```bash
git add -A
git commit -m "chore(design-round-2): Preview-Routen + auth-preview entfernen, ConditionalChrome bedingungslos"
```

---

## Task 5: Verifikation, Push auf design-round-2, Vercel-Build prüfen (seriell)

**Files:** keine

- [ ] **Step 1: Finaler lokaler Check**

Run: `npm run lint && npx tsc --noEmit`
Expected: Keine eigenen Fehler.

- [ ] **Step 2: Push auf design-round-2**

```bash
git push origin design-round-2
```

- [ ] **Step 3: Vercel-Preview-Build-Status prüfen**

Warte auf den Vercel-Deploy des Branches `design-round-2` und prüfe, dass der Build **clean** durchläuft (Status „Ready"). Über die Vercel-MCP-Tools (`list_deployments` für das Projekt, dann `get_deployment` / `get_deployment_build_logs` beim neuesten Commit-SHA) oder das Vercel-Dashboard.
Expected: Deployment-State `READY`, keine Build-Errors.
Fehlerhinweis: Bei „Error" die Build-Logs lesen — nur Fehler in `Footer.tsx`/`UserDropdown.tsx`/`ConditionalChrome.tsx`/`layout.tsx` sind echte Blocker und müssen vor dem Merge behoben werden.

---

## Task 6: Auf main mergen + pushen (seriell, nach grünem Vercel-Build)

**Files:** keine

Hinweis: Der allgemeine Projekt-Workflow ist „direkt auf main". Diese Aufgabe nutzt jedoch explizit den Branch `design-round-2` und verlangt einen Merge nach `main`. Erst mergen, wenn der Vercel-Preview-Build (Task 5) grün ist.

- [ ] **Step 1: main aktualisieren und mergen**

```bash
cd ~/Workspace/website-fcb
git checkout main
git pull origin main
git merge --no-ff design-round-2 -m "Merge design-round-2: finale Footer- + UserDropdown-Varianten, Preview-Cleanup"
```
Expected: Sauberer Merge ohne Konflikte (design-round-2 ist ahead of main).
Fehlerhinweis: Bei Konflikten stoppen und Konflikte einzeln auflösen (betroffene Dateien: vermutlich keine, da main seit Branch-Erstellung an diesen Dateien nicht geändert wurde — falls doch, manuell mergen).

- [ ] **Step 2: main pushen → Live-Deploy**

```bash
git push origin main
```
Expected: Vercel deployed `main` automatisch auf www.fcbuku.de.

- [ ] **Step 3: Production-Build-Status prüfen**

Prüfe via Vercel-MCP/Dashboard, dass der `main`-Production-Deploy `READY` ist.
Expected: Live-Site aktualisiert, Footer + UserDropdown im neuen Design.

- [ ] **Step 4: Memory aktualisieren**

Die Memory-Datei `project_auth_preview_routes.md` beschreibt die offene Preview-Auswahl — nach erfolgreichem Merge ist das erledigt. Inhalt auf „abgeschlossen" aktualisieren oder Datei + MEMORY.md-Zeile entfernen (Auswahl ist getroffen und gemergt).

---

## Self-Review (vom Plan-Autor durchgeführt)

**1. Spec-Abdeckung:**
- Footer dreispaltig → Task 1 ✓
- Instagram-Gradient-Hover → Task 1, Step 1 (`fcb-ig-gradient` + `group-hover:[fill:url(...)]`) ✓
- Footer farblich abgesetzt → Task 1 (`bg-fcb-surface`) ✓
- Footer Scroll-Fade-In → Task 1 (`motion.footer` + `whileInView`) ✓
- Footer ersetzt `Footer.tsx` → Task 1 ✓
- footer-preview entfernen → Task 4 ✓
- Navbar Split + Dropdown Card → Task 2 ✓
- Anmelden Outline → Task 2 (border-fcb-blue/transparent/text-fcb-blue) ✓
- Hover-Effekte beide Buttons → Task 2 (`hover:bg-fcb-blue/10` + `hover:bg-fcb-blue/85`) ✓
- Auth-Logik unverändert → Task 2 (Logik byte-identisch übernommen) ✓
- navbar-/dropdown-preview + auth-preview entfernen → Task 4 ✓
- ConditionalChrome bereinigen → Task 3 ✓
- Vercel-Build clean → Task 5 ✓
- Merge auf main + Live → Task 6 ✓
- Nur fcb.*-Tokens / Lucide / BrandIcons → eingehalten (Brand-Hex nur für Instagram-Gradient, begründet) ✓
- Keine neuen Abhängigkeiten → eingehalten ✓

**2. Placeholder-Scan:** Keine TBD/TODO/„handle edge cases"; jeder Code-Schritt enthält vollständigen Code.

**3. Typ-/Namenskonsistenz:** `UserData`-Felder konsistent; `getInitials`/`handleLogout`/`fetchUser` unverändert; Gradient-`id` `fcb-ig-gradient` in `<defs>` und im `group-hover:[fill:url(#fcb-ig-gradient)]` identisch; `FCB_FOOTER`-Felder im Footer durchgängig gleich benannt.

**Offene Designentscheidung (im Plan getroffen, ggf. von Basti bestätigen):**
- Outline-Hover „Anmelden" = `hover:bg-fcb-blue/10` (dezenter Tint, bleibt klar weniger dominant als der gefüllte Button). Alternative wäre ein voller Fill auf Hover — bewusst nicht gewählt, da das die „weniger dominant"-Vorgabe auf Hover aufheben würde.
