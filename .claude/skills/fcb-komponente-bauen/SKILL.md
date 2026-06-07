---
name: fcb-komponente-bauen
description: Beim Bauen oder Ändern einer React/Next-Komponente im FCB-Projekt – Design-Tokens, Fonts, Icons, Animationen, A11y. Triggert bei neue Komponente, UI bauen, Card/Modal/Button/Nav, Tailwind-Klassen, Framer Motion, Lucide-Icon, Social-Icon, Styling, Design-Spec.
---

# FCB-Komponente bauen

## Überblick

Verifiziertes Rezept für eine neue oder geänderte Frontend-Komponente in diesem Projekt.
**Kernprinzip:** Werte und Bibliotheks-Eigenheiten nicht raten – sie sind unten festgehalten
und gegen den echten Code geprüft (Stand 2026-06-07).

**WICHTIGSTE Eigenheit – das Projekt ist mitten in einer Design-Migration:**
Die verbindliche `fcb.*`-Token-Optik (dunkel, Oswald/Inter) gilt für **neue und überarbeitete**
Komponenten. **Viele Legacy-Seiten sind noch hell** (`gray-*`, `var(--background)`, Arial-Body).
→ **Alte Komponenten nicht blind als Vorbild kopieren.** Vorbild ist `Header.tsx` (modern),
nicht `NewsCard.tsx` (legacy). Eine Legacy-Seite nur dann auf das neue Design ziehen, wenn
Basti das ausdrücklich beauftragt – nicht ungefragt „mitmigrieren".

## Verifizierte Bausteine (NICHT raten)

| Baustein | Korrekter Wert |
|---|---|
| Tailwind-Version | **3.4.1** – KEIN v4. Keine `@theme`-Directive, kein `tailwind.config` in CSS. Klassen wie gewohnt in `tailwind.config.ts`. |
| Farb-Tokens | `bg-fcb-bg` `bg-fcb-surface` `border-fcb-border` `text-fcb-text` `text-fcb-muted` `bg-fcb-nav` `text-fcb-blue` `text-fcb-red` (alle in `tailwind.config.ts` unter `fcb.*`). **Keine magic hex, kein `gray-*` in neuen Komponenten.** |
| Headline-Font | `font-oswald` (CSS-Var-gebunden, lädt zuverlässig). `font-display` existiert auch, ist aber NICHT an next/font gebunden → für neue Komponenten `font-oswald` nehmen. |
| Body-Font | `font-inter` |
| Animationen | **Framer Motion** (`framer-motion`, v12) – `motion.*`, `AnimatePresence`, `useScroll`, `useMotionValueEvent`. Keine CSS-`@keyframes` für neue Komponenten. |
| Generische Icons | `lucide-react` (v1.17) – `Menu`, `X`, `User`, `LogIn`, `LogOut`, `MapPin`, `Mail`, `Phone`, `UserPlus`, … |
| Brand-/Social-Icons | **`@/components/icons/BrandIcons.tsx`** (`FacebookIcon`, `InstagramIcon`). Lucide hat KEINE Brand-Glyphen mehr. `react-icons` ist nur Altlast – NICHT für neue Icons nutzen. |
| Client vs Server | Interaktiv (State, Motion, Events, Hooks) → `"use client"` als erste Zeile. Statisch → Server-Komponente lassen. |
| Supabase-Client | `import { supabase } from "@/lib/supabaseClient"` |
| Bilder | `next/image` (`Image`), `alt` ist Pflicht (deutsch). |

## Kanonisches Vorbild: `src/components/Header.tsx`

Diese Komponente zeigt das vollständige moderne Muster – beim Bauen daran orientieren:

- `"use client"` + benannte Imports aus `framer-motion`
- Smart-Sticky-Nav: `useScroll` + `useMotionValueEvent`, versteckt ab `scrollY > 80` & `delta > 5`
- `<motion.header animate={{ y: hidden ? "-100%" : 0 }} transition={{ duration: 0.25 }}>`
- `AnimatePresence` für Mobile-Menü (`initial`/`animate`/`exit`)
- Durchgängig fcb-Tokens: `border-fcb-border bg-fcb-nav/90 text-fcb-text hover:text-fcb-blue`
- `font-oswald` für den Vereinsnamen, `font-inter` für Nav-Links
- Lucide `Menu`/`X`, **deutsche `aria-label`** ("Menü öffnen"/"Menü schließen")
- Kommentare erklären das *Warum* (Hierarchie, Anti-Flacker-Schwelle)

## Design-Prinzipien (verbindlich)

- **Keine Emojis** in der UI – ausschließlich Lucide-Icons (Social: BrandIcons).
- **Framer Motion** für alle Animationen (Einblendungen, Hover, Übergänge).
- **A11y**: Fokus-States sichtbar lassen, Kontrast WCAG AA, jedes interaktive Element mit
  Label/`aria-label` (deutsch). Zum Prüfen: Skill `chrome-devtools-mcp:a11y-debugging`.
- **Deutsch**: alle sichtbaren Texte, `alt`, `aria-label`, Kommentare.
- **FCB = Blau (`fcb-blue`), JFG = Rot (`fcb-red`)** – Akzent nach Bereich wählen.

## Workflow-Checkliste

1. **Plan-Modus** bei größeren Komponenten (CLAUDE.md). Micro-Fix (eine Klasse, ein Text) → direkt.
2. **Vorbild prüfen**: modern (`Header`, `UserDropdown`, `InstagramSection`) – nicht legacy (`NewsCard`, Formularseiten).
3. **Bauen** nach Tabelle oben: fcb-Tokens, Oswald/Inter, Lucide/BrandIcons, Framer Motion, `"use client"` nur wenn nötig.
4. **TypeScript strict**: explizites Props-`interface`, **kein `any`**, Union-Types für feste Wertemengen.
5. **Kommentieren**: das *Warum* bei nicht-offensichtlicher Logik/Animation/Entscheidung.
6. **Lint**: `npm run lint`. (`npm run build` kann lokal an Turbopack+FullCalendar scheitern – wenn der Fehler ausschließlich daher rührt, kein Blocker; Vercel-Build greift. Ersatz: `npx tsc --noEmit`.)
7. **Commit & Push** auf `main` (`feat:`/`fix:`-Präfix), Vercel deployt automatisch.
8. **Claudian-Update** im vorgeschriebenen Format ausgeben (Sektion „Manuell zu testen" ist Pflicht).

## Häufige Fehler

| Fehler | Folge / Fix |
|---|---|
| `gray-*` / magic hex / `var(--background)` in neuer Komponente | Bricht das Design-System. `fcb.*`-Tokens nutzen. |
| `import { Facebook } from "lucide-react"` | `undefined` – Lucide hat keine Brand-Icons. `BrandIcons.tsx` nutzen. |
| Deutsche Anführungszeichen `„…"` direkt in JSX-String-Attribut | Bricht den TS-JSX-Parser. Stattdessen Template-Literal: `prop={`…„x"…`}`. Schlusszeichen ist `“` (U+201C), nicht ASCII `"`. |
| `font-display` erwartet, dass Oswald lädt | `font-display` ist NICHT an next/font gebunden. `font-oswald` nehmen. |
| Tailwind-v4-Syntax (`@theme`, CSS-`@config`) | Projekt ist v3.4. Tokens in `tailwind.config.ts`. |
| CSS-`@keyframes` für neue Animation | Projektstandard ist Framer Motion. |
| Legacy-Hellseite ungefragt „mitmigriert" | Migration ist beauftragungspflichtig. Nur ändern, was Basti benannt hat. |
| `react-icons` für ein neues Icon | Altlast-Dependency. Lucide bzw. BrandIcons nutzen. |
