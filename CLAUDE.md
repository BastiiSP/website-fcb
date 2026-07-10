# FCB Website – Claude Code Kontext

## Projekt

Website des 1. FC 1911 Burgkunstadt – ein echter Fußballverein aus Burgkunstadt.

- **Live-URL**: https://www.fcbuku.de
- **GitHub**: https://github.com/BastiiSP/website-fcb
- **Deployment**: Vercel (auto-deploy bei Push auf `main`)
- **Supabase Project Ref**: jktvmckqfklfziszfsxf
- **Lokaler Pfad**: `~/Workspace/website-fcb/`

## Tech Stack

- **Next.js 16** mit App Router
- **React 19** / **TypeScript 5** (strict mode)
- **Tailwind CSS 3** (v3.4 – NICHT v4: Tokens in `tailwind.config.ts`, keine `@theme`-CSS-Directive)
- **Framer Motion 12** (alle Animationen)
- **Supabase** (PostgreSQL + Auth + RLS)
- **FullCalendar 6** (Buchungskalender)
- **Vercel** (Hosting + Analytics)
- **UI-Libs**: `@headlessui/react`, `lucide-react` (Icons), `react-select`, `react-datepicker`, `react-easy-crop`, `@tippyjs/react`, `date-fns`. Brand-/Social-Icons via `src/components/icons/BrandIcons.tsx` (Lucide hat keine). `react-icons` ist Altlast – nicht für Neues nutzen.

## Rollenkonzept – KRITISCH

Niemals ohne Rücksprache ändern. Das Rollensystem ist das Herzstück der Zugangskontrolle.

| Rolle | Wer | Rechte |
|---|---|---|
| `ausstehend` | Jeder nach Selbstregistrierung | Nur Profil-Seite – wartet auf Freigabe durch Vorstand |
| `mitglied` | Vereinsmitglieder mit Login | Mein-Verein-Seite + Profil; kein Kalender-Zugriff |
| `trainer` | Trainer, Platzwarte, Betreuer | Platzbuchungen anlegen & eigene verwalten |
| `vorstand` | Vorstandsmitglieder | Alles + alle Buchungen verwalten + Nutzer freischalten |
| `admin` | IT-Verantwortlicher | Alles + Vorstandsrollen und Admin-Rollen vergeben |

**Wichtig:** Vorstand darf zwischen `ausstehend` / `mitglied` / `trainer` wechseln. Nur `admin` darf `vorstand` und `admin` vergeben.

## Datenbankschema (Phase 1 – aktiv)

### Tabelle: `profiles`

| Spalte | Typ | Besonderheit |
|---|---|---|
| `id` | UUID | FK → auth.users, Primary Key |
| `vorname` | TEXT | NOT NULL |
| `nachname` | TEXT | NOT NULL |
| `telefonnummer` | TEXT | optional |
| `rolle` | TEXT | DEFAULT 'ausstehend', CHECK (ausstehend/mitglied/trainer/vorstand/admin) |
| `mannschaft` | TEXT[] | Mehrfachauswahl möglich |
| `created_at` | TIMESTAMPTZ | auto |
| `updated_at` | TIMESTAMPTZ | auto via Trigger |
| `geburtsdatum` | DATE | optional |
| `strasse` | TEXT | optional |
| `plz` | TEXT | optional |
| `ort` | TEXT | optional |
| `trainer_lizenzen` | TEXT[] | optional, Mehrfachauswahl möglich |
| `avatar_url` | TEXT | optional, öffentliche Supabase-Storage-URL |

### Tabelle: `buchungen`

| Spalte | Typ | Besonderheit |
|---|---|---|
| `id` | UUID | gen_random_uuid() |
| `platz` | TEXT | CHECK: hauptplatz / nebenplatz |
| `platzanteil` | TEXT | CHECK: viertel / halb / ganz |
| `anlass` | TEXT | CHECK: training / freundschaftsspiel / punktspiel / platzpflege |
| `startzeit` | TIMESTAMPTZ | NOT NULL |
| `endzeit` | TIMESTAMPTZ | NOT NULL |
| `mannschaft` | TEXT | NOT NULL |
| `buchende_person` | TEXT | NOT NULL |
| `bemerkung` | TEXT | optional |
| `user_id` | UUID | FK → auth.users, ON DELETE SET NULL |
| `created_at` | TIMESTAMPTZ | auto |
| `updated_at` | TIMESTAMPTZ | auto via Trigger |

### Tabelle: `mitglieder` (Phase 2 – aktiv)

Vereinsmitglieder ohne Login-Konto. Wird von Vorstand/Admin gepflegt.

| Spalte | Typ | Besonderheit |
|---|---|---|
| `id` | UUID | gen_random_uuid(), Primary Key |
| `mitgliedsnummer` | INTEGER | GENERATED ALWAYS AS IDENTITY – automatisch, kein Input-Feld |
| `vorname`, `nachname` | TEXT | NOT NULL |
| `email`, `telefonnummer` | TEXT | optional |
| `geburtsdatum`, `eintrittsdatum` | DATE | optional |
| `status` | TEXT | CHECK (aktiv/passiv/ehrenamt/gekündigt), DEFAULT 'aktiv' |
| `mannschaft` | TEXT[] | optional |
| `notizen` | TEXT | optional |
| `erstellt_von` | UUID | FK → auth.users, SET NULL bei Löschung |
| `created_at`, `updated_at` | TIMESTAMPTZ | auto, updated_at via Trigger |

RLS: SELECT/INSERT/UPDATE/DELETE nur für vorstand und admin. Trainer: kein Zugriff.

### Tabelle: `mannschaftsanfragen`

Anfragen von `mitglied`-Nutzern zum Beitritt/Austritt aus einer Mannschaft. Wird von Vorstand/Admin im Vorstandsbereich verwaltet.

| Spalte | Typ | Besonderheit |
|---|---|---|
| `id` | UUID | gen_random_uuid(), Primary Key |
| `user_id` | UUID | FK → auth.users |
| `typ` | TEXT | Art der Anfrage (z. B. beitritt / austritt) |
| `mannschaft` | TEXT | Betroffene Mannschaft |
| `begruendung` | TEXT | optional |
| `status` | TEXT | DEFAULT 'offen'; weitere Werte: genehmigt / abgelehnt |
| `created_at` | TIMESTAMPTZ | auto |

RLS: Nutzer sehen/erstellen nur eigene Anfragen; vorstand und admin verwalten alle.

### Tabelle: `keepalive` (technisch)

Verhindert das Pausieren des Supabase-Free-Tiers: Der GitHub-Actions-Workflow
`.github/workflows/supabase-keepalive.yml` schreibt alle 3 Tage per anon-INSERT einen
Eintrag (RLS-Policy erlaubt anon nur INSERT). Kein Fach-Schema – nicht umbauen, nicht in
Features verwenden. Hintergrund: anon-Leseanfragen zählt Supabase nicht zuverlässig als
Aktivität, deshalb Write statt Read.

## Code-Regeln

- **Tabellenname**: `profiles` (Plural) – niemals `profile` (Singular, das war der alte kaputte Name)
- **Spaltenname**: `rolle` (Singular, String) – niemals `rollen` (Plural/Array, das war der alte kaputte Name)
- **TypeScript strict**: Keine `any` Types. Immer explizite Interfaces definieren.
- **RLS immer aktiv**: Zugangskontrolle läuft in der Datenbank, nicht nur im Frontend
- **GRANTs nicht vergessen**: Bei jeder neuen Tabelle explizit `GRANT SELECT, INSERT, UPDATE, DELETE ON public.<tabelle> TO authenticated;` ausführen – ohne das greift RLS nie, da Postgres vorher mit „permission denied" abbricht. Bereits zweimal vergessen: `buchungen` (2026-05-22) und `mitglieder` (2026-05-26).
- **Neue Tabelle anlegen**: Immer das Skill `supabase-tabelle-anlegen` nutzen (`.claude/skills/`) – verifiziertes Rezept mit korrekter Trigger-Funktion (`handle_updated_at()`), RLS-Muster (`get_own_rolle()`), GRANT und Workflow-Checkliste.
- **Komponente bauen/ändern**: Immer das Skill `fcb-komponente-bauen` nutzen (`.claude/skills/`) – verifizierte Werte für Tokens (Dual-Theme!), Fonts, Icons, Framer Motion, A11y und die `ui/`-Primitive.
- **Supabase MCP nutzen**: Für alle Datenbankoperationen den MCP-Server verwenden
- **Keine direkten DB-Calls ohne RLS-Check** in Server Components
- **Fehlerbehandlung**: Alle Supabase-Calls mit try/catch und aussagekräftigen Fehlermeldungen
- **Deutsch**: Alle UI-Texte, Fehlermeldungen und Kommentare auf Deutsch
- **Codekommentare**: Neuen und geänderten Code sinnvoll kommentieren – nicht jede Zeile, aber überall dort, wo der Zusammenhang nicht sofort klar ist. Kommentare erklären das *Warum* oder den *Kontext*, nicht das *Was* (das liest man am Code selbst). Beispiele wo kommentiert wird: komplexe Logik, nicht-offensichtliche Bedingungen, RLS-relevante Stellen, Supabase-spezifisches Verhalten, Workarounds oder bewusste Entscheidungen.

## Wichtige Dateipfade

```
src/
├── app/
│   ├── page.tsx                   ← Homepage (Hero, Instagram-Sektion, Brücke zur News-Seite)
│   ├── verein/page.tsx            ← Öffentliche Vereinsseite
│   ├── mannschaften/page.tsx      ← Teams (TeamCards) + BFV-Spielbetrieb (Tabelle & Spiele)
│   ├── news/page.tsx              ← News-Seite (Instagram-only, kein CMS)
│   ├── kontakt/page.tsx           ← Öffentliche Kontaktseite
│   ├── platzbuchung/page.tsx      ← Buchungskalender (nur trainer/vorstand/admin), Redirect von /kalender
│   ├── vorstandsbereich/page.tsx  ← Vorstandsbereich inkl. Buchungsübersicht (nur vorstand/admin), Redirect von /vorstand
│   ├── mitglieder/page.tsx        ← Trainer-Verzeichnis (Rolle trainer) / Mitgliederverwaltung (vorstand/admin) – einheitliche H1 „Mitglieder" seit 2026-07-10, rollenspezifischer Untertitel
│   ├── mein-verein/page.tsx       ← Vereinslinks & Info (mitglied + höher)
│   ├── profil/page.tsx            ← Profilverwaltung (alle eingeloggten Rollen)
│   ├── login/ · registrieren/ · confirm-email/  ← Auth-Seiten (Pitch-Look)
│   ├── auth/callback/page.tsx     ← OAuth-Redirect (Google-Login)
│   ├── impressum/ · datenschutz/  ← Rechtstexte (RechtstextLayout)
│   └── api/
│       ├── spielbetrieb/route.ts  ← Debug-Endpoint für BFV-Daten (?team=herren-1)
│       ├── instagram/route.ts     ← Instagram-Feed (Behold)
│       ├── keep-alive/route.ts    ← Supabase-Ping (Haupt-Keepalive läuft als GitHub Action, s. Tabelle keepalive)
│       └── benutzer-ablehnen/route.ts
├── components/
│   ├── Header.tsx                 ← Smart-Sticky-Nav, kanonisches Design-Vorbild
│   (Navigation.tsx entfernt seit 2026-07-07 – Nav-Links leben in UserDropdown.tsx, Konstante ALLE_LINKS, seit 2026-07-10 rollenunabhängig für alle eingeloggten Nutzer sichtbar)
│   ├── Footer.tsx                 ← Dreispaltig, enthält den Theme-Umschalter
│   ├── ConditionalChrome.tsx      ← Blendet Header/Footer auf Auth-Routen aus
│   ├── UserDropdown.tsx           ← Nutzer-Menü in der Nav
│   ├── Buchungsformular.tsx / BearbeitenModal.tsx / LoeschenModal.tsx
│   ├── BuchungenVerwaltung.tsx    ← Buchungsübersicht im Vorstand-Bereich (Filter, Pagination, Mobile-Cards)
│   ├── BenutzerListe.tsx          ← Nutzerverwaltung + Mannschaftsanfragen im Vorstand-Bereich
│   ├── MannschaftsanfragenVerwaltung.tsx
│   ├── MitgliederVerwaltung.tsx / MitgliedBearbeitenModal.tsx   ← Mitgliederverwaltung (Phase 2)
│   ├── TrainerVerzeichnis.tsx / TooltipContent.tsx
│   ├── ToastMessage.tsx           ← Globale Erfolgs-/Fehlermeldungen
│   ├── ui/                        ← Design-System-Primitive: Button, ButtonLink, buttonStyles,
│   │                                Card, Banner, Badge, IconBadge, TeamCard, Modal, PageShell,
│   │                                PageHeader, Tabs, Select, TextField, Textarea, ThemeToggle
│   ├── icons/BrandIcons.tsx       ← Facebook/Instagram/WhatsApp/Google als Inline-SVG (Lucide hat keine Brand-Icons)
│   ├── spielbetrieb/              ← BFV-UI: SpielbetriebSection, SpielbetriebExplorer (Verein → Mannschaft), SpielbetriebCard
│   ├── news/NewsPostCard.tsx      ← Instagram-Post-Card der News-Seite
│   ├── instagram/                 ← InstagramSection / InstagramCarousel (Homepage)
│   ├── consent/                   ← DSGVO: ConsentProvider, CookieBanner, ConsentGate
│   │                                (ConsentGate bewusst ohne Konsumenten: Instagram läuft über
│   │                                den next/image-Proxy, BFV server-side – beides first-party;
│   │                                erst bei echten Client-Einbettungen nutzen)
│   ├── rechtstexte/RechtstextLayout.tsx
│   ├── hero/                      ← Homepage-Hero (HybridPitch, HybridCanvas, RotatingText)
│   ├── auth/                      ← Auth-UI (Pitch-Look: Shell, Background, Felder, Google-Button)
│   └── profil/                    ← Profil-Unterkomponenten (PersoenlicheDaten, AccountSicherheit,
│                                    AvatarUploadModal, MannschaftLizenzen, MannschaftsAnfrageModal)
├── hooks/
│   └── useTheme.ts                ← Theme lesen/umschalten (localStorage + .dark/.light auf <html>)
├── lib/
│   ├── supabaseClient.ts          ← Supabase-Singleton (anon key); Exporte: `supabase` + `createClient()`
│   ├── teams.ts                   ← Team-Daten + getTeamAccent() (FCB/JFG-Akzent-Klassen)
│   ├── mannschaften.ts            ← Mannschaftsliste für Formulare (Konstanten)
│   ├── bfv.ts                     ← BFV-Widget-API: BFV_TEAMS-Konfiguration + getSpielbetrieb()
│   ├── bfvTypes.ts                ← Typen für BFV-Tabelle & Spiele
│   ├── beholdFeed.ts              ← Instagram-Feed via Behold (Parsing, Caption-Split, Datum)
│   ├── consent.ts                 ← Consent-Kategorien & localStorage-Handling
│   ├── theme.ts                   ← Theme-Konstanten + applyTheme() (Default: dark)
│   ├── lizenzen.ts                ← Lizenz-Daten
│   ├── vereinslinks.ts            ← Externe Vereinslinks (WhatsApp, Social Media etc.)
│   └── auth/signInWithGoogle.ts   ← Google-OAuth-Start
└── utils/
    ├── checkSession.ts            ← Session + Rolle prüfen
    ├── getUserRolle.ts            ← Rolle eines Users abrufen
    ├── fetchEvents.ts             ← Buchungen laden
    ├── getEventColor.ts           ← Kalender-Farben nach Mannschaft
    ├── formatKalenderTitel.ts     ← Buchungstitel formatieren
    ├── formatCapitalized.ts       ← Hilfsfunktion Großschreibung
    └── passwortStaerke.ts         ← Passwort-Stärke-Berechnung
```

Außerhalb von `src/`: `e2e/smoke.spec.ts` (Playwright-Smoke-Suite) und
`.github/workflows/supabase-keepalive.yml` (Keepalive-Cron, s. Tabelle `keepalive`).

## BFV-Spielbetrieb (Tabelle & Spiele)

Live-Sportdaten (Tabelle, Ergebnisse, Termine) der Herrenmannschaften kommen **ohne Login**
von der öffentlichen BFV-Widget-API (`https://widget-prod.bfv.de/api/service/widget/v1`) –
Quelle ist bfv.de, nicht fussball.de.

- **Konfiguration**: `BFV_TEAMS` in `src/lib/bfv.ts`. Pro Team wird nur die stabile
  `teamPermanentId` aus der öffentlichen BFV-Mannschafts-URL gepflegt – Liga, Staffel und
  `compoundId` liefert der Matches-Endpunkt automatisch. Schritt-für-Schritt-Anleitung zum
  Ergänzen weiterer Teams steht als Kommentar direkt über `BFV_TEAMS`.
- **Caching**: 1 Stunde (`REVALIDATE_SECONDS` / `revalidate = 3600`) – die BFV-Quelle nicht
  häufiger abfragen.
- **Debug**: `/api/spielbetrieb?team=herren-1` zeigt die Rohdaten pro Team (ohne Parameter:
  alle konfigurierten Teams), ohne die Seite rendern zu müssen.
- **UI**: `src/components/spielbetrieb/` – `SpielbetriebSection` auf `/mannschaften`,
  `SpielbetriebExplorer` (Auswahl Verein → Mannschaft), `SpielbetriebCard` (Tabelle + Spiele).

## Supabase MCP

Der Supabase MCP-Server ist eingerichtet. Nutze ihn für:
- Schema-Änderungen und Migrationen
- SQL ausführen
- Tabellen prüfen und debuggen
- Auth-Einstellungen

## Lokale Entwicklung

```bash
cd ~/Workspace/website-fcb
npm run dev        # Entwicklungsserver auf localhost:3000
npm run build      # Production Build – schlägt LOKAL oft fehl (s. Deployment), Vercel baut sauber
npm run lint       # ESLint
npm run test:e2e   # Playwright-Smoke-Suite (e2e/smoke.spec.ts, braucht laufenden Dev-Server bzw. Build)
```

**Environment:** `.env.local` mit `NEXT_PUBLIC_SUPABASE_URL` und
`NEXT_PUBLIC_SUPABASE_ANON_KEY`. `src/lib/supabaseClient.ts` hat Placeholder-Fallbacks,
damit Preview-Branches ohne Env-Vars trotzdem bauen – auf `main` sind echte Werte gesetzt.

**Tests:** Playwright-Smoke-Suite in `e2e/smoke.spec.ts` (`npm run test:e2e`, Konfiguration
`playwright.config.ts`). Darüber hinaus läuft Verifikation über Lint, `npx tsc --noEmit`
und manuelles Testen (s. „Manuell zu testen").

## Deployment

Push auf `main` → Vercel deployed automatisch.

**Build-Check vor Push:** `npm run lint` + `npx tsc --noEmit`. Der lokale `npm run build`
scheitert häufig an Turbopack+FullCalendar (`Can't resolve '@fullcalendar/core'`) – das ist
KEIN eigener Bug, Vercel nutzt einen anderen Bundler-Pfad und baut sauber. Nur Fehler in
eigenen Dateien sind echte Blocker.

```bash
git add -A
git commit -m "feat: [beschreibung]"
git push
```

## Design-Spec (abgestimmt mit Claudian – Stand 2026-07-07)

Alle Designentscheidungen wurden gemeinsam mit Basti besprochen und sind verbindlich.
Bei neuen Komponenten und Änderungen **immer** diese Spec einhalten.
Die vollständige Designdokumentation liegt in der Obsidian-Projektdatei `02 Projekte/Website FCB.md`.

> **Status:** Die Design-Migration ist abgeschlossen (Design-System + Dual-Theme live seit
> 2026-06-19). **Alle Routen** laufen auf den semantischen `fcb.*`-Tokens und unterstützen
> Hell- und Dunkel-Theme (Default: dunkel, Umschalter im Footer); auch Hero und Auth-Seiten
> folgen dem Theme (bewusste Entscheidung, keine always-dark-Inseln). Kanonische Vorbilder:
> `Header.tsx` und die Primitive in `src/components/ui/`.
> **Neue Komponenten müssen in beiden Themes funktionieren** – Tokens statt fester Farben,
> beim manuellen Test einmal umschalten.

### Vereinskontext
- **FCB** = 1. FC 1911 Burgkunstadt – Mannschaften: 2× Herren, E-/F-/G-Jugend
- **JFG** = JFG Kunstadt-Obermain – Leistungsjugend: A-/B-/C-/D-Jugend (teils B1+B2)
- FCB und JFG teilen dieselbe Basis-Palette, unterscheiden sich durch ihre Akzentfarbe

### Farbpalette (Dual-Theme)
Die `fcb.*`-Klassen (`tailwind.config.ts`) sind **semantische Tokens**: Sie lösen über
CSS-Variablen aus `globals.css` auf, die je nach `.dark`-/`.light`-Klasse auf `<html>`
andere Werte tragen (`darkMode: "class"`, Default dunkel, Umschalter im Footer /
`hooks/useTheme.ts`). Opacity-Modifier funktionieren (`bg-fcb-surface/80`). Nur die
Brand-Akzente `blue`/`red` sind feste Hex-Werte, in beiden Themes konstant.

| Token | Klasse | Dark | Light | Verwendung |
|---|---|---|---|---|
| Hintergrund | `bg-fcb-bg` | `#0a0a0a` | `#ffffff` | Seiten-BG, Hero, Sections |
| Surface | `bg-fcb-surface` | `#161616` | `#f5f5f5` | Cards, Panels, Modals |
| Footer | `bg-fcb-footer` | `#262626` | `#e5e5e5` | Reserve – aktuell ungenutzt (Footer nutzt `fcb-surface`) |
| Border | `border-fcb-border` | `#2a2a2a` | `#d4d4d4` | Trennlinien, Rahmen |
| Text | `text-fcb-text` | `#ffffff` | `#111111` | Primärtext |
| Muted | `text-fcb-muted` | `#888888` | `#5a5a5a` | Datum, Metainfo |
| Navbar | `bg-fcb-nav` | `#52525b` | `#e4e4e7` | Reserve – aktuell ungenutzt (Header nutzt `fcb-surface`) |
| FCB-Blau | `text-fcb-blue` / `bg-fcb-blue` | `#1d5fad` | (konstant) | FCB-Akzent: Links, aktive States, CTAs |
| JFG-Rot | `text-fcb-red` / `bg-fcb-red` | `#cc1f1f` | (konstant) | JFG-Bereich-Akzent |

### Typografie
- **Display / Headlines**: `font-oswald` → Oswald (via `next/font/google`, CSS-Variable – lädt zuverlässig) – Gewicht 600–700, gerne Großbuchstaben. **Hinweis:** `font-display` existiert ebenfalls, ist aber NICHT an `next/font` gebunden → für neue Komponenten `font-oswald` nehmen.
- **Fließtext / UI**: `font-inter` → Inter – Gewicht 400/500. Der Body-Default ist Inter (via `globals.css` über die CSS-Variable aus `layout.tsx`); `font-oswald` wird per Klasse aktiviert.

### Design-Prinzipien
- **Keine Emojis** in der UI – ausschließlich Lucide-Icons
- **Smart-Sticky-Nav**: verschwindet beim Scrollen nach unten, erscheint beim Scrollen nach oben (Framer Motion)
- **Framer Motion** für alle Animationen (Einblendungen, Hover, Übergänge)
- **Ladescreen**: Beim ersten Aufruf kurzer FCB-Ladescreen (~1,5 Sek.) mit Wappen auf schwarzem Hintergrund
- **Accessibility**: Kontrast WCAG AA einhalten, Fokus-States immer sichtbar
- **Keine magic hex-values** im Code – immer `fcb.*`-Tokens verwenden

### Cards & Flächen
Basis-Primitive: `src/components/ui/Card.tsx` (rückwärtskompatibel erweitert um `interactive` + `accent`).

| Eigenschaft | Wert | Verwendung |
|---|---|---|
| Radius groß | `rounded-2xl` (16 px) | Cards, Panels, Modals |
| Radius klein | `rounded-lg` (8 px) | Banner, Buttons, Inputs, kleine Flächen |
| Border | `border border-fcb-border` (1 px) | jede Card – Flächen heben sich per Border ab, nicht per Schatten |
| Fläche | `bg-fcb-surface` | Standard-Card-Hintergrund |
| Padding | `p-6` | Standard; kompakte Flächen `p-4` |
| Akzentkante | Card-Prop `accent` (blue/red) → `border-l-4` in Trägerfarbe | Bereichs-/Trägerzuordnung: FCB = blue, JFG = red |
| Hover | Card-Prop `interactive` → Border färbt sich zum Akzent (`transition-colors`, 200 ms) | nur klickbare/verlinkte Cards; statische Cards ohne Hover |

- **Card vs. Banner**: Card = strukturierender Inhalts-Container (Gruppen, Listen-Items, Teaser). Banner (`ui/Banner.tsx`) = Statusmeldung mit Icon (error/info/success/warning) – nie als Layout-Container zweckentfremden.
- **Akzentflächen/Tints** immer als Token mit Opacity-Modifier: `bg-<akzent>/10` + `border-<akzent>/40` (Badge-/Banner-Muster) – nie voll gesättigte Flächen für dezente Hervorhebung.
- **Kein Scale/Lift** beim Card-Hover – die Border-Farbe ist die Affordanz.

### Buttons
Primitive: `src/components/ui/Button.tsx` – Basis: `rounded-lg font-oswald font-semibold uppercase tracking-wide`, sichtbarer Fokus-Ring (`focus-visible:ring-2` in `fcb-blue`).

| Variante | Optik | Wann |
|---|---|---|
| `primary` | `bg-fcb-blue text-white`, Hover `/90` | Hauptaktion – max. eine pro View/Formular |
| `secondary` | `border-fcb-border bg-fcb-surface`, Hover-Border blau | gleichwertige/neutrale Nebenaktionen |
| `ghost` | nur Text, Hover `text-fcb-blue` | tertiäre/Inline-Aktionen, Abbrechen |
| `danger` | `bg-fcb-red text-white`, Hover `/90` | destruktive Aktionen (Löschen) – immer mit Bestätigungs-Modal |

| Größe | Padding/Text | Wann |
|---|---|---|
| `sm` | `px-3 py-1.5 text-xs` | Tabellen-/Listen-Aktionen |
| `md` | `px-4 py-2.5 text-sm` | Standard (Formulare, Modals) |
| `lg` | `px-5 py-3 text-base` | Hero-/Seiten-CTAs |

- **Icon im Button**: Lucide, `size={16}` bei sm/md, `size={20}` bei lg, immer `aria-hidden` (der Button-Text trägt die Bedeutung); Abstand kommt aus dem `gap-2` der Button-Basis.
- **Icon-only-Buttons** brauchen zwingend ein deutsches `aria-label`.

### Icons
Nur **Lucide** (`lucide-react`); Brand-/Social-Icons ausschließlich über `src/components/icons/BrandIcons.tsx`.

| Größe | Einsatz |
|---|---|
| `16` | inline im Text, Buttons sm/md, Meta-Zeilen, Banner |
| `20` | Standard: Navigation, Buttons lg, Listen-Icons |
| `24` | Feature-Icons, Empty-States, Icon-Badge lg |

- **strokeWidth**: Standard `2`; nur große dekorative Icons (≥ 28 px) dürfen `1.5` für leichtere Optik.
- **Icon-Badge-Muster** (`src/components/ui/IconBadge.tsx`): Lucide-Icon in dezentem Container – Tint `bg-<akzent>/10` + `border-<akzent>/40`, Akzent `neutral`/`blue`/`red`, Größen `sm` (32 px Box / 16er-Icon, `rounded-lg`), `md` (40/20, `rounded-xl`), `lg` (48/24, `rounded-xl`). Für Feature-Aufzählungen, Card-Köpfe, Team-Cards.
- **A11y**: dekorative Icons `aria-hidden`; bedeutungstragende Icons mit deutschem `aria-label` (IconBadge: `label`-Prop → `role="img"`).

### Banner / Statusmeldungen
Primitiv: `src/components/ui/Banner.tsx` – vier Varianten, je mit fester Farbe + Lucide-Icon:

| Variante | Farbe | Icon | Einsatz |
|---|---|---|---|
| `warning` | Gelb (`border-yellow-500/40 bg-yellow-500/10`, Icon `text-yellow-600 dark:text-yellow-500`) | `TriangleAlert` | **Standard für „wartet auf Freigabe/Prüfung"**-Meldungen (z. B. Konto-Status `ausstehend`) – nicht pro Fall neu einfärben, immer dieses Gelb |
| `info` | FCB-Blau (`border-fcb-blue/40 bg-fcb-blue/10`, Icon `text-fcb-blue`) | `Info` | neutrale Hinweise ohne Handlungsdruck, z. B. „Rolle reicht für diesen Bereich nicht aus" (`ZugriffsHinweis`) |
| `success` | Grün | `CheckCircle2` | erfolgreiche Aktionen |
| `error` | Rot (`fcb-red`) | `AlertCircle` | Fehler, blockierende Probleme |

- **Rollen-Zugriffshinweis** (`src/components/ui/ZugriffsHinweis.tsx`): einheitliche Komponente für Seiten mit Rollen-Gate (`/kalender`, `/vorstand`, `/mitglieder`, `/mein-verein`). Unterscheidet bewusst zwei Fälle statt einer generischen „Kein Zugriff"-Meldung: Rolle `ausstehend` oder fehlend/unbekannt (fail-closed) → `warning`-Banner „Konto wartet auf Freigabe"; jede andere, bereits freigeschaltete Rolle ohne ausreichende Berechtigung → `info`-Banner „Rolle nicht vorgesehen". Das Account-Menü (`UserDropdown.tsx`) zeigt dafür allen eingeloggten Rollen (inkl. `ausstehend`) grundsätzlich alle Bereiche – die Zielseite kommuniziert fehlenden Zugriff selbst, statt den Link zu verstecken.
- **Banner vs. eigene Sperrseite**: Bei Rollen-Gates immer `ZugriffsHinweis` statt eine Seite händisch mit „Kein Zugriff"-Überschrift zu bauen – sonst entsteht wieder visuelle Uneinheitlichkeit.

### Mannschaftsdarstellung
- **Träger bestimmt den Akzent**: FCB-Teams (Herren, E-/F-/G-Jugend) → `fcb-blue`; JFG-Jugendteams (A-/B-/C-/D-Junioren) → `fcb-red`. Klassen-Sets liefert `getTeamAccent(traeger)` aus `src/lib/teams.ts` – nie manuell zusammenbauen.
- **Team-Daten**: `interface Team` in `src/lib/teams.ts` (`id`, `name`, `kurzname?`, `altersklasse?`, `liga?`, `traeger: "fcb" | "jfg"`, `beschreibung?`, `trainer?: string[]`).
- **Team-Card** (`src/components/ui/TeamCard.tsx`): interaktive Card mit Akzentkante links in Trägerfarbe. Aufbau von oben nach unten:
  1. Kopfzeile: `IconBadge` (Users-Icon, Trägerakzent) links, Träger-Badge (`FCB`/`JFG`, Pill mit Tint) rechts
  2. Teamname `font-oswald` uppercase + Altersklasse/Liga in `text-fcb-muted`
  3. optionale Beschreibung
  4. Trainer-Slot unter Trennlinie (`border-t border-fcb-border`) – aus `team.trainer` oder frei per `trainerSlot`-Prop
- **Träger-Badge** immer mit vollem Vereinsnamen für Screenreader (`TRAEGER_INFO` liefert Label + Namen).
- **Mobile-first**: volle Breite; ab `sm` im Grid (`grid gap-4 sm:grid-cols-2 lg:grid-cols-3`).
- **Einblendung**: dezente Framer-Motion-Einblendung (`whileInView`, y 16→0, einmalig, 0,4 s) – identisch zum Homepage-Muster; respektiert `prefers-reduced-motion`.

## Arbeitsweise: Plan-Modus

Handover-Prompts von Claudian sind grundsätzlich für den Plan-Modus formuliert: Sie
beschreiben Ziele und Anforderungen, keine Implementierungsschritte. Lies den Prompt
vollständig, erstelle einen strukturierten Plan (Was, in welcher Reihenfolge, warum so)
und warte auf Bastis Freigabe – erst dann wird Code geschrieben.

Ausnahme: Bei klar umrissenen Micro-Fixes (einzelne CSS-Anpassung, einzeiliger Bug-Fix,
Text-Änderung) ist Plan Mode unnötiger Overhead – dort direkt umsetzen.

## Session-Ende: Claudian-Update ausgeben

Nach jeder erledigten Aufgabe dieses Format ausgeben.
Basti kopiert es zu Claudian (dem Obsidian-Assistenten), der die Projektdokumentation aktualisiert.

Die Sektion „Manuell zu testen" ist Pflicht – sie darf nie leer bleiben. Basti testet händisch, bevor die nächste Aufgabe beginnt.

```
## Claudian-Update – [Datum]

### Implementiert
- [Was gebaut / geändert wurde]

### Manuell zu testen
Schritt-für-Schritt-Anleitung für Basti – was er im Browser prüfen soll, um sicherzugehen, dass die Änderungen wie erwartet funktionieren. Konkret und vollständig: welche Seite aufrufen, welche Aktion ausführen, was dabei zu sehen sein sollte (Erwartung) und was auf einen Fehler hindeutet.

Beispielformat:
1. [Seite/Funktion] → [Aktion] → [Erwartetes Ergebnis]
2. ...

### Getestet (automatisch / durch Claude)
- [Was Claude selbst geprüft hat, z. B. Build, Lint, Supabase-Queries]

### Offen / Nächster Block
- [Was als nächstes kommt]

### Technische Notizen
- [Wichtige Entscheidungen, Supabase-Änderungen, neue Abhängigkeiten etc.]
```
