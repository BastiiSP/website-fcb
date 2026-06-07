# Auth-Bereich – Navbar-Button + Dropdown Varianten – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Parallelisierung:** Nach **Phase 0** (einmalig, durch den Orchestrator) sind **Track 1** (Navbar) und **Track 2** (Dropdown) vollständig additiv und teilen keine Datei mehr. Sie können von zwei SubAgents parallel ausgeführt werden (siehe superpowers:dispatching-parallel-agents). **Phase 3** läuft erst, wenn beide Tracks fertig sind.

**Goal:** Zwei Preview-Routen `/navbar-preview` und `/dropdown-preview` bauen, die je 3 klar unterschiedliche Design-Varianten des Auth-Einstiegs (sichtbarer Navbar-Button bzw. aufgeklapptes Dropdown) mit Switcher nebeneinander vergleichbar machen – damit Basti eine Navbar- + eine Dropdown-Variante auswählen kann, bevor die finale Kombination auf `main` gemergt wird.

**Architecture:** Exakt das bestehende `/footer-preview`-Muster wiederverwenden: `layout.tsx` (Metadata + sticky `Switcher` + Full-Bleed-Wrapper), `page.tsx` (`redirect()` auf erste Variante), client-seitiger `Switcher` (`usePathname`), pro Variante eine `<slug>/page.tsx`. Variantendarstellung über **reine Server-Komponenten** (kein State, keine echte Auth – statische Mock-Panels mit Dummy-Daten). Die globale Header/Footer-Chrome wird für beide neuen Routen in `ConditionalChrome.tsx` ausgeblendet.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript strict, Tailwind 3 (`fcb-*`-Tokens), Lucide-Icons. Keine neuen Abhängigkeiten.

---

## Wichtige Konventionen (verbindlich für alle Tasks)

- **Branch:** `design-round-2` (vorhanden). **Kein** Push/Merge auf `main`.
- **Nur `fcb-*`-Tokens**, keine magic hex-values. Navbar-Hintergrund = `bg-fcb-nav`. Surface = `bg-fcb-surface`. Akzent = `bg-fcb-blue` / `text-fcb-red`.
- **Fonts:** `font-oswald` (Headlines/Display), `font-inter` (UI/Text). NICHT `font-display`/`font-sans` schreiben – im Projekt werden die Variable-Font-Klassen `font-oswald`/`font-inter` verwendet.
- **Nur Lucide-Icons** (`lucide-react`). `BrandIcons` (Facebook/Instagram) werden hier nicht gebraucht.
- **Alle UI-Texte, Kommentare, Variantenbeschreibungen auf Deutsch.**
- **`UserDropdown.tsx` bleibt unverändert.**
- **Mocks sind nicht-interaktiv:** Buttons/Links als `<span>`/`<div>` darstellen (rein visuell, „kein echter Klick nötig"). Dadurch bleiben alle Varianten-Komponenten **Server-Komponenten** (kein `"use client"`). Einzige Client-Komponenten sind die beiden `Switcher` (wegen `usePathname`).
- **Kommentare:** Das *Warum*/den *Kontext* kommentieren, nicht das *Was* (CLAUDE.md-Regel).

## Warum keine Unit-Tests in diesem Plan

Das Repo hat **kein** Test-Runner-Setup (`jest`/`vitest`/`playwright`/`@testing-library` sind nicht installiert; einziges Lint-/Test-Skript ist `eslint .`). Diese Routen sind **rein präsentationale Design-Exploration ohne Logik** (statische Mocks, keine Datenflüsse, kein State). Das `/footer-preview`-Pendant wurde nach demselben Muster ohne Tests ausgeliefert. Verifikation pro Task erfolgt daher über **Typecheck (`tsc --noEmit`) + Lint (`eslint`)**; Integrationsgate ist der **Vercel-Preview-Build** (Phase 3). Lokales `next build` ist im Projekt bekanntermaßen durch eine Turbopack+FullCalendar-Inkompatibilität gebrochen und wird **nicht** als lokales Gate verwendet.

---

## File Structure

### Phase 0 – geteilte Voraussetzung (einmalig)
- Modify: `src/components/ConditionalChrome.tsx` — `/navbar-preview` **und** `/dropdown-preview` zur Ausschlussliste hinzufügen.

### Track 1 – Navbar (SubAgent 1)
Geteilte Mock-Bausteine + Varianten unter `src/components/auth-preview/navbar/`:
- `NavbarMock.tsx` — Mock-Navbar-Leiste (zinc-Bar, Logo links, Auth-Slot rechts).
- `AvatarKreis.tsx` — eingeloggter Trigger (Initialen-Kreis), in allen Varianten gleich.
- `PreviewStage.tsx` — zwei beschriftete Panels („Ausgeloggt" / „Eingeloggt") im responsiven Grid.
- `NavbarSingleCTA.tsx` — Variante A (ein blauer Pill-Button).
- `NavbarSplit.tsx` — Variante B (Ghost „Anmelden" + gefüllt „Registrieren").
- `NavbarTextlinks.tsx` — Variante C (Textlinks „Anmelden · Registrieren").

Route-Gerüst unter `src/app/navbar-preview/`:
- `layout.tsx`, `page.tsx` (redirect → `/navbar-preview/single-cta`)
- `_components/NavbarSwitcher.tsx` (client)
- `single-cta/page.tsx`, `split/page.tsx`, `textlinks/page.tsx`

### Track 2 – Dropdown (SubAgent 2)
Geteilte Mock-Bausteine + Varianten unter `src/components/auth-preview/dropdown/`:
- `DropdownShell.tsx` — Panel-Hülle (mimt `Menu.Items`: gerundet, `bg-fcb-surface`, Border, Shadow).
- `DropdownStage.tsx` — zwei beschriftete Panels („Ausgeloggt-Dropdown" / „Eingeloggt-Dropdown").
- `dummyUser.ts` — Dummy-Daten (Max Mustermann).
- `DropdownGegliedert.tsx` — Variante A (Header + abgesetzter Login + Trennlinie + Registrieren).
- `DropdownKompakt.tsx` — Variante B (kein Header, flache Liste).
- `DropdownCard.tsx` — Variante C (Wappen/Avatar oben, Aktionen mit Beschreibungstext).

Route-Gerüst unter `src/app/dropdown-preview/`:
- `layout.tsx`, `page.tsx` (redirect → `/dropdown-preview/gegliedert`)
- `_components/DropdownSwitcher.tsx` (client)
- `gegliedert/page.tsx`, `kompakt/page.tsx`, `card/page.tsx`

---

## Phase 0 – Geteilte Voraussetzung (Orchestrator, einmalig)

> **Hinweis zur Spec-Abweichung:** Die Aufgabe schlägt vor, dass *jeder* SubAgent „seinen eigenen Pfad" in `ConditionalChrome` ergänzt. Bei paralleler Ausführung würden beide dieselbe Datei gleichzeitig editieren → Merge-/Race-Konflikt. Stattdessen ergänzt der Orchestrator **beide** Pfade in **einem** Edit, *bevor* die Tracks dispatcht werden. Danach teilen die Tracks keine Datei mehr.

### Task 0: ConditionalChrome um beide Preview-Routen erweitern

**Files:**
- Modify: `src/components/ConditionalChrome.tsx:24-27`

- [ ] **Step 1: `isPreviewRoute` um beide neuen Pfade erweitern**

Ersetze in `src/components/ConditionalChrome.tsx` den Block:

```tsx
  const pathname = usePathname() ?? "";
  // Preview-Routen mit eigenem Full-Bleed-Layout (Design-Exploration):
  // /variants/* (Hero, historisch) und /footer-preview/* (Footer-Varianten, Runde 2).
  const isPreviewRoute =
    pathname.startsWith("/variants") || pathname.startsWith("/footer-preview");
```

durch:

```tsx
  const pathname = usePathname() ?? "";
  // Preview-Routen mit eigenem Full-Bleed-Layout (Design-Exploration):
  // /variants/* (Hero, historisch), /footer-preview/* (Footer-Varianten, Runde 2)
  // sowie /navbar-preview/* + /dropdown-preview/* (Auth-Bereich-Varianten, Runde 2).
  const isPreviewRoute =
    pathname.startsWith("/variants") ||
    pathname.startsWith("/footer-preview") ||
    pathname.startsWith("/navbar-preview") ||
    pathname.startsWith("/dropdown-preview");
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: kein Fehler (Exit 0).

- [ ] **Step 3: Lint der geänderten Datei**

Run: `npx eslint src/components/ConditionalChrome.tsx`
Expected: keine Ausgabe (Exit 0).

- [ ] **Step 4: Commit**

```bash
git add src/components/ConditionalChrome.tsx
git commit -m "feat(auth-preview): Chrome für /navbar-preview und /dropdown-preview ausblenden"
```

---

## Track 1 – Navbar-Button Varianten (SubAgent 1)

> Zuständigkeit: ausschließlich `src/app/navbar-preview/**` und `src/components/auth-preview/navbar/**`. Keine andere Datei anfassen.

### Task 1.1: Geteilte Navbar-Mock-Bausteine

**Files:**
- Create: `src/components/auth-preview/navbar/NavbarMock.tsx`
- Create: `src/components/auth-preview/navbar/AvatarKreis.tsx`
- Create: `src/components/auth-preview/navbar/PreviewStage.tsx`

- [ ] **Step 1: `NavbarMock.tsx` anlegen** (Server-Komponente – repräsentative Navbar-Leiste mit Auth-Slot rechts)

```tsx
import type { ReactNode } from "react";

/**
 * Repräsentative Mock-Navbar für die Varianten-Vorschau: zinc-Leiste (bg-fcb-nav)
 * mit Logo-Platzhalter links und einem Auth-Slot rechts. Zeigt jede Variante im
 * realistischen Navbar-Kontext, ohne die echte Navigation einzubinden.
 */
export default function NavbarMock({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-14 w-full items-center justify-between rounded-lg border border-fcb-border bg-fcb-nav px-4">
      {/* Logo-Platzhalter links – steht für Wappen + Vereinskürzel */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-fcb-blue" aria-hidden />
        <span className="font-oswald text-sm font-semibold uppercase tracking-wide text-white">
          FCB
        </span>
      </div>
      {/* Auth-Bereich rechts – hier rendert die jeweilige Variante */}
      <div className="flex items-center gap-3">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: `AvatarKreis.tsx` anlegen** (eingeloggter Trigger – in allen Varianten identisch)

```tsx
/**
 * Eingeloggter Navbar-Trigger: Initialen-Kreis (Avatar-Platzhalter).
 * In allen drei Varianten gleich – der Unterschied liegt im ausgeloggten Zustand.
 */
export default function AvatarKreis() {
  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-full bg-fcb-blue font-inter text-sm font-bold text-white"
      aria-hidden
    >
      MM
    </div>
  );
}
```

- [ ] **Step 3: `PreviewStage.tsx` anlegen** (zwei beschriftete Vergleichs-Panels)

```tsx
import type { ReactNode } from "react";

/**
 * Vergleichsbühne für eine Navbar-Variante: zeigt „Ausgeloggt" und „Eingeloggt"
 * als zwei beschriftete Panels nebeneinander (auf Mobile gestapelt).
 */
export default function PreviewStage({
  beschreibung,
  ausgeloggt,
  eingeloggt,
}: {
  beschreibung: string;
  ausgeloggt: ReactNode;
  eingeloggt: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <p className="mx-auto mb-8 max-w-2xl text-center font-inter text-sm text-fcb-muted">
        {beschreibung}
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        <Panel titel="Ausgeloggt">{ausgeloggt}</Panel>
        <Panel titel="Eingeloggt">{eingeloggt}</Panel>
      </div>
    </div>
  );
}

function Panel({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-fcb-border bg-fcb-surface/40 p-5">
      <span className="mb-4 block font-inter text-xs uppercase tracking-widest text-fcb-muted">
        {titel}
      </span>
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: kein Fehler (Exit 0).

- [ ] **Step 5: Lint**

Run: `npx eslint src/components/auth-preview/navbar/`
Expected: keine Ausgabe (Exit 0).

- [ ] **Step 6: Commit**

```bash
git add src/components/auth-preview/navbar/NavbarMock.tsx src/components/auth-preview/navbar/AvatarKreis.tsx src/components/auth-preview/navbar/PreviewStage.tsx
git commit -m "feat(navbar-preview): geteilte Mock-Bausteine (NavbarMock, AvatarKreis, PreviewStage)"
```

---

### Task 1.2: Navbar-Varianten A/B/C

**Files:**
- Create: `src/components/auth-preview/navbar/NavbarSingleCTA.tsx`
- Create: `src/components/auth-preview/navbar/NavbarSplit.tsx`
- Create: `src/components/auth-preview/navbar/NavbarTextlinks.tsx`

- [ ] **Step 1: `NavbarSingleCTA.tsx` anlegen** (Variante A)

```tsx
import { LogIn } from "lucide-react";
import NavbarMock from "./NavbarMock";
import AvatarKreis from "./AvatarKreis";
import PreviewStage from "./PreviewStage";

/**
 * Variante A – Single CTA: ein gefüllter blauer Pill-Button „Anmelden".
 * Der Klick würde das Dropdown öffnen (siehe /dropdown-preview).
 */
export default function NavbarSingleCTA() {
  return (
    <PreviewStage
      beschreibung="Variante A – Single CTA: Ein gefüllter blauer Pill-Button „Anmelden“. Ein klarer Einstieg; der Klick öffnet das Dropdown (siehe /dropdown-preview)."
      ausgeloggt={
        <NavbarMock>
          {/* Rein visueller Mock – span statt button (kein echter Klick nötig) */}
          <span className="flex cursor-default items-center gap-1.5 rounded-full border border-fcb-blue bg-fcb-blue px-3 py-1.5 font-inter text-sm font-medium text-white">
            <LogIn className="h-4 w-4" />
            <span>Anmelden</span>
          </span>
        </NavbarMock>
      }
      eingeloggt={
        <NavbarMock>
          <AvatarKreis />
        </NavbarMock>
      }
    />
  );
}
```

- [ ] **Step 2: `NavbarSplit.tsx` anlegen** (Variante B)

```tsx
import { UserPlus } from "lucide-react";
import NavbarMock from "./NavbarMock";
import AvatarKreis from "./AvatarKreis";
import PreviewStage from "./PreviewStage";

/**
 * Variante B – Split: zwei Buttons direkt in der Navbar sichtbar.
 * „Anmelden" als Ghost-Button, „Registrieren" gefüllt. Kein Dropdown für Besucher.
 */
export default function NavbarSplit() {
  return (
    <PreviewStage
      beschreibung="Variante B – Split: Zwei Buttons direkt sichtbar – „Anmelden“ als Ghost-Button, „Registrieren“ gefüllt. Kein Dropdown für Besucher nötig."
      ausgeloggt={
        <NavbarMock>
          {/* Ghost-Button – nur Text, transparenter Hintergrund */}
          <span className="cursor-default rounded-full px-3 py-1.5 font-inter text-sm font-medium text-white/90">
            Anmelden
          </span>
          {/* Gefüllter Button für die Primäraktion Registrieren */}
          <span className="flex cursor-default items-center gap-1.5 rounded-full bg-fcb-blue px-3 py-1.5 font-inter text-sm font-medium text-white">
            <UserPlus className="h-4 w-4" />
            <span>Registrieren</span>
          </span>
        </NavbarMock>
      }
      eingeloggt={
        <NavbarMock>
          <AvatarKreis />
        </NavbarMock>
      }
    />
  );
}
```

- [ ] **Step 3: `NavbarTextlinks.tsx` anlegen** (Variante C)

```tsx
import NavbarMock from "./NavbarMock";
import AvatarKreis from "./AvatarKreis";
import PreviewStage from "./PreviewStage";

/**
 * Variante C – Textlinks: zwei dezente Textlinks mit Trennzeichen.
 * Minimal, kein Button-Styling.
 */
export default function NavbarTextlinks() {
  return (
    <PreviewStage
      beschreibung="Variante C – Textlinks: Zwei dezente Textlinks „Anmelden · Registrieren“. Sehr minimal, kein Button-Styling."
      ausgeloggt={
        <NavbarMock>
          <div className="flex items-center gap-2 font-inter text-sm text-white/90">
            <span className="cursor-default">Anmelden</span>
            <span aria-hidden className="text-white/40">
              ·
            </span>
            <span className="cursor-default">Registrieren</span>
          </div>
        </NavbarMock>
      }
      eingeloggt={
        <NavbarMock>
          <AvatarKreis />
        </NavbarMock>
      }
    />
  );
}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: kein Fehler (Exit 0).

- [ ] **Step 5: Lint**

Run: `npx eslint src/components/auth-preview/navbar/`
Expected: keine Ausgabe (Exit 0).

- [ ] **Step 6: Commit**

```bash
git add src/components/auth-preview/navbar/NavbarSingleCTA.tsx src/components/auth-preview/navbar/NavbarSplit.tsx src/components/auth-preview/navbar/NavbarTextlinks.tsx
git commit -m "feat(navbar-preview): Varianten A (Single CTA), B (Split), C (Textlinks)"
```

---

### Task 1.3: Navbar-Route-Gerüst (Layout, Switcher, Variantenseiten)

**Files:**
- Create: `src/app/navbar-preview/_components/NavbarSwitcher.tsx`
- Create: `src/app/navbar-preview/layout.tsx`
- Create: `src/app/navbar-preview/page.tsx`
- Create: `src/app/navbar-preview/single-cta/page.tsx`
- Create: `src/app/navbar-preview/split/page.tsx`
- Create: `src/app/navbar-preview/textlinks/page.tsx`

- [ ] **Step 1: `_components/NavbarSwitcher.tsx` anlegen** (Client – sticky Vergleichs-Leiste, Muster aus `FooterSwitcher`)

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Dünne Top-Leiste zum Wechseln zwischen den Navbar-Button-Varianten.
 * Muster übernommen vom FooterSwitcher (/footer-preview).
 */
const VARIANTS = [
  { slug: "single-cta", label: "Single CTA" },
  { slug: "split", label: "Split" },
  { slug: "textlinks", label: "Textlinks" },
];

export default function NavbarSwitcher() {
  const pathname = usePathname() ?? "";

  return (
    <div className="sticky top-0 z-[100] w-full border-b border-fcb-border bg-fcb-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-xs">
        <span className="font-inter uppercase tracking-widest text-fcb-muted">
          FCB · Navbar-Varianten
        </span>
        <nav className="flex items-center gap-1">
          {VARIANTS.map((v) => {
            const href = `/navbar-preview/${v.slug}`;
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "rounded-full px-3 py-1 font-inter font-medium transition-colors",
                  isActive
                    ? "bg-fcb-blue text-white"
                    : "text-fcb-muted hover:bg-fcb-surface hover:text-fcb-text",
                ].join(" ")}
              >
                {v.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `layout.tsx` anlegen** (Full-Bleed-Chrome mit Switcher)

```tsx
import type { Metadata } from "next";
import NavbarSwitcher from "./_components/NavbarSwitcher";

/**
 * Layout für die Navbar-Button-Design-Exploration unter /navbar-preview/*.
 * Eigenes Full-Bleed-Chrome (Switcher oben); die globale Header/Footer-Chrome
 * ist für diese Route in ConditionalChrome ausgeblendet.
 */
export const metadata: Metadata = {
  title: "FCB · Navbar-Varianten",
  description: "Vergleich der Auth-Buttons in der Navbar (Design-Runde 2).",
};

export default function NavbarPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-fcb-bg font-inter text-fcb-text antialiased">
      <NavbarSwitcher />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
```

- [ ] **Step 3: `page.tsx` anlegen** (Redirect auf erste Variante)

```tsx
import { redirect } from "next/navigation";

// Bare /navbar-preview leitet auf die erste Variante weiter.
export default function NavbarPreviewIndex() {
  redirect("/navbar-preview/single-cta");
}
```

- [ ] **Step 4: `single-cta/page.tsx` anlegen**

```tsx
import NavbarSingleCTA from "@/components/auth-preview/navbar/NavbarSingleCTA";

export default function NavbarSingleCTAPage() {
  return <NavbarSingleCTA />;
}
```

- [ ] **Step 5: `split/page.tsx` anlegen**

```tsx
import NavbarSplit from "@/components/auth-preview/navbar/NavbarSplit";

export default function NavbarSplitPage() {
  return <NavbarSplit />;
}
```

- [ ] **Step 6: `textlinks/page.tsx` anlegen**

```tsx
import NavbarTextlinks from "@/components/auth-preview/navbar/NavbarTextlinks";

export default function NavbarTextlinksPage() {
  return <NavbarTextlinks />;
}
```

- [ ] **Step 7: Typecheck**

Run: `npx tsc --noEmit`
Expected: kein Fehler (Exit 0).

- [ ] **Step 8: Lint**

Run: `npx eslint src/app/navbar-preview/`
Expected: keine Ausgabe (Exit 0).

- [ ] **Step 9: Commit**

```bash
git add src/app/navbar-preview/
git commit -m "feat(navbar-preview): Route /navbar-preview mit Switcher + 3 Variantenseiten"
```

---

## Track 2 – Dropdown Varianten (SubAgent 2)

> Zuständigkeit: ausschließlich `src/app/dropdown-preview/**` und `src/components/auth-preview/dropdown/**`. Keine andere Datei anfassen.

### Task 2.1: Geteilte Dropdown-Bausteine + Dummy-Daten

**Files:**
- Create: `src/components/auth-preview/dropdown/dummyUser.ts`
- Create: `src/components/auth-preview/dropdown/DropdownShell.tsx`
- Create: `src/components/auth-preview/dropdown/DropdownStage.tsx`

- [ ] **Step 1: `dummyUser.ts` anlegen** (Dummy-Daten für den eingeloggten Zustand)

```ts
// Dummy-Nutzer für die eingeloggten Dropdown-Mocks (rein zur Darstellung).
export const DUMMY_USER = {
  name: "Max Mustermann",
  email: "max.mustermann@example.com",
  initials: "MM",
} as const;
```

- [ ] **Step 2: `DropdownShell.tsx` anlegen** (Panel-Hülle, mimt `Menu.Items` aus `UserDropdown`)

```tsx
import type { ReactNode } from "react";

/**
 * Hülle für ein aufgeklapptes Dropdown-Mock. Übernimmt das Aussehen der echten
 * Menu.Items aus UserDropdown (gerundet, bg-fcb-surface, Border, Shadow).
 * Breite per className überschreibbar (Default w-64).
 */
export default function DropdownShell({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={[
        "overflow-hidden rounded-lg border border-fcb-border bg-fcb-surface text-fcb-text shadow-lg",
        className ?? "w-64",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: `DropdownStage.tsx` anlegen** (zwei beschriftete Vergleichs-Panels)

```tsx
import type { ReactNode } from "react";

/**
 * Vergleichsbühne für eine Dropdown-Variante: zeigt das aufgeklappte Dropdown
 * für „Ausgeloggt" und „Eingeloggt" als zwei beschriftete Panels nebeneinander
 * (auf Mobile gestapelt). Das Dropdown ist statisch dargestellt – kein Klick nötig.
 */
export default function DropdownStage({
  beschreibung,
  ausgeloggt,
  eingeloggt,
}: {
  beschreibung: string;
  ausgeloggt: ReactNode;
  eingeloggt: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <p className="mx-auto mb-8 max-w-2xl text-center font-inter text-sm text-fcb-muted">
        {beschreibung}
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        <Panel titel="Ausgeloggt-Dropdown">{ausgeloggt}</Panel>
        <Panel titel="Eingeloggt-Dropdown">{eingeloggt}</Panel>
      </div>
    </div>
  );
}

function Panel({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-fcb-border bg-fcb-bg p-6">
      <span className="mb-6 block font-inter text-xs uppercase tracking-widest text-fcb-muted">
        {titel}
      </span>
      {/* Dropdown zentriert darstellen – wirkt wie aufgeklappt unter der Navbar */}
      <div className="flex justify-center">{children}</div>
    </div>
  );
}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: kein Fehler (Exit 0).

- [ ] **Step 5: Lint**

Run: `npx eslint src/components/auth-preview/dropdown/`
Expected: keine Ausgabe (Exit 0).

- [ ] **Step 6: Commit**

```bash
git add src/components/auth-preview/dropdown/dummyUser.ts src/components/auth-preview/dropdown/DropdownShell.tsx src/components/auth-preview/dropdown/DropdownStage.tsx
git commit -m "feat(dropdown-preview): geteilte Bausteine (DropdownShell, DropdownStage, dummyUser)"
```

---

### Task 2.2: Dropdown-Varianten A/B/C

**Files:**
- Create: `src/components/auth-preview/dropdown/DropdownGegliedert.tsx`
- Create: `src/components/auth-preview/dropdown/DropdownKompakt.tsx`
- Create: `src/components/auth-preview/dropdown/DropdownCard.tsx`

- [ ] **Step 1: `DropdownGegliedert.tsx` anlegen** (Variante A – Header + abgesetzter Login + Trennlinie + Registrieren; eingeloggt: Name/E-Mail-Header, Profil, Abmelden)

```tsx
import { LogIn, LogOut, User, UserPlus } from "lucide-react";
import DropdownShell from "./DropdownShell";
import DropdownStage from "./DropdownStage";
import { DUMMY_USER } from "./dummyUser";

/**
 * Variante A – Gegliedert (entspricht dem aktuellen UserDropdown):
 * Header-Bereich oben, abgesetzter blauer Login-Button, Trennlinie, Registrieren-Link.
 * Eingeloggt: Name/E-Mail als Header, „Profil bearbeiten", „Abmelden" in fcb-red.
 */
export default function DropdownGegliedert() {
  return (
    <DropdownStage
      beschreibung="Variante A – Gegliedert: Header oben, abgesetzter blauer Login-Button, Trennlinie, Registrieren-Link. Klare Hierarchie, entspricht dem aktuellen Stand."
      ausgeloggt={
        <DropdownShell>
          {/* Kopf: einladender Hinweis */}
          <div className="border-b border-fcb-border px-4 py-3">
            <p className="font-inter text-sm font-semibold text-fcb-text">
              Willkommen beim FCB
            </p>
            <p className="font-inter text-xs text-fcb-muted">
              Melde dich an oder registriere dich.
            </p>
          </div>
          {/* Login-Pfad – primäre, abgesetzte Aktion */}
          <div className="p-1">
            <span className="flex items-center gap-2 rounded-md bg-fcb-blue px-3 py-2 font-inter text-sm font-medium text-white">
              <LogIn className="h-4 w-4" />
              Login
            </span>
          </div>
          {/* Registrieren-Pfad – optisch getrennt */}
          <div className="border-t border-fcb-border p-1">
            <span className="flex items-center gap-2 rounded-md px-3 py-2 font-inter text-sm text-fcb-text">
              <UserPlus className="h-4 w-4 text-fcb-muted" />
              Noch kein Konto? Registrieren
            </span>
          </div>
        </DropdownShell>
      }
      eingeloggt={
        <DropdownShell>
          {/* Kopf: Name + E-Mail */}
          <div className="border-b border-fcb-border px-4 py-3">
            <p className="font-inter text-sm font-semibold text-fcb-text">
              {DUMMY_USER.name}
            </p>
            <p className="truncate font-inter text-xs text-fcb-muted">
              {DUMMY_USER.email}
            </p>
          </div>
          {/* Aktionen */}
          <div className="p-1">
            <span className="flex items-center gap-2 rounded-md px-3 py-2 font-inter text-sm text-fcb-text">
              <User className="h-4 w-4 text-fcb-muted" />
              Profil bearbeiten
            </span>
            <span className="flex items-center gap-2 rounded-md px-3 py-2 font-inter text-sm font-medium text-fcb-red">
              <LogOut className="h-4 w-4" />
              Abmelden
            </span>
          </div>
        </DropdownShell>
      }
    />
  );
}
```

- [ ] **Step 2: `DropdownKompakt.tsx` anlegen** (Variante B – kein Header, flache Liste)

```tsx
import { LogIn, LogOut, User, UserPlus } from "lucide-react";
import DropdownShell from "./DropdownShell";
import DropdownStage from "./DropdownStage";
import { DUMMY_USER } from "./dummyUser";

/**
 * Variante B – Kompakt: kein Header-Bereich, direkt die Aktionen als flache Liste.
 * Login und Registrieren gleichwertig untereinander.
 * Eingeloggt: Name als erstes Listenelement ohne eigene Sektion.
 */
export default function DropdownKompakt() {
  return (
    <DropdownStage
      beschreibung="Variante B – Kompakt: Kein Header, direkt die Aktionen als flache Liste. Login und Registrieren gleichwertig untereinander."
      ausgeloggt={
        <DropdownShell className="w-56">
          <div className="p-1">
            <span className="flex items-center gap-2 rounded-md px-3 py-2 font-inter text-sm text-fcb-text">
              <LogIn className="h-4 w-4 text-fcb-muted" />
              Anmelden
            </span>
            <span className="flex items-center gap-2 rounded-md px-3 py-2 font-inter text-sm text-fcb-text">
              <UserPlus className="h-4 w-4 text-fcb-muted" />
              Registrieren
            </span>
          </div>
        </DropdownShell>
      }
      eingeloggt={
        <DropdownShell className="w-56">
          <div className="p-1">
            {/* Name als erstes Listenelement, leicht hervorgehoben – keine Sektion */}
            <span className="block rounded-md px-3 py-2 font-inter text-sm font-semibold text-fcb-text">
              {DUMMY_USER.name}
            </span>
            <span className="flex items-center gap-2 rounded-md px-3 py-2 font-inter text-sm text-fcb-text">
              <User className="h-4 w-4 text-fcb-muted" />
              Profil bearbeiten
            </span>
            <span className="flex items-center gap-2 rounded-md px-3 py-2 font-inter text-sm font-medium text-fcb-red">
              <LogOut className="h-4 w-4" />
              Abmelden
            </span>
          </div>
        </DropdownShell>
      }
    />
  );
}
```

- [ ] **Step 3: `DropdownCard.tsx` anlegen** (Variante C – Wappen/Avatar oben, Aktionen mit Beschreibungstext)

```tsx
import Image from "next/image";
import { LogIn, LogOut, User, UserPlus } from "lucide-react";
import DropdownShell from "./DropdownShell";
import DropdownStage from "./DropdownStage";
import { DUMMY_USER } from "./dummyUser";

/**
 * Variante C – Card-Style: Vereinswappen oben, Login & Registrieren mit kurzem
 * Beschreibungstext – wirkt wie eine Mini-Welcome-Card.
 * Eingeloggt: Avatar prominent, darunter Name + Aktionen.
 */
export default function DropdownCard() {
  return (
    <DropdownStage
      beschreibung="Variante C – Card-Style: Wappen oben, Login & Registrieren mit kurzem Beschreibungstext – wie eine Mini-Welcome-Card."
      ausgeloggt={
        <DropdownShell className="w-72">
          {/* Kopf: Wappen + Vereinsname, zentriert */}
          <div className="flex flex-col items-center gap-2 px-4 pb-3 pt-5 text-center">
            <Image src="/logo.svg" alt="FCB Wappen" width={48} height={48} />
            <p className="font-oswald text-base font-semibold uppercase tracking-wide text-fcb-text">
              1. FC 1911 Burgkunstadt
            </p>
          </div>
          {/* Aktionen mit Beschreibungstext */}
          <div className="space-y-1 p-2">
            <div className="rounded-md bg-fcb-blue px-3 py-2">
              <p className="flex items-center gap-2 font-inter text-sm font-medium text-white">
                <LogIn className="h-4 w-4" />
                Login
              </p>
              <p className="mt-0.5 pl-6 font-inter text-xs text-white/70">
                Mit deinem Konto anmelden
              </p>
            </div>
            <div className="rounded-md border border-fcb-border px-3 py-2">
              <p className="flex items-center gap-2 font-inter text-sm text-fcb-text">
                <UserPlus className="h-4 w-4 text-fcb-muted" />
                Registrieren
              </p>
              <p className="mt-0.5 pl-6 font-inter text-xs text-fcb-muted">
                Neu hier? Konto erstellen
              </p>
            </div>
          </div>
        </DropdownShell>
      }
      eingeloggt={
        <DropdownShell className="w-72">
          {/* Kopf: Avatar prominent + Name/E-Mail, zentriert */}
          <div className="flex flex-col items-center gap-2 px-4 pb-3 pt-5 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-fcb-blue font-inter text-lg font-bold text-white">
              {DUMMY_USER.initials}
            </div>
            <div>
              <p className="font-inter text-sm font-semibold text-fcb-text">
                {DUMMY_USER.name}
              </p>
              <p className="font-inter text-xs text-fcb-muted">
                {DUMMY_USER.email}
              </p>
            </div>
          </div>
          {/* Aktionen */}
          <div className="border-t border-fcb-border p-1">
            <span className="flex items-center gap-2 rounded-md px-3 py-2 font-inter text-sm text-fcb-text">
              <User className="h-4 w-4 text-fcb-muted" />
              Profil bearbeiten
            </span>
            <span className="flex items-center gap-2 rounded-md px-3 py-2 font-inter text-sm font-medium text-fcb-red">
              <LogOut className="h-4 w-4" />
              Abmelden
            </span>
          </div>
        </DropdownShell>
      }
    />
  );
}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: kein Fehler (Exit 0).

- [ ] **Step 5: Lint**

Run: `npx eslint src/components/auth-preview/dropdown/`
Expected: keine Ausgabe (Exit 0).

- [ ] **Step 6: Commit**

```bash
git add src/components/auth-preview/dropdown/DropdownGegliedert.tsx src/components/auth-preview/dropdown/DropdownKompakt.tsx src/components/auth-preview/dropdown/DropdownCard.tsx
git commit -m "feat(dropdown-preview): Varianten A (Gegliedert), B (Kompakt), C (Card-Style)"
```

---

### Task 2.3: Dropdown-Route-Gerüst (Layout, Switcher, Variantenseiten)

**Files:**
- Create: `src/app/dropdown-preview/_components/DropdownSwitcher.tsx`
- Create: `src/app/dropdown-preview/layout.tsx`
- Create: `src/app/dropdown-preview/page.tsx`
- Create: `src/app/dropdown-preview/gegliedert/page.tsx`
- Create: `src/app/dropdown-preview/kompakt/page.tsx`
- Create: `src/app/dropdown-preview/card/page.tsx`

- [ ] **Step 1: `_components/DropdownSwitcher.tsx` anlegen** (Client – sticky Vergleichs-Leiste)

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Dünne Top-Leiste zum Wechseln zwischen den Dropdown-Varianten.
 * Muster übernommen vom FooterSwitcher (/footer-preview).
 */
const VARIANTS = [
  { slug: "gegliedert", label: "Gegliedert" },
  { slug: "kompakt", label: "Kompakt" },
  { slug: "card", label: "Card-Style" },
];

export default function DropdownSwitcher() {
  const pathname = usePathname() ?? "";

  return (
    <div className="sticky top-0 z-[100] w-full border-b border-fcb-border bg-fcb-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-xs">
        <span className="font-inter uppercase tracking-widest text-fcb-muted">
          FCB · Dropdown-Varianten
        </span>
        <nav className="flex items-center gap-1">
          {VARIANTS.map((v) => {
            const href = `/dropdown-preview/${v.slug}`;
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "rounded-full px-3 py-1 font-inter font-medium transition-colors",
                  isActive
                    ? "bg-fcb-blue text-white"
                    : "text-fcb-muted hover:bg-fcb-surface hover:text-fcb-text",
                ].join(" ")}
              >
                {v.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `layout.tsx` anlegen**

```tsx
import type { Metadata } from "next";
import DropdownSwitcher from "./_components/DropdownSwitcher";

/**
 * Layout für die Dropdown-Design-Exploration unter /dropdown-preview/*.
 * Eigenes Full-Bleed-Chrome (Switcher oben); die globale Header/Footer-Chrome
 * ist für diese Route in ConditionalChrome ausgeblendet.
 */
export const metadata: Metadata = {
  title: "FCB · Dropdown-Varianten",
  description: "Vergleich der Auth-Dropdown-Designs (Design-Runde 2).",
};

export default function DropdownPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-fcb-bg font-inter text-fcb-text antialiased">
      <DropdownSwitcher />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
```

- [ ] **Step 3: `page.tsx` anlegen** (Redirect auf erste Variante)

```tsx
import { redirect } from "next/navigation";

// Bare /dropdown-preview leitet auf die erste Variante weiter.
export default function DropdownPreviewIndex() {
  redirect("/dropdown-preview/gegliedert");
}
```

- [ ] **Step 4: `gegliedert/page.tsx` anlegen**

```tsx
import DropdownGegliedert from "@/components/auth-preview/dropdown/DropdownGegliedert";

export default function DropdownGegliedertPage() {
  return <DropdownGegliedert />;
}
```

- [ ] **Step 5: `kompakt/page.tsx` anlegen**

```tsx
import DropdownKompakt from "@/components/auth-preview/dropdown/DropdownKompakt";

export default function DropdownKompaktPage() {
  return <DropdownKompakt />;
}
```

- [ ] **Step 6: `card/page.tsx` anlegen**

```tsx
import DropdownCard from "@/components/auth-preview/dropdown/DropdownCard";

export default function DropdownCardPage() {
  return <DropdownCard />;
}
```

- [ ] **Step 7: Typecheck**

Run: `npx tsc --noEmit`
Expected: kein Fehler (Exit 0).

- [ ] **Step 8: Lint**

Run: `npx eslint src/app/dropdown-preview/`
Expected: keine Ausgabe (Exit 0).

- [ ] **Step 9: Commit**

```bash
git add src/app/dropdown-preview/
git commit -m "feat(dropdown-preview): Route /dropdown-preview mit Switcher + 3 Variantenseiten"
```

---

## Phase 3 – Integrationsverifikation & Push (Orchestrator, nach beiden Tracks)

### Task 3: Gesamt-Lint, Typecheck, Push, Vercel-Preview prüfen

**Files:** keine neuen – nur Verifikation.

- [ ] **Step 1: Vollständiger Typecheck**

Run: `npx tsc --noEmit`
Expected: kein Fehler (Exit 0).

- [ ] **Step 2: Vollständiger Lint**

Run: `npm run lint`
Expected: „No ESLint warnings or errors" bzw. Exit 0.

- [ ] **Step 3: Erwartete Dateistruktur verifizieren**

Run: `find src/app/navbar-preview src/app/dropdown-preview src/components/auth-preview -type f | sort`
Expected (genau 24 Dateien):

```
src/app/dropdown-preview/_components/DropdownSwitcher.tsx
src/app/dropdown-preview/card/page.tsx
src/app/dropdown-preview/gegliedert/page.tsx
src/app/dropdown-preview/kompakt/page.tsx
src/app/dropdown-preview/layout.tsx
src/app/dropdown-preview/page.tsx
src/app/navbar-preview/_components/NavbarSwitcher.tsx
src/app/navbar-preview/single-cta/page.tsx
src/app/navbar-preview/split/page.tsx
src/app/navbar-preview/textlinks/page.tsx
src/app/navbar-preview/layout.tsx
src/app/navbar-preview/page.tsx
src/components/auth-preview/dropdown/DropdownCard.tsx
src/components/auth-preview/dropdown/DropdownGegliedert.tsx
src/components/auth-preview/dropdown/DropdownKompakt.tsx
src/components/auth-preview/dropdown/DropdownShell.tsx
src/components/auth-preview/dropdown/DropdownStage.tsx
src/components/auth-preview/dropdown/dummyUser.ts
src/components/auth-preview/navbar/AvatarKreis.tsx
src/components/auth-preview/navbar/NavbarMock.tsx
src/components/auth-preview/navbar/NavbarSingleCTA.tsx
src/components/auth-preview/navbar/NavbarSplit.tsx
src/components/auth-preview/navbar/NavbarTextlinks.tsx
src/components/auth-preview/navbar/PreviewStage.tsx
```

> (24 Dateien gesamt: 12 unter `src/app/...`, 12 unter `src/components/auth-preview/...`. Die obige Liste ist die `find`-Ausgabe; Phase 0 ändert zusätzlich `ConditionalChrome.tsx`.)

- [ ] **Step 4: Push auf `design-round-2`** (NICHT main)

```bash
git push origin design-round-2
```

- [ ] **Step 5: Vercel-Preview-Build abwarten & prüfen**

Vercel deployt automatisch eine Preview-URL für `design-round-2`. Build muss clean durchlaufen. Beide Routen auf der Preview-URL öffnen:
- `<preview-url>/navbar-preview` → leitet auf `/navbar-preview/single-cta`, Switcher zeigt 3 Varianten, je 2 Panels (Ausgeloggt/Eingeloggt). Keine globale Header/Footer-Chrome sichtbar.
- `<preview-url>/dropdown-preview` → leitet auf `/dropdown-preview/gegliedert`, Switcher zeigt 3 Varianten, je 2 Panels (Ausgeloggt-/Eingeloggt-Dropdown). Keine globale Chrome sichtbar.

Expected: Build „Ready", beide Routen rendern fehlerfrei, Switcher-Wechsel funktioniert.

- [ ] **Step 6: Claudian-Update ausgeben** (Format aus CLAUDE.md, siehe unten)

---

## Abschluss: Claudian-Update-Format (am Ende ausfüllen & ausgeben)

```
## Claudian-Update – 2026-06-06

### Implementiert
- Preview-Route /navbar-preview mit 3 Navbar-Button-Varianten (Single CTA, Split, Textlinks) + Switcher
- Preview-Route /dropdown-preview mit 3 Dropdown-Varianten (Gegliedert, Kompakt, Card-Style) + Switcher
- Jede Variante zeigt zwei Mock-Panels nebeneinander (Ausgeloggt / Eingeloggt) mit Dummy-Nutzer
- ConditionalChrome blendet die globale Chrome für beide neuen Preview-Routen aus
- UserDropdown.tsx unverändert

### Manuell zu testen
1. Vercel-Preview-URL (Branch design-round-2) öffnen → /navbar-preview aufrufen → Erwartung: leitet auf /navbar-preview/single-cta, oben Switcher mit „Single CTA · Split · Textlinks", darunter zwei Panels „Ausgeloggt" / „Eingeloggt". Keine echte Header/Footer-Navigation. Fehlerhinweis: globale Navbar/Footer sichtbar oder 404.
2. Im Switcher auf „Split" und „Textlinks" klicken → Erwartung: aktiver Tab blau, Navbar-Mock zeigt jeweils anderes Auth-Layout, Avatar-Kreis (Eingeloggt) bleibt gleich.
3. /dropdown-preview aufrufen → Erwartung: leitet auf /dropdown-preview/gegliedert, Switcher „Gegliedert · Kompakt · Card-Style", zwei Panels mit aufgeklapptem Dropdown (Ausgeloggt + Eingeloggt mit „Max Mustermann").
4. Im Switcher „Kompakt" und „Card-Style" durchklicken → Erwartung: Card-Style zeigt Wappen (logo.svg) bzw. Avatar-Kreis prominent. Fehlerhinweis: fehlendes Bild / kaputtes Layout.
5. Auf Mobilbreite prüfen → Erwartung: die zwei Panels stapeln untereinander.

### Getestet (automatisch / durch Claude)
- npx tsc --noEmit (Typecheck) ohne Fehler
- npm run lint (ESLint) ohne Fehler
- Dateistruktur via find verifiziert
- Vercel-Preview-Build „Ready" (lokales next build wird wegen bekannter Turbopack+FullCalendar-Inkompatibilität nicht als Gate genutzt)

### Offen / Nächster Block
- Basti wählt eine Navbar-Variante + eine Dropdown-Variante
- Schritt 2: finale Kombination als UserDropdown.tsx auf main übernehmen, Preview-Routen wieder entfernen

### Technische Notizen
- Alle Varianten-Komponenten sind reine Server-Komponenten (statische Mocks, kein State/keine Auth); nur die beiden Switcher sind Client-Komponenten (usePathname)
- Muster 1:1 von /footer-preview übernommen; keine neuen Abhängigkeiten
- ConditionalChrome: beide Pfade in einem Edit ergänzt (statt je SubAgent einzeln) → vermeidet Schreibkonflikt bei paralleler Ausführung
```
```
```
```
```

---

## Self-Review

**1. Spec-Abdeckung:**
- ✅ `/navbar-preview` mit 2–3 Varianten + Switcher (3 Varianten: Single CTA/Split/Textlinks)
- ✅ `/dropdown-preview` mit 2–3 Varianten + Switcher (3: Gegliedert/Kompakt/Card)
- ✅ Je Variante zwei Mock-Panels (Ausgeloggt/Eingeloggt bzw. Ausgeloggt-/Eingeloggt-Dropdown)
- ✅ Eingeloggter Avatar gleich über alle Navbar-Varianten (`AvatarKreis`)
- ✅ Dropdown eingeloggt mit Dummy „Max Mustermann" + E-Mail + Initialen (`dummyUser.ts`)
- ✅ ConditionalChrome: beide Pfade ergänzt (Phase 0)
- ✅ Getrennte Dateibereiche je SubAgent; einzige geteilte Datei (ConditionalChrome) bewusst in Phase 0 isoliert
- ✅ Branch design-round-2, kein main-Push
- ✅ Nur Lucide + fcb-*-Tokens, font-oswald/font-inter
- ✅ UserDropdown.tsx unverändert
- ✅ Vercel-Build clean als Gate
- ✅ Claudian-Update inkl. „Manuell zu testen"

**2. Placeholder-Scan:** Keine TBD/TODO/„später"/„appropriate handling". Jeder Code-Step enthält vollständigen, kopierbaren Code.

**3. Typ-/Namens-Konsistenz:** Importnamen ↔ Komponentennamen geprüft: `NavbarSingleCTA`/`NavbarSplit`/`NavbarTextlinks`, `DropdownGegliedert`/`DropdownKompakt`/`DropdownCard`, `NavbarMock`/`AvatarKreis`/`PreviewStage`, `DropdownShell`/`DropdownStage`, `DUMMY_USER` (aus `dummyUser.ts`). Slugs ↔ Ordnernamen ↔ redirect-Ziele konsistent: navbar `single-cta`/`split`/`textlinks` (redirect → single-cta), dropdown `gegliedert`/`kompakt`/`card` (redirect → gegliedert). `DropdownShell`-Prop `className` wird in Kompakt (`w-56`) und Card (`w-72`) verwendet, Default `w-64` in Gegliedert.
