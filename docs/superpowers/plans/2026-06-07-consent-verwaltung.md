# DSGVO-Consent-Verwaltung Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eine DSGVO-konforme Consent-Infrastruktur bauen (zentraler State + Banner + jederzeit erneut aufrufbare Einstellungen + wiederverwendbare Consent-Gate-Komponente), gegen die künftige Drittanbieter-Einbettungen (Live-Scores, Tabellen) sauber programmieren können.

**Architecture:** Ein React-Context (`ConsentProvider`) hält den Consent-Status, persistiert ihn in `localStorage` und steuert die Sichtbarkeit des Banners. Der Provider wird einmalig in `ConditionalChrome` um die gesamte App gelegt. Reine Speicher-/Typ-Logik liegt React-frei in `src/lib/consent.ts`, damit auch Nicht-React-Stellen den Status lesen können. Banner (`CookieBanner`), Footer-Reopen-Button und `ConsentGate` konsumieren den Context über den `useConsent`-Hook.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript strict, Tailwind 3 (`fcb.*`-Tokens), Framer Motion 12, `lucide-react`. Keine neuen Abhängigkeiten.

---

## Wichtige Projekt-Eigenheiten (vor dem Start lesen)

- **Keine Tests im Projekt.** CLAUDE.md: „Keine automatisierten Tests (nur `dev`/`build`/`start`/`lint`)." → Jede Task verifiziert mit `npx tsc --noEmit` + `npm run lint` und (bei UI-Tasks) einem konkreten manuellen Browser-Check. Das ersetzt bewusst den Test-first-Loop der writing-plans-Skill (User-Instruktion in CLAUDE.md hat Vorrang).
- **`npm run build` lokal NICHT als Gate nutzen** — scheitert reproduzierbar an Turbopack+FullCalendar (`Can't resolve '@fullcalendar/core'`). Das ist kein eigener Bug. Gate = `tsc` + `lint`.
- **Direkt auf `main` arbeiten**, kein Branch/PR (Vorgabe + Git-Workflow-Memory). Häufige Commits.
- **Nur `fcb.*`-Tokens** — keine magic hex (Ausnahme: bestehende Brand-Gradients im Footer, hier irrelevant). Keine Emojis in der UI.
- **TypeScript strict, kein `any`.** Alle UI-Texte/Kommentare auf Deutsch.
- **Hydration-Guard:** `localStorage` ist serverseitig nicht verfügbar. Jede Komponente, die vom Consent abhängt, rendert erst nach `isLoaded === true` (clientseitig in `useEffect` gesetzt) — sonst SSR/Client-Mismatch oder Flackern.

## Datei-Struktur (Verantwortlichkeiten)

| Datei | Aktion | Verantwortung |
|---|---|---|
| `src/lib/consent.ts` | Create | Typen, Konstanten, `localStorage`-Helfer (React-frei, pur) |
| `src/components/consent/ConsentProvider.tsx` | Create | Context + Provider + `useConsent`-Hook (State, Persistenz, Banner-Sichtbarkeit) |
| `src/components/consent/CookieBanner.tsx` | Create | Banner-UI: collapsed (3 Buttons) + expanded (granulare Toggles) |
| `src/components/consent/ConsentGate.tsx` | Create | Wiederverwendbares Gate: rendert Inhalt nur bei Consent, sonst Platzhalter |
| `src/components/ConditionalChrome.tsx` | Modify | Provider + Banner um die App legen |
| `src/components/Footer.tsx` | Modify | Button „Cookie-Einstellungen" → `openSettings()` |

---

## Task 1: Consent-Kern (Typen, Konstanten, Storage-Helfer)

**Files:**
- Create: `src/lib/consent.ts`

Reine Logik ohne React. Versionierter `localStorage`-Key, defensive Validierung beim Lesen, SSR-sicher (liefert serverseitig `null`).

- [ ] **Step 1: Datei anlegen**

Create `src/lib/consent.ts`:

```ts
// Zentrale Consent-Logik (DSGVO) – Typen, Konstanten und localStorage-Helfer.
// Bewusst frei von React: so kann auch nicht-React-Code (z. B. künftige
// Widget-Loader) den Status lesen, ohne den Context zu benötigen.

/**
 * Consent-Kategorien. "notwendig" ist immer aktiv und nicht abwählbar
 * (technisch notwendige Cookies wie die Login-Sitzung). "externeInhalte" ist
 * das Opt-in für Drittanbieter-Einbettungen (Live-Scores, Tabellen).
 */
export interface ConsentState {
  notwendig: true;
  externeInhalte: boolean;
}

/**
 * localStorage-Schlüssel. Versioniert (_v1), damit spätere Schema-Änderungen
 * alte/inkompatible Einträge gezielt verwerfen können, indem der Suffix steigt.
 */
export const CONSENT_STORAGE_KEY = "fcb_consent_v1";

/** Vorlage: alles akzeptiert. */
export const CONSENT_ALL: ConsentState = {
  notwendig: true,
  externeInhalte: true,
};

/** Vorlage: nur Notwendiges. */
export const CONSENT_ESSENTIAL: ConsentState = {
  notwendig: true,
  externeInhalte: false,
};

/**
 * Liest den gespeicherten Consent aus localStorage.
 * Gibt null zurück, wenn nichts gespeichert oder der Eintrag ungültig/veraltet
 * ist (→ es liegt "keine Entscheidung" vor, das Banner muss erscheinen).
 * SSR-sicher: liefert serverseitig immer null (kein window).
 */
export function loadConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    // Validierung: externeInhalte muss ein Boolean sein, sonst Eintrag verwerfen.
    if (typeof parsed.externeInhalte !== "boolean") return null;
    return { notwendig: true, externeInhalte: parsed.externeInhalte };
  } catch {
    // Defekter JSON-Eintrag → wie "keine Entscheidung" behandeln.
    return null;
  }
}

/** Speichert den Consent dauerhaft in localStorage. */
export function saveConsent(state: ConsentState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage nicht verfügbar (Private Mode, deaktiviert) – still ignorieren.
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: keine Fehler in `src/lib/consent.ts`.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: keine Fehler/Warnungen für die neue Datei.

- [ ] **Step 4: Commit**

```bash
git add src/lib/consent.ts
git commit -m "feat(consent): Consent-Kern (Typen, Konstanten, localStorage-Helfer)"
```

---

## Task 2: ConsentProvider + useConsent-Hook

**Files:**
- Create: `src/components/consent/ConsentProvider.tsx`

Hält State (`consent`, `isLoaded`, `isOpen`), lädt beim ersten Client-Render aus `localStorage`, öffnet das Banner automatisch wenn keine Entscheidung vorliegt, und stellt Aktionen + Abfrage über Context bereit.

- [ ] **Step 1: Datei anlegen**

Create `src/components/consent/ConsentProvider.tsx`:

```tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CONSENT_ALL,
  CONSENT_ESSENTIAL,
  type ConsentState,
  loadConsent,
  saveConsent,
} from "@/lib/consent";

interface ConsentContextValue {
  /** Aktueller Consent oder null, solange noch keine Entscheidung vorliegt. */
  consent: ConsentState | null;
  /** true, sobald localStorage clientseitig gelesen wurde (Hydration-Guard). */
  isLoaded: boolean;
  /** true, wenn Banner/Dialog sichtbar sein soll. */
  isOpen: boolean;
  /** Alle Kategorien akzeptieren. */
  acceptAll: () => void;
  /** Nur notwendige Kategorien akzeptieren. */
  acceptEssential: () => void;
  /** Individuelle Auswahl speichern (notwendig bleibt immer true). */
  savePreferences: (externeInhalte: boolean) => void;
  /** Einstellungen erneut öffnen (z. B. aus dem Footer). */
  openSettings: () => void;
  /** Prüft, ob für eine Kategorie Consent vorliegt. */
  hasConsent: (category: keyof ConsentState) => boolean;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Beim ersten Client-Render aus localStorage laden. Liegt keine Entscheidung
  // vor (null), Banner öffnen. Läuft nur clientseitig → kein Hydration-Mismatch.
  useEffect(() => {
    const stored = loadConsent();
    setConsent(stored);
    setIsOpen(stored === null);
    setIsLoaded(true);
  }, []);

  // Gemeinsame Persistenz: speichern, State setzen, Banner schließen.
  const persist = useCallback((next: ConsentState) => {
    saveConsent(next);
    setConsent(next);
    setIsOpen(false);
  }, []);

  const acceptAll = useCallback(() => persist(CONSENT_ALL), [persist]);
  const acceptEssential = useCallback(
    () => persist(CONSENT_ESSENTIAL),
    [persist],
  );
  const savePreferences = useCallback(
    (externeInhalte: boolean) => persist({ notwendig: true, externeInhalte }),
    [persist],
  );
  const openSettings = useCallback(() => setIsOpen(true), []);

  const hasConsent = useCallback(
    (category: keyof ConsentState) => {
      // "notwendig" ist immer erlaubt – unabhängig vom gespeicherten Status.
      if (category === "notwendig") return true;
      return consent?.[category] === true;
    },
    [consent],
  );

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      isLoaded,
      isOpen,
      acceptAll,
      acceptEssential,
      savePreferences,
      openSettings,
      hasConsent,
    }),
    [
      consent,
      isLoaded,
      isOpen,
      acceptAll,
      acceptEssential,
      savePreferences,
      openSettings,
      hasConsent,
    ],
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

/** Zugriff auf den Consent-Status. Muss innerhalb von <ConsentProvider> laufen. */
export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error(
      "useConsent muss innerhalb von <ConsentProvider> verwendet werden",
    );
  }
  return ctx;
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: keine Fehler.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: keine Fehler/Warnungen.

- [ ] **Step 4: Commit**

```bash
git add src/components/consent/ConsentProvider.tsx
git commit -m "feat(consent): ConsentProvider + useConsent-Hook (State, Persistenz, Banner-Sichtbarkeit)"
```

---

## Task 3: CookieBanner-UI (collapsed + granulare Einstellungen)

**Files:**
- Create: `src/components/consent/CookieBanner.tsx`

Banner am unteren Rand, eingeblendet via Framer Motion solange `isOpen`. Collapsed: drei Buttons (`Einstellungen`, `Nur Notwendiges`, `Alle akzeptieren`). Expanded: granulare Kategorie-Toggles (Notwendig = aus-gegraut/immer an, Externe Inhalte = Opt-in) + `Auswahl speichern`. Native Switches (Checkbox als Toggle gestylt) statt shadcn/Switch.

- [ ] **Step 1: Datei anlegen**

Create `src/components/consent/CookieBanner.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, Globe, Shield } from "lucide-react";
import { useConsent } from "@/components/consent/ConsentProvider";

/**
 * Globales Cookie-Banner. Architektur/UX an der 21st.dev-Vorlage orientiert
 * (collapsed Banner → granulare Detailansicht), aber mit fcb.*-Tokens,
 * deutschen Texten und nativem HTML/Tailwind statt shadcn-Komponenten.
 * Slide-in von unten via Framer Motion.
 */
export default function CookieBanner() {
  const {
    isOpen,
    isLoaded,
    consent,
    acceptAll,
    acceptEssential,
    savePreferences,
  } = useConsent();

  // Detailansicht (granulare Auswahl) ein-/ausgeklappt.
  const [showDetails, setShowDetails] = useState(false);
  // Lokaler Schalterzustand für "Externe Inhalte" innerhalb der Detailansicht.
  const [externeInhalte, setExterneInhalte] = useState(false);

  // Bei jedem Öffnen den Schalter mit dem gespeicherten Wert vorbelegen und die
  // Detailansicht zurückklappen. So zeigt das erneute Öffnen aus dem Footer die
  // zuletzt getroffene Wahl an.
  useEffect(() => {
    if (isOpen) {
      setExterneInhalte(consent?.externeInhalte ?? false);
      setShowDetails(false);
    }
  }, [isOpen, consent]);

  // Vor dem clientseitigen Laden nichts rendern → kein Flash, kein Mismatch.
  if (!isLoaded) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="cookie-banner"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          role="dialog"
          aria-label="Cookie-Einstellungen"
          className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 sm:px-6 sm:pb-6"
        >
          <div className="mx-auto max-w-2xl rounded-xl border border-fcb-border bg-fcb-surface p-5 text-fcb-text shadow-2xl sm:p-6">
            {/* Kopf */}
            <div className="flex items-start gap-3">
              <Cookie className="mt-0.5 h-6 w-6 shrink-0 text-fcb-blue" />
              <div>
                <h2 className="font-oswald text-lg font-semibold uppercase tracking-wide">
                  Datenschutz-Einstellungen
                </h2>
                <p className="mt-1 font-inter text-sm text-fcb-muted">
                  Wir verwenden notwendige Cookies für den Betrieb der Seite.
                  Für eingebettete externe Inhalte (z. B. Live-Ergebnisse und
                  Tabellen) benötigen wir deine Einwilligung. Mehr dazu in der{" "}
                  <Link
                    href="/datenschutz"
                    className="text-fcb-blue underline-offset-2 hover:underline"
                  >
                    Datenschutzerklärung
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Detailansicht: granulare Kategorien */}
            <AnimatePresence initial={false}>
              {showDetails && (
                <motion.div
                  key="details"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 flex flex-col gap-3 border-t border-fcb-border pt-4">
                    {/* Notwendig – immer aktiv, nicht abwählbar */}
                    <CategoryRow
                      icon={<Shield className="h-5 w-5 text-fcb-blue" />}
                      title="Notwendig"
                      description="Für Login-Sitzung und Grundfunktionen erforderlich. Immer aktiv."
                      checked
                      disabled
                    />
                    {/* Externe Inhalte – Opt-in */}
                    <CategoryRow
                      icon={<Globe className="h-5 w-5 text-fcb-blue" />}
                      title="Externe Inhalte"
                      description="Erlaubt das Einbetten von Drittanbieter-Widgets wie Live-Ergebnissen und Tabellen."
                      checked={externeInhalte}
                      onChange={setExterneInhalte}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buttons. Reihenfolge per order-* so, dass "Alle akzeptieren"
                mobil oben, auf Desktop rechts steht (primäre Aktion). */}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              {!showDetails ? (
                <button
                  type="button"
                  onClick={() => setShowDetails(true)}
                  className="order-3 rounded-lg border border-fcb-border px-4 py-2 font-inter text-sm font-medium text-fcb-text transition-colors hover:border-fcb-blue hover:text-fcb-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue sm:order-1 sm:mr-auto"
                >
                  Einstellungen
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => savePreferences(externeInhalte)}
                  className="order-3 rounded-lg border border-fcb-border px-4 py-2 font-inter text-sm font-medium text-fcb-text transition-colors hover:border-fcb-blue hover:text-fcb-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue sm:order-1 sm:mr-auto"
                >
                  Auswahl speichern
                </button>
              )}
              <button
                type="button"
                onClick={acceptEssential}
                className="order-2 rounded-lg border border-fcb-border px-4 py-2 font-inter text-sm font-medium text-fcb-text transition-colors hover:border-fcb-blue hover:text-fcb-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue"
              >
                Nur Notwendiges
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="order-1 rounded-lg bg-fcb-blue px-4 py-2 font-inter text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue focus-visible:ring-offset-2 focus-visible:ring-offset-fcb-surface sm:order-3"
              >
                Alle akzeptieren
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Eine Kategorie-Zeile mit nativem Toggle (Checkbox als Switch gestylt) –
 * ersetzt den shadcn-Switch. "disabled" graut die notwendige Kategorie aus.
 */
function CategoryRow({
  icon,
  title,
  description,
  checked,
  disabled = false,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0">{icon}</span>
        <div>
          <p className="font-inter text-sm font-medium text-fcb-text">
            {title}
          </p>
          <p className="font-inter text-xs text-fcb-muted">{description}</p>
        </div>
      </div>
      {/* Nativer Switch: sr-only-Checkbox + zwei gestylte Spans (Track + Knopf).
          peer-checked steuert Farbe und Verschiebung des Knopfs. */}
      <label
        className={`relative inline-flex h-6 w-11 shrink-0 ${
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        }`}
      >
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          aria-label={title}
        />
        <span className="absolute inset-0 rounded-full bg-fcb-border transition-colors peer-checked:bg-fcb-blue peer-focus-visible:ring-2 peer-focus-visible:ring-fcb-blue peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-fcb-surface" />
        <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
      </label>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: keine Fehler. (Die Komponente wird noch nirgends gerendert — das ist ok, Task 4 verdrahtet sie.)

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: keine Fehler/Warnungen.

- [ ] **Step 4: Commit**

```bash
git add src/components/consent/CookieBanner.tsx
git commit -m "feat(consent): CookieBanner-UI (collapsed Banner + granulare Einstellungen, fcb-Tokens, Framer Motion)"
```

---

## Task 4: Provider + Banner in die App einhängen

**Files:**
- Modify: `src/components/ConditionalChrome.tsx`

Den `ConsentProvider` um Header/main/Footer legen und das `CookieBanner` darin rendern. Dadurch hat auch der Footer (Task 5) Zugriff auf `useConsent`.

- [ ] **Step 1: ConditionalChrome ersetzen**

Replace the entire content of `src/components/ConditionalChrome.tsx` with:

```tsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ConsentProvider } from "@/components/consent/ConsentProvider";
import CookieBanner from "@/components/consent/CookieBanner";

/**
 * Rendert die globale Chrome (Header + main-Padding + Footer) um alle Routen.
 * Seit Einführung der DSGVO-Consent-Verwaltung umschließt der ConsentProvider
 * die gesamte Chrome – so können Header, Footer und alle Seiten-Inhalte den
 * Consent-Status über useConsent() lesen. Das CookieBanner wird global (z-60,
 * über allem) innerhalb des Providers gerendert.
 */
export default function ConditionalChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConsentProvider>
      <Header />
      <main className="pt-14">{children}</main>
      <Footer />
      <CookieBanner />
    </ConsentProvider>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: keine Fehler.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: keine Fehler/Warnungen.

- [ ] **Step 4: Manueller Browser-Check (Erstbesuch)**

```bash
npm run dev
```
1. Browser öffnen, in einem **privaten Fenster** (frischer `localStorage`) `http://localhost:3000` aufrufen.
2. Erwartung: Banner fährt von unten ein, zeigt „Datenschutz-Einstellungen", drei Buttons.
3. „Alle akzeptieren" klicken → Banner verschwindet (Slide-out nach unten).
4. Seite neu laden → Banner erscheint **nicht** mehr.
5. In DevTools → Application → Local Storage prüfen: Key `fcb_consent_v1`, Wert `{"notwendig":true,"externeInhalte":true}`.
6. Fehlerindikator: Banner erscheint trotz gespeichertem Consent erneut, oder Konsolenfehler „useConsent muss innerhalb …".

- [ ] **Step 5: Commit**

```bash
git add src/components/ConditionalChrome.tsx
git commit -m "feat(consent): ConsentProvider + CookieBanner global in ConditionalChrome einhängen"
```

---

## Task 5: Footer-Button „Cookie-Einstellungen"

**Files:**
- Modify: `src/components/Footer.tsx`

Im bestehenden „Rechtliches"-Block unter den Links „Impressum"/„Datenschutz" einen Button ergänzen, der die Einstellungen erneut öffnet. Footer ist bereits ein Client-Component (`"use client"`) und liegt innerhalb des Providers.

- [ ] **Step 1: Import ergänzen**

In `src/components/Footer.tsx`, in den Imports oben (nach der `BrandIcons`-Zeile) ergänzen:

```tsx
import { useConsent } from "@/components/consent/ConsentProvider";
```

- [ ] **Step 2: Hook in der Komponente nutzen**

In `src/components/Footer.tsx`, direkt nach `export default function Footer() {` als erste Zeile einfügen:

```tsx
  // Öffnet das Cookie-Banner erneut – ohne Reload oder Cookie-Löschen.
  const { openSettings } = useConsent();
```

- [ ] **Step 3: Button im „Rechtliches"-Block ergänzen**

In `src/components/Footer.tsx`, innerhalb der „Spalte 2: Rechtliches", **unmittelbar nach** dem schließenden `</Link>` des Datenschutz-Links (vor dem schließenden `</div>` der Spalte) einfügen:

```tsx
          {/* Cookie-Einstellungen jederzeit erneut öffnen (kein Reload nötig).
              Button statt Link, da es eine In-App-Aktion ist, keine Navigation. */}
          <button
            type="button"
            onClick={openSettings}
            className="w-fit text-left font-inter text-sm text-fcb-muted transition-colors hover:text-fcb-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue"
          >
            Cookie-Einstellungen
          </button>
```

Zur Orientierung — der „Rechtliches"-Block sieht danach so aus (gekürzt):

```tsx
        <div className="flex flex-col gap-2">
          <h3 className="font-oswald ...">Rechtliches</h3>
          <Link href="/impressum" ...>Impressum</Link>
          <Link href="/datenschutz" ...>Datenschutz</Link>
          <button type="button" onClick={openSettings} ...>Cookie-Einstellungen</button>
        </div>
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: keine Fehler.

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: keine Fehler/Warnungen.

- [ ] **Step 6: Manueller Browser-Check (Reopen)**

Bei laufendem `npm run dev`:
1. `http://localhost:3000` aufrufen (Consent bereits gesetzt aus Task 4 → kein Banner).
2. Zum Footer scrollen → unter „Datenschutz" steht „Cookie-Einstellungen".
3. Klick → Banner fährt wieder ein.
4. „Einstellungen" klicken → Detailansicht klappt auf, „Externe Inhalte"-Schalter spiegelt den gespeicherten Wert.
5. Schalter umlegen → „Auswahl speichern" → Banner schließt, `localStorage` zeigt neuen Wert.
6. Fehlerindikator: Button reagiert nicht, oder Konsolenfehler.

- [ ] **Step 7: Commit**

```bash
git add src/components/Footer.tsx
git commit -m "feat(consent): Footer-Button 'Cookie-Einstellungen' öffnet Banner erneut"
```

---

## Task 6: ConsentGate-Komponente

**Files:**
- Create: `src/components/consent/ConsentGate.tsx`

Wiederverwendbares Gate: rendert Kinder nur bei Consent für „Externe Inhalte", sonst einen Platzhalter mit Hinweis und Button, der die Einstellungen öffnet. Für alle künftigen Drittanbieter-Einbettungen.

- [ ] **Step 1: Datei anlegen**

Create `src/components/consent/ConsentGate.tsx`:

```tsx
"use client";

import { Lock } from "lucide-react";
import { useConsent } from "@/components/consent/ConsentProvider";

/**
 * Rendert externen/Drittanbieter-Inhalt nur, wenn Consent für "Externe Inhalte"
 * vorliegt. Andernfalls erscheint ein Platzhalter mit Hinweis und einem Button,
 * der die Cookie-Einstellungen erneut öffnet. Gedacht als Wrapper für alle
 * künftigen Einbettungen (Live-Scores, Tabellen-Widgets etc.).
 *
 * Verwendung:
 *   <ConsentGate titel="Live-Ergebnisse">
 *     <LiveScoreWidget />
 *   </ConsentGate>
 */
export default function ConsentGate({
  children,
  titel = "Dieser externe Inhalt",
}: {
  children: React.ReactNode;
  /** Name des Anbieters/Inhalts für den Platzhaltertext. */
  titel?: string;
}) {
  const { hasConsent, openSettings, isLoaded } = useConsent();

  // Bis localStorage gelesen ist nichts anzeigen – verhindert ein kurzes
  // Aufblitzen des Platzhalters, obwohl Consent bereits erteilt wurde.
  if (!isLoaded) return null;

  // Consent vorhanden → echten Inhalt rendern.
  if (hasConsent("externeInhalte")) {
    return <>{children}</>;
  }

  // Kein Consent → Platzhalter mit Hinweis und Reopen-Button.
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-fcb-border bg-fcb-surface p-6 text-center">
      <Lock className="h-6 w-6 text-fcb-muted" />
      <p className="font-inter text-sm text-fcb-muted">
        {titel} wird ausgeblendet, weil du externe Inhalte noch nicht erlaubt
        hast.
      </p>
      <button
        type="button"
        onClick={openSettings}
        className="rounded-lg bg-fcb-blue px-4 py-2 font-inter text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue focus-visible:ring-offset-2 focus-visible:ring-offset-fcb-surface"
      >
        Externe Inhalte erlauben
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: keine Fehler.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: keine Fehler/Warnungen.

- [ ] **Step 4: Commit**

```bash
git add src/components/consent/ConsentGate.tsx
git commit -m "feat(consent): wiederverwendbare ConsentGate-Komponente für Drittanbieter-Einbettungen"
```

---

## Task 7: Integrationsverifikation des ConsentGate (temporärer Test, nicht committen)

**Files:**
- Modify (temporär): `src/app/page.tsx`

Das Gate hat noch keinen echten Konsumenten. Verifikation über einen temporären Einbau auf der Homepage, der nach dem Test wieder entfernt wird (es soll noch kein sichtbares Feature deployt werden).

- [ ] **Step 1: Temporären Gate-Einbau auf der Homepage ergänzen**

In `src/app/page.tsx` die `ConsentGate`-Komponente importieren und irgendwo im sichtbaren Bereich des gerenderten JSX (z. B. ganz am Anfang des äußersten Wrappers) einfügen:

```tsx
import ConsentGate from "@/components/consent/ConsentGate";
```

```tsx
{/* TEMPORÄR – nur zur Verifikation, vor Commit wieder entfernen */}
<ConsentGate titel="Test-Widget">
  <div className="p-6 text-center text-fcb-text">Externer Inhalt sichtbar ✔</div>
</ConsentGate>
```

> Hinweis: `src/app/page.tsx` ist eine Server-Component. `ConsentGate` ist `"use client"` und darf aus einer Server-Component gerendert werden — das funktioniert. Falls `page.tsx` Server-seitig keine JSX-Kinder mit Client-Component erlaubt (z. B. wegen Serialisierung von Props), den Test-Inhalt als reines statisches `<div>` wie oben halten (keine Funktions-Props).

- [ ] **Step 2: Manueller Browser-Check (Gate beide Zustände)**

Bei laufendem `npm run dev`:
1. `localStorage` leeren (DevTools → Application → Local Storage → `fcb_consent_v1` löschen) und Seite neu laden.
2. Banner erscheint. „Nur Notwendiges" klicken.
3. Erwartung am Gate: **Platzhalter** mit Schloss-Icon, Text „Test-Widget wird ausgeblendet …" und Button „Externe Inhalte erlauben".
4. Button klicken → Banner öffnet → „Einstellungen" → „Externe Inhalte" einschalten → „Auswahl speichern".
5. Erwartung am Gate: jetzt der echte Inhalt „Externer Inhalt sichtbar ✔".
6. Seite neu laden → echter Inhalt bleibt sichtbar (Consent persistiert).
7. Footer → „Cookie-Einstellungen" → „Externe Inhalte" wieder ausschalten → speichern → Gate zeigt wieder Platzhalter (ohne Reload).
8. Fehlerindikator: Platzhalter und Inhalt erscheinen gleichzeitig, oder Wechsel braucht einen Reload.

- [ ] **Step 3: Temporären Einbau wieder entfernen**

Den `import ConsentGate …` und den `<ConsentGate>…</ConsentGate>`-Block aus `src/app/page.tsx` rückstandslos entfernen.

- [ ] **Step 4: Sicherstellen, dass page.tsx wieder unverändert ist**

Run: `git diff src/app/page.tsx`
Expected: **leer** (keine Änderung übrig).

- [ ] **Step 5: Abschluss-Gate**

Run: `npx tsc --noEmit && npm run lint`
Expected: beide ohne Fehler.

> Kein Commit in dieser Task — sie war reine Verifikation und hinterlässt keine Änderung.

---

## Self-Review (vom Plan-Autor durchgeführt)

**Spec-Abdeckung:**
- A (Consent-State + Speicherung) → Task 1 (`lib/consent.ts`) + Task 2 (`ConsentProvider`). Kategorien „Notwendig" (immer an) + „Externe Inhalte" (Opt-in) ✓, Persistenz via `localStorage` ✓, abfragbar via `useConsent().hasConsent` für alle Komponenten ✓.
- B (Banner-UI) → Task 3 + Verifikation Task 4. Erstbesuch-Trigger (`isOpen = consent === null`) ✓, „Alle akzeptieren" / „Nur Notwendiges" / granulare Einstellungen ✓, fcb-Stil + deutsche Texte + Framer Motion ✓.
- C (Einstellungen erneut zugänglich) → Task 5, Footer-Button `openSettings()`, ohne Reload/Cookie-Löschen ✓.
- D (Consent-Gate) → Task 6 + Verifikation Task 7. Rendert Inhalt nur bei Consent, sonst Platzhalter mit Link/Button zu den Einstellungen ✓.
- Rahmen: keine neuen Deps (nur vorhandenes `framer-motion`/`lucide-react`) ✓, nur fcb-Tokens ✓, `tsc`+`lint` als Gate ✓, Footer/Layout minimal angepasst (je 1 Datei) ✓.

**Platzhalter-Scan:** Keine TBD/TODO/„add error handling"-Platzhalter; jeder Code-Step enthält vollständigen Code.

**Typ-Konsistenz:** `ConsentState`, `CONSENT_ALL`, `CONSENT_ESSENTIAL`, `loadConsent`, `saveConsent`, `CONSENT_STORAGE_KEY` (Task 1) werden in Task 2 identisch importiert. `useConsent()`-Felder (`isOpen`, `isLoaded`, `consent`, `acceptAll`, `acceptEssential`, `savePreferences`, `openSettings`, `hasConsent`) sind in Provider, Banner, Footer und Gate konsistent benannt. `hasConsent("externeInhalte")` passt zum Feldnamen in `ConsentState`.

---

## Claudian-Update (nach Abschluss aller Tasks ausgeben)

Nach Task 7 ist das Claudian-Update gemäß CLAUDE.md-Format auszugeben (Implementiert / Manuell zu testen / Getestet / Offen / Technische Notizen). Die „Manuell zu testen"-Schritte ergeben sich aus den Browser-Checks der Tasks 4, 5 und 7.
