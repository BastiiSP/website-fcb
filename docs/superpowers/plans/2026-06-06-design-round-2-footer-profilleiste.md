# Design-Runde 2 – Footer + Profilleiste Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Footer und Nutzer-Dropdown der FCB-Website auf das verbindliche FCB-Design (Tokens, Lucide, Oswald/Inter) anheben – Footer als 2–3 vergleichbare Varianten auf einer Vercel-Preview-URL, Profilleiste mit einladendem Anmelden-Button und sichtbarem Registrieren-Pfad.

**Architecture:** Zwei unabhängige Teilbereiche auf einem gemeinsamen Preview-Branch `design-round-2`:
- **Teil A (Footer):** Drei Footer-Varianten als eigene Komponenten unter neuen Preview-Routen `/footer-preview/{slim,zweizeilig,dreispaltig}` (Muster übernommen von den entfernten `/variants/*`-Routen), inkl. eines Switchers zum Vergleich. Gemeinsame Brand-Icon-Komponente und Footer-Daten werden geteilt. `ConditionalChrome` blendet die globale Chrome auf `/footer-preview/*` aus.
- **Teil B (UserDropdown):** Vollständiger Redesign der bestehenden `UserDropdown.tsx` – nur Design/UX, Auth-Logik unverändert.

Beide Teile berühren disjunkte Dateien (einzige Ausnahme: `ConditionalChrome.tsx`, nur von Teil A) und können von zwei SubAgents parallel bearbeitet werden.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5 (strict), Tailwind CSS 3 (fcb.*-Tokens), lucide-react@1.17.0 (ohne Brand-Glyphen → Inline-SVG), @headlessui/react v2 (Menu), Framer Motion (nur Header, nicht hier).

**Wichtige Projekt-Realität (aus Memory):** Lokaler `npm run build` schlägt wegen einer **Turbopack + FullCalendar**-Inkompatibilität fehl – **unabhängig** von diesen Änderungen. Der **verlässliche lokale Gate ist `npm run lint`**; der echte Build-Gate ist der **Vercel-Preview-Build** nach dem Push. Nicht auf einem lokal fehlschlagenden `next build` blockieren, solange der Fehler aus dem FullCalendar/Turbopack-Stack stammt.

**Design-Entscheidung (mit Basti abgestimmt):** Lucide enthält keine Facebook-/Instagram-Markenlogos mehr. Lösung = **Inline-SVG-Brand-Glyphen** als kleine lokale Komponente (`currentColor`, per className gestylt). Alle übrigen Icons sind Lucide.

**Daten (aus `FCB-Impressum-Datenschutz-Stand-Mai-2025.pdf`):**
- Vereinsname: `1. FC 1911 Burgkunstadt e.V.`
- Adresse: `Alter Postweg 10`, `96224 Burgkunstadt`
- Facebook (live im aktuellen Footer): `https://www.facebook.com/fc1911?locale=de_DE`
- Instagram (live im aktuellen Footer): `https://www.instagram.com/schuhstaedter1911`
- Copyright-Jahr: dynamisch via `new Date().getFullYear()` (2026)

---

## Task 0: Preview-Branch anlegen

**Files:** keine (nur Git)

- [ ] **Step 1: Sauberen Branch von main erstellen**

Es liegen unversionierte Dateien im Working Tree (`AGENTS.md`, `.codex/`, `package-lock.json` modifiziert). Diese NICHT committen – nur den Branch erstellen.

Run:
```bash
cd ~/Workspace/website-fcb
git checkout main
git pull --ff-only
git checkout -b design-round-2
git branch --show-current
```
Expected: Ausgabe `design-round-2`

---

# TEIL A – Footer (SubAgent 1)

## Task A1: Brand-Icon-Komponente (Facebook + Instagram als Inline-SVG)

**Files:**
- Create: `src/components/icons/BrandIcons.tsx`

- [ ] **Step 1: Komponente schreiben**

```tsx
// Markenlogos für Social-Links. Lucide enthält keine Brand-Glyphen mehr
// (Facebook/Instagram wurden aus der Bibliothek entfernt), daher Inline-SVG
// mit den offiziellen Pfaden. Styling läuft über className (Größe) und
// currentColor (Farbe) – damit verhalten sich die Icons exakt wie ein
// Lucide-Icon und übernehmen die fcb-Text-/Hover-Tokens automatisch.
import type { SVGProps } from "react";

export function FacebookIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.628-5.373-12-12-12s-12 5.372-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
    </svg>
  );
}

export function InstagramIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0Zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03Zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162ZM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4Zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439Z" />
    </svg>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: keine Fehler/Warnungen, die diese Datei betreffen.

- [ ] **Step 3: Commit**

```bash
git add src/components/icons/BrandIcons.tsx
git commit -m "feat(footer): Inline-SVG Brand-Icons (Facebook/Instagram) – Lucide hat keine Brand-Glyphen"
```

---

## Task A2: Gemeinsame Footer-Daten

**Files:**
- Create: `src/app/footer-preview/_data.ts`

- [ ] **Step 1: Daten-Modul schreiben**

```ts
// Gemeinsame Footer-Daten für die drei Vergleichs-Varianten (Design-Runde 2).
// Adresse aus dem Impressum-PDF (Stand Mai 2025). Social-URLs entsprechen den
// aktuell live verlinkten Zielen aus dem bestehenden Footer.
export const FCB_FOOTER = {
  vereinsname: "1. FC 1911 Burgkunstadt e.V.",
  strasse: "Alter Postweg 10",
  ort: "96224 Burgkunstadt",
  facebookUrl: "https://www.facebook.com/fc1911?locale=de_DE",
  instagramUrl: "https://www.instagram.com/schuhstaedter1911",
} as const;
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: keine neuen Fehler.

- [ ] **Step 3: Commit**

```bash
git add src/app/footer-preview/_data.ts
git commit -m "feat(footer): gemeinsame Footer-Daten für Varianten-Vergleich"
```

---

## Task A3: Footer-Variante „Slim Bar"

**Files:**
- Create: `src/app/footer-preview/_components/FooterSlim.tsx`

- [ ] **Step 1: Komponente schreiben**

```tsx
"use client";

import Link from "next/link";
import { FacebookIcon, InstagramIcon } from "@/components/icons/BrandIcons";
import { FCB_FOOTER } from "../_data";

/**
 * Variante „Slim Bar" – maximal kompakt, alles in einer Zeile (~60 px).
 * Vereinsname links, Rechtliches mittig, Social rechts. Auf Mobile gestapelt.
 */
export default function FooterSlim() {
  const jahr = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-fcb-border bg-fcb-bg text-fcb-text">
      <div className="mx-auto flex min-h-[60px] max-w-6xl flex-col items-center justify-between gap-2 px-4 py-2 sm:flex-row">
        {/* Links: Vereinsname */}
        <span className="font-oswald text-sm font-semibold uppercase tracking-wide">
          {FCB_FOOTER.vereinsname}
        </span>

        {/* Mitte: Rechtliches + Copyright */}
        <nav className="flex items-center gap-3 font-inter text-xs text-fcb-muted">
          <Link href="/impressum" className="transition-colors hover:text-fcb-blue">
            Impressum
          </Link>
          <span aria-hidden className="text-fcb-border">|</span>
          <Link href="/datenschutz" className="transition-colors hover:text-fcb-blue">
            Datenschutz
          </Link>
          <span aria-hidden className="text-fcb-border">|</span>
          <span>© {jahr}</span>
        </nav>

        {/* Rechts: Social */}
        <div className="flex items-center gap-3">
          <Link
            href={FCB_FOOTER.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-fcb-muted transition-colors hover:text-fcb-blue"
          >
            <FacebookIcon className="h-5 w-5" />
          </Link>
          <Link
            href={FCB_FOOTER.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-fcb-muted transition-colors hover:text-fcb-blue"
          >
            <InstagramIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: keine neuen Fehler.

- [ ] **Step 3: Commit**

```bash
git add src/app/footer-preview/_components/FooterSlim.tsx
git commit -m "feat(footer): Variante Slim Bar"
```

---

## Task A4: Footer-Variante „Zweizeilig"

**Files:**
- Create: `src/app/footer-preview/_components/FooterZweizeilig.tsx`

- [ ] **Step 1: Komponente schreiben**

```tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/components/icons/BrandIcons";
import { FCB_FOOTER } from "../_data";

/**
 * Variante „Zweizeilig" – obere Zeile Wappen + Name + Adresse,
 * untere Zeile Rechtliches + Social + Copyright. Großzügiger als Slim,
 * aber noch kompakt.
 */
export default function FooterZweizeilig() {
  const jahr = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-fcb-border bg-fcb-bg text-fcb-text">
      <div className="mx-auto max-w-6xl px-4 py-5">
        {/* Obere Zeile: Wappen + Name + Adresse */}
        <div className="flex flex-col items-center gap-3 border-b border-fcb-border pb-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="Vereinslogo 1. FC 1911 Burgkunstadt"
              width={40}
              height={40}
              className="drop-shadow-lg"
            />
            <span className="font-oswald text-lg font-semibold uppercase tracking-wide">
              {FCB_FOOTER.vereinsname}
            </span>
          </div>
          <div className="flex items-center gap-2 font-inter text-sm text-fcb-muted">
            <MapPin className="h-4 w-4 shrink-0 text-fcb-blue" />
            <span>
              {FCB_FOOTER.strasse}, {FCB_FOOTER.ort}
            </span>
          </div>
        </div>

        {/* Untere Zeile: Rechtliches + Social + Copyright */}
        <div className="flex flex-col items-center gap-3 pt-4 sm:flex-row sm:justify-between">
          <nav className="flex items-center gap-3 font-inter text-sm text-fcb-muted">
            <Link href="/impressum" className="transition-colors hover:text-fcb-blue">
              Impressum
            </Link>
            <span aria-hidden className="text-fcb-border">|</span>
            <Link href="/datenschutz" className="transition-colors hover:text-fcb-blue">
              Datenschutz
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href={FCB_FOOTER.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-fcb-muted transition-colors hover:text-fcb-blue"
            >
              <FacebookIcon className="h-5 w-5" />
            </Link>
            <Link
              href={FCB_FOOTER.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-fcb-muted transition-colors hover:text-fcb-blue"
            >
              <InstagramIcon className="h-5 w-5" />
            </Link>
          </div>

          <span className="font-inter text-xs text-fcb-muted">
            © {jahr} {FCB_FOOTER.vereinsname}
          </span>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: keine neuen Fehler.

- [ ] **Step 3: Commit**

```bash
git add src/app/footer-preview/_components/FooterZweizeilig.tsx
git commit -m "feat(footer): Variante Zweizeilig"
```

---

## Task A5: Footer-Variante „Dreispaltig"

**Files:**
- Create: `src/app/footer-preview/_components/FooterDreispaltig.tsx`

- [ ] **Step 1: Komponente schreiben**

```tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/components/icons/BrandIcons";
import { FCB_FOOTER } from "../_data";

/**
 * Variante „Dreispaltig" – klassisches Footer-Layout mit mehr Atemraum.
 * Spalte 1 Vereinsinfo, Spalte 2 Rechtliches, Spalte 3 Social + Copyright.
 */
export default function FooterDreispaltig() {
  const jahr = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-fcb-border bg-fcb-bg text-fcb-text">
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
              className="text-fcb-muted transition-colors hover:text-fcb-blue"
            >
              <InstagramIcon className="h-6 w-6" />
            </Link>
          </div>
          <span className="font-inter text-xs text-fcb-muted sm:text-right">
            © {jahr}
            <br />
            {FCB_FOOTER.vereinsname}
          </span>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: keine neuen Fehler.

- [ ] **Step 3: Commit**

```bash
git add src/app/footer-preview/_components/FooterDreispaltig.tsx
git commit -m "feat(footer): Variante Dreispaltig"
```

---

## Task A6: Switcher, Layout, Routen + Chrome-Ausblendung

**Files:**
- Create: `src/app/footer-preview/_components/FooterSwitcher.tsx`
- Create: `src/app/footer-preview/layout.tsx`
- Create: `src/app/footer-preview/page.tsx`
- Create: `src/app/footer-preview/slim/page.tsx`
- Create: `src/app/footer-preview/zweizeilig/page.tsx`
- Create: `src/app/footer-preview/dreispaltig/page.tsx`
- Modify: `src/components/ConditionalChrome.tsx:22-29`

- [ ] **Step 1: Switcher schreiben** (`src/app/footer-preview/_components/FooterSwitcher.tsx`)

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Dünne Top-Leiste zum schnellen Vergleich der Footer-Varianten.
 * Muster übernommen vom früheren /variants-VariantSwitcher.
 */
const VARIANTS = [
  { slug: "slim", label: "Slim Bar" },
  { slug: "zweizeilig", label: "Zweizeilig" },
  { slug: "dreispaltig", label: "Dreispaltig" },
];

export default function FooterSwitcher() {
  const pathname = usePathname() ?? "";

  return (
    <div className="sticky top-0 z-[100] w-full border-b border-fcb-border bg-fcb-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-xs">
        <span className="font-inter uppercase tracking-widest text-fcb-muted">
          FCB · Footer-Varianten
        </span>
        <nav className="flex items-center gap-1">
          {VARIANTS.map((v) => {
            const href = `/footer-preview/${v.slug}`;
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

- [ ] **Step 2: Layout schreiben** (`src/app/footer-preview/layout.tsx`)

```tsx
import type { Metadata } from "next";
import FooterSwitcher from "./_components/FooterSwitcher";

/**
 * Layout für die Footer-Design-Exploration unter /footer-preview/*.
 * Eigenes Full-Bleed-Chrome (Switcher oben), die globale Header/Footer-Chrome
 * wird in ConditionalChrome für diese Routen ausgeblendet.
 * flex-col + flex-1-Filler im Page drückt den jeweiligen Footer ans Seitenende.
 */
export const metadata: Metadata = {
  title: "FCB · Footer-Varianten",
  description: "Vergleich der Footer-Designs (Design-Runde 2).",
};

export default function FooterPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-fcb-bg font-inter text-fcb-text antialiased">
      <FooterSwitcher />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
```

- [ ] **Step 3: Index-Route mit Redirect** (`src/app/footer-preview/page.tsx`)

```tsx
import { redirect } from "next/navigation";

// Bare /footer-preview leitet auf die erste Variante weiter.
export default function FooterPreviewIndex() {
  redirect("/footer-preview/slim");
}
```

- [ ] **Step 4: Slim-Seite** (`src/app/footer-preview/slim/page.tsx`)

```tsx
import FooterSlim from "../_components/FooterSlim";

export default function FooterSlimPreviewPage() {
  return (
    <>
      {/* Filler – schiebt den Footer ans Seitenende und zeigt ihn im Kontext */}
      <div className="flex flex-1 items-center justify-center px-4 py-20 text-center">
        <p className="max-w-md font-inter text-sm text-fcb-muted">
          Variante „Slim Bar" – kompakt, alles in einer Zeile. Footer am Seitenende ↓
        </p>
      </div>
      <FooterSlim />
    </>
  );
}
```

- [ ] **Step 5: Zweizeilig-Seite** (`src/app/footer-preview/zweizeilig/page.tsx`)

```tsx
import FooterZweizeilig from "../_components/FooterZweizeilig";

export default function FooterZweizeiligPreviewPage() {
  return (
    <>
      {/* Filler – schiebt den Footer ans Seitenende und zeigt ihn im Kontext */}
      <div className="flex flex-1 items-center justify-center px-4 py-20 text-center">
        <p className="max-w-md font-inter text-sm text-fcb-muted">
          Variante „Zweizeilig" – Wappen + Adresse oben, Rechtliches + Social unten. Footer am Seitenende ↓
        </p>
      </div>
      <FooterZweizeilig />
    </>
  );
}
```

- [ ] **Step 6: Dreispaltig-Seite** (`src/app/footer-preview/dreispaltig/page.tsx`)

```tsx
import FooterDreispaltig from "../_components/FooterDreispaltig";

export default function FooterDreispaltigPreviewPage() {
  return (
    <>
      {/* Filler – schiebt den Footer ans Seitenende und zeigt ihn im Kontext */}
      <div className="flex flex-1 items-center justify-center px-4 py-20 text-center">
        <p className="max-w-md font-inter text-sm text-fcb-muted">
          Variante „Dreispaltig" – klassisches Spalten-Layout mit mehr Atemraum. Footer am Seitenende ↓
        </p>
      </div>
      <FooterDreispaltig />
    </>
  );
}
```

- [ ] **Step 7: Globale Chrome auf /footer-preview ausblenden** (`src/components/ConditionalChrome.tsx`)

Ersetze in `src/components/ConditionalChrome.tsx` den bestehenden Block (aktuell Zeilen 22–29):

```tsx
  const pathname = usePathname() ?? "";
  const isVariantsRoute = pathname.startsWith("/variants");

  if (isVariantsRoute) {
    // Full-Bleed: kein Header/Footer, kein main-Padding. Das variants/layout.tsx
    // übernimmt sein eigenes Chrome (Switcher + smart-sticky Navbar).
    return <>{children}</>;
  }
```

durch:

```tsx
  const pathname = usePathname() ?? "";
  // Preview-Routen mit eigenem Full-Bleed-Layout (Design-Exploration):
  // /variants/* (Hero, historisch) und /footer-preview/* (Footer-Varianten, Runde 2).
  const isPreviewRoute =
    pathname.startsWith("/variants") || pathname.startsWith("/footer-preview");

  if (isPreviewRoute) {
    // Full-Bleed: kein globaler Header/Footer, kein main-Padding. Das jeweilige
    // layout.tsx der Preview-Route übernimmt sein eigenes Chrome.
    return <>{children}</>;
  }
```

- [ ] **Step 8: Lint**

Run: `npm run lint`
Expected: keine neuen Fehler.

- [ ] **Step 9: Smoke-Test lokal (Dev-Server)**

Da `next build` lokal an FullCalendar/Turbopack scheitert, hier den Dev-Server nutzen:

Run: `npm run dev` (in separatem Terminal)
Dann im Browser prüfen:
- `http://localhost:3000/footer-preview` → leitet auf `/footer-preview/slim` weiter
- `http://localhost:3000/footer-preview/slim` → Slim-Footer am Seitenende, kein globaler Header/Footer
- Switcher-Pills wechseln zwischen slim/zweizeilig/dreispaltig, aktive Pill ist fcb-blue
Expected: drei klar unterschiedliche Footer, Brand-Icons sichtbar, FCB-Farben (dunkel).
Dev-Server danach stoppen (Strg+C).

- [ ] **Step 10: Commit**

```bash
git add src/app/footer-preview src/components/ConditionalChrome.tsx
git commit -m "feat(footer): Preview-Routen /footer-preview/* mit Switcher + Chrome-Ausblendung"
```

---

# TEIL B – Profilleiste / UserDropdown (SubAgent 2)

## Task B1: UserDropdown auf FCB-Design + Lucide umbauen

**Files:**
- Modify (komplett ersetzen): `src/components/UserDropdown.tsx`

**Wichtig:** Auth-Logik (beide `useEffect`, `handleLogout`, `getInitials`, das `UserData`-Interface, das `eslint-disable`-Kommentar an gleicher Stelle) bleibt **funktional identisch**. Geändert werden nur: Import von `react-icons/fi` → `lucide-react`, der ausgeloggte Trigger-Button, sowie die Inhalte/Struktur von `Menu.Items`.

- [ ] **Step 1: Datei vollständig ersetzen**

```tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu } from "@headlessui/react";
import { LogIn, LogOut, User, UserPlus } from "lucide-react";

interface UserData {
  email: string;
  vorname: string | null;
  nachname: string | null;
  avatar_url: string | null;
}

export default function UserDropdown() {
  const supabase = createClient();
  const router = useRouter();

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

  return (
    <Menu as="div" className="relative inline-block text-left">
      {/* Trigger: eingeloggt → Avatar-Kreis, ausgeloggt → einladender „Anmelden"-Button */}
      {isLoggedIn ? (
        <Menu.Button className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-fcb-blue font-bold text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue focus-visible:ring-offset-2 focus-visible:ring-offset-fcb-nav">
          {user?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar_url}
              alt="Profilbild"
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-sm text-white">{getInitials()}</span>
          )}
        </Menu.Button>
      ) : (
        <Menu.Button className="flex items-center gap-1.5 rounded-full border border-fcb-blue bg-fcb-blue px-3 py-1.5 font-inter text-sm font-medium text-white transition-colors hover:bg-fcb-blue/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue focus-visible:ring-offset-2 focus-visible:ring-offset-fcb-nav">
          <LogIn className="h-4 w-4" />
          <span>Anmelden</span>
        </Menu.Button>
      )}

      <Menu.Items className="absolute right-0 z-[9999] mt-2 w-56 origin-top-right overflow-hidden rounded-lg border border-fcb-border bg-fcb-surface text-fcb-text shadow-lg focus:outline-none">
        {isLoggedIn ? (
          <>
            {/* Kopf: Name + E-Mail klar abgesetzt */}
            <div className="border-b border-fcb-border px-4 py-3">
              <p className="font-inter text-sm font-semibold text-fcb-text">
                {user?.vorname?.trim() ? user.vorname : "Nutzer"}
              </p>
              <p className="truncate font-inter text-xs text-fcb-muted">
                {user?.email ?? ""}
              </p>
            </div>

            {/* Aktionen */}
            <div className="p-1">
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
                    Logout
                  </button>
                )}
              </Menu.Item>
            </div>
          </>
        ) : (
          <>
            {/* Kopf: einladender Hinweis für Besucher */}
            <div className="border-b border-fcb-border px-4 py-3">
              <p className="font-inter text-sm font-semibold text-fcb-text">
                Willkommen beim FCB
              </p>
              <p className="font-inter text-xs text-fcb-muted">
                Melde dich an oder registriere dich.
              </p>
            </div>

            {/* Login-Pfad */}
            <div className="p-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => router.push("/login")}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 font-inter text-sm font-medium text-white transition-colors ${
                      active ? "bg-fcb-blue/90" : "bg-fcb-blue"
                    }`}
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </button>
                )}
              </Menu.Item>
            </div>

            {/* Registrieren-Pfad – optisch vom Login getrennt */}
            <div className="border-t border-fcb-border p-1">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href="/registrieren"
                    className={`flex items-center gap-2 rounded-md px-3 py-2 font-inter text-sm transition-colors ${
                      active ? "bg-fcb-border text-fcb-text" : "text-fcb-text"
                    }`}
                  >
                    <UserPlus className="h-4 w-4 text-fcb-muted" />
                    Noch kein Konto? Registrieren
                  </Link>
                )}
              </Menu.Item>
            </div>
          </>
        )}
      </Menu.Items>
    </Menu>
  );
}
```

- [ ] **Step 2: Sicherstellen, dass kein react-icons-Import mehr vorhanden ist**

Run: `grep -n "react-icons" src/components/UserDropdown.tsx`
Expected: keine Ausgabe (leer).

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: keine neuen Fehler.

- [ ] **Step 4: Smoke-Test lokal (Dev-Server)**

Run: `npm run dev` (falls nicht schon laufend)
Im Browser auf `http://localhost:3000` (ausgeloggt):
- Oben rechts steht ein „Anmelden"-Button (LogIn-Icon + Text), fügt sich in die Nav ein – kein graues Icon mehr.
- Klick öffnet Dropdown: „Willkommen beim FCB", darunter blauer Login-Button, darunter abgetrennt „Noch kein Konto? Registrieren" (UserPlus).
- Login-Button → `/login`, Registrieren-Link → `/registrieren`.
Eingeloggt (nach Login): Avatar-Kreis, Dropdown zeigt Name + E-Mail abgesetzt, „Profil bearbeiten" (User-Icon) und „Logout" (LogOut-Icon, rot/fcb-red).
Expected: alle Pfade funktionieren, keine Konsolen-Fehler.
Dev-Server danach stoppen.

- [ ] **Step 5: Commit**

```bash
git add src/components/UserDropdown.tsx
git commit -m "feat(nav): UserDropdown redesign – Anmelden-Button, Registrieren-Pfad, Lucide statt react-icons"
```

---

# ABSCHLUSS

## Task Z1: Push + Vercel-Preview-Verifikation

**Files:** keine

- [ ] **Step 1: Branch pushen**

```bash
git push -u origin design-round-2
```

- [ ] **Step 2: Vercel-Preview-Build abwarten + prüfen**

Vercel deployed den Branch automatisch. Den Preview-Build abwarten und prüfen, dass er **clean** durchläuft (das ist der echte Build-Gate – lokaler `next build` ist wegen FullCalendar/Turbopack nicht aussagekräftig).

Wenn der Vercel-MCP/CLI verfügbar ist:
```bash
# Optional, Status der letzten Deployments einsehen:
# über Vercel-MCP-Tool list_deployments / get_deployment_build_logs
```
Expected: Deployment-Status „Ready", keine Build-Fehler.

- [ ] **Step 3: Auf der Preview-URL gegenprüfen**

Auf der Vercel-Preview-URL:
- `/footer-preview/slim`, `/footer-preview/zweizeilig`, `/footer-preview/dreispaltig` zeigen drei klar unterschiedliche Footer.
- Profilleiste oben rechts (ausgeloggt) zeigt den „Anmelden"-Button + Dropdown mit Registrieren-Pfad.
Expected: alles wie im lokalen Smoke-Test, jetzt im echten Build.

- [ ] **Step 4: KEIN Merge auf main**

Der Branch bleibt offen. Die finale Footer-Variante wird in einem **separaten zweiten Schritt** (nach Bastis Auswahl) auf main übernommen – nicht Teil dieses Plans.

---

## Self-Review (Spec-Abgleich)

**Footer (SubAgent 1):**
- Vereinsname + Adresse aus Impressum-PDF → Task A2/A4/A5 ✓
- Impressum-/Datenschutz-Links → alle drei Varianten ✓
- Facebook/Instagram mit Icons (kein react-icons) → Inline-SVG-Brand-Glyphen (Task A1), da Lucide keine Brand-Icons hat ✓
- Copyright-Jahr korrekt → `new Date().getFullYear()` ✓
- 2–3 klar unterschiedliche Varianten auf Preview-Routen → 3 (Slim/Zweizeilig/Dreispaltig) ✓
- Nur fcb.*-Tokens, keine magic hex → durchgehend ✓
- Kein Merge auf main → Task Z1/Step 4 ✓

**UserDropdown (SubAgent 2):**
- Einladender Button für Besucher → „Anmelden"-Pill ✓
- Registrieren-Link sichtbar + getrennt → eigener border-getrennter Block ✓
- Strukturiertes Dropdown (Name/E-Mail abgesetzt, Hierarchie) → Kopf-Block + Aktionen ✓
- Logout als destruktiv erkennbar, nicht aufdringlich → fcb-red Text + dezenter Hover ✓
- Lucide statt react-icons → `LogIn/LogOut/User/UserPlus`, FiUser entfernt ✓
- Auth-Logik unverändert → beide useEffect/handleLogout/getInitials identisch ✓

**Übergreifend:**
- Branch `design-round-2`, kein Push auf main → Task 0 / Z1 ✓
- Build clean → Vercel-Preview-Gate (lokaler Build-Issue dokumentiert) ✓
- Kein react-icons in überarbeiteten Komponenten → Footer nutzt keine; UserDropdown grep-verifiziert (B1/Step 2) ✓
- Keine Emojis, nur Lucide/Inline-SVG ✓

**Hinweis Parallelisierung:** Teil A und Teil B berühren disjunkte Dateien; einzig `ConditionalChrome.tsx` wird angefasst (nur Teil A). Bei paralleler Bearbeitung keine Merge-Konflikte zu erwarten. Task 0 muss vor beiden Teilen laufen, Task Z1 nach beiden.

## Abschluss: Claudian-Update

Nach Abschluss aller Tasks das Claudian-Update-Format aus der CLAUDE.md ausgeben (Sektionen: Implementiert / Manuell zu testen / Getestet / Offen / Technische Notizen). Die Sektion „Manuell zu testen" mit den Smoke-Test-Schritten (Footer-Preview-Routen + Profilleiste ein-/ausgeloggt) füllen.
```
