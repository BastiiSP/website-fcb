# Mobile Header- & Footer-Fixes Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Header auf 375 px nutzbar machen (Hamburger links, kompakte Auth-Buttons, lesbarer Anmelden-Kontrast, Registrieren-Hover) und den Footer als eindeutig erkennbare Zone abgrenzen.

**Architecture:** Drei fokussierte Datei-Änderungen, nur CSS/JSX-Layout — keine Logik. Header.tsx wird umstrukturiert (Hamburger in die linke Gruppe), UserDropdown.tsx bekommt responsive/kontraststarke Button-Styles, Footer.tsx einen sichtbaren Divider. Auth-Logik bleibt unangetastet.

**Tech Stack:** Next.js 16, React 19, TypeScript strict, Tailwind 3.4 (`fcb.*`-Tokens + Tailwind-Defaults wie `white/10`), Framer Motion, Lucide. Keine neuen Abhängigkeiten.

**Entscheidungen (mit Basti abgestimmt):** Hamburger **links**; Auth-Buttons **kompakt inline** (bleiben mobil sichtbar, nicht ins Menü verlagert). Anmelden wird auf weißen Outline umgestellt (Blau-auf-Grau hat zu wenig Kontrast). Footer-Divider via `border-white/10`. Verifikation: `npx tsc --noEmit` + `npm run lint` (Projekt hat keine Unit-Tests). Arbeit direkt auf `main`.

---

## Task 1: Header – Hamburger nach links, Struktur umbauen

**Files:**
- Modify: `src/components/Header.tsx`

Der Hamburger sitzt aktuell rechts in derselben Gruppe wie `UserDropdown`. Er wird in eine neue linke Gruppe (vor dem Logo) verschoben; die rechte Gruppe enthält nur noch `UserDropdown`.

- [ ] **Step 1: Linke Gruppe (Hamburger + Logo) bilden**

In `src/components/Header.tsx` den Block, der mit `{/* Vereinswappen + Stadtwappen + Name */}` beginnt, so umschließen/ergänzen, dass der Hamburger davor steht. Ersetze die öffnende Zeile des Logo-`Link` (Zeile 54–55):

```tsx
        {/* Linke Gruppe: Hamburger (mobil, Konvention links) + Wappen + Name */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={menuOpen}
            className="-ml-1 rounded p-1 text-fcb-text transition-colors hover:text-fcb-blue md:hidden"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Vereinswappen + Stadtwappen + Name */}
          <Link href="/" className="flex items-center gap-2">
```

- [ ] **Step 2: Logo-Link + linke Gruppe schließen**

Die schließende `</Link>` des Logo-Links (aktuell Zeile 77) um ein zusätzliches `</div>` für die linke Gruppe ergänzen:

```tsx
          </Link>
        </div>
```

- [ ] **Step 3: Hamburger aus der rechten Gruppe entfernen**

Die rechte Gruppe (aktuell Zeile 93–103) auf nur noch `UserDropdown` reduzieren:

```tsx
        {/* Rechte Seite: Auth (Buttons ausgeloggt / Avatar eingeloggt) */}
        <div className="flex items-center">
          <UserDropdown />
        </div>
```

- [ ] **Step 4: Verifizieren**

Run: `npx tsc --noEmit && npm run lint`
Expected: Keine Fehler in `Header.tsx`. `Menu`/`X` (Lucide) bleiben importiert und genutzt; `menuOpen`/`setMenuOpen` weiter verwendet.

---

## Task 2: UserDropdown – kompakte, kontraststarke Auth-Buttons mit Hover

**Files:**
- Modify: `src/components/UserDropdown.tsx`

Nur der ausgeloggte Zweig (zwei Buttons) wird geändert. Avatar-Trigger, Card-Dropdown und die gesamte Auth-Logik bleiben unverändert.

- [ ] **Step 1: „Anmelden"-Button (Zeile 80–85) ersetzen**

Weißer Outline (lesbar auf grauem Nav-Grund), kompakt auf Mobile, größer ab `md`, mit Hover:

```tsx
        <Link
          href="/login"
          className="rounded-full border border-white/40 bg-transparent px-2.5 py-1 font-inter text-xs font-medium text-white transition-colors hover:border-white/70 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue focus-visible:ring-offset-2 focus-visible:ring-offset-fcb-nav md:px-3 md:py-1.5 md:text-sm"
        >
          Anmelden
        </Link>
```

- [ ] **Step 2: „Registrieren"-Button (Zeile 86–92) ersetzen**

Gefüllt-blau (Primäraktion), kompakt auf Mobile, spürbarer `hover:brightness-110`:

```tsx
        <Link
          href="/registrieren"
          className="flex items-center gap-1.5 rounded-full border border-fcb-blue bg-fcb-blue px-2.5 py-1 font-inter text-xs font-medium text-white transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue focus-visible:ring-offset-2 focus-visible:ring-offset-fcb-nav md:px-3 md:py-1.5 md:text-sm"
        >
          <UserPlus className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span>Registrieren</span>
        </Link>
```

- [ ] **Step 3: Verifizieren**

Run: `npx tsc --noEmit && npm run lint`
Expected: Keine Fehler in `UserDropdown.tsx`.

---

## Task 3: Footer – sichtbarer Divider zur klaren Abgrenzung

**Files:**
- Modify: `src/components/Footer.tsx`

Der Footer nutzt `bg-fcb-surface` + `border-t border-fcb-border` (#2a2a2a, auf #161616 fast unsichtbar). Der Top-Divider wird auf eine deutlich wahrnehmbare, dezent-moderne Hairline umgestellt.

- [ ] **Step 1: Top-Border der `motion.footer` ersetzen**

In `src/components/Footer.tsx` die `className` der `motion.footer` ändern: `border-fcb-border` → `border-white/10`:

```tsx
      className="w-full border-t border-white/10 bg-fcb-surface text-fcb-text"
```

- [ ] **Step 2: Verifizieren**

Run: `npx tsc --noEmit && npm run lint`
Expected: Keine Fehler.

---

## Task 4: Gesamt-Verifikation + Commit auf main

**Files:** keine

- [ ] **Step 1: Lint + Typecheck (Gesamtprojekt)**

Run: `npx tsc --noEmit && npm run lint`
Expected: 0 Fehler; nur die bekannten 3 vorbestehenden Warnings (`NewsCard.tsx`, `PersoenlicheDaten.tsx`).

- [ ] **Step 2: Commit + Push auf main**

```bash
git add src/components/Header.tsx src/components/UserDropdown.tsx src/components/Footer.tsx
git commit -m "fix(header,footer): Mobile-Header (Hamburger links, kompakte Auth-Buttons, Anmelden-Kontrast, Registrieren-Hover) + sichtbarer Footer-Divider"
git push origin main
```

---

## Self-Review

**Spec-Abdeckung:**
- A1 Hamburger-Position → Task 1 (nach links) ✓
- A2 Kollision Buttons/Logo → Task 1 (Hamburger raus aus rechter Gruppe) + Task 2 (kompakte Buttons `text-xs px-2.5` mobil) ✓
- A3 Anmelden-Kontrast → Task 2 (weißer Outline statt Blau-auf-Grau) ✓
- A4 Registrieren-Hover → Task 2 (`hover:brightness-110`) ✓
- B Footer-Erkennbarkeit → Task 3 (`border-white/10` Divider auf `fcb-surface`) ✓
- Auth-Logik unangetastet → nur JSX/Styles ✓
- Nur fcb.* + Tailwind, keine neuen Deps → `white/10`, `brightness-110` sind Tailwind-Utilities ✓
- tsc + eslint fehlerfrei → Task 4 ✓

**Placeholder-Scan:** Keine TBD/TODO; alle Edits mit vollständigen Klassen-Strings.

**Konsistenz:** Beide Buttons nutzen dieselbe responsive Größenskala (`px-2.5 py-1 text-xs` → `md:px-3 md:py-1.5 md:text-sm`); gleiche Border-Breite (1px) → identische Höhe. `focus-visible:ring-offset-fcb-nav` auf beiden beibehalten.
