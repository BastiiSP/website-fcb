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

## Code-Regeln

- **Tabellenname**: `profiles` (Plural) – niemals `profile` (Singular, das war der alte kaputte Name)
- **Spaltenname**: `rolle` (Singular, String) – niemals `rollen` (Plural/Array, das war der alte kaputte Name)
- **TypeScript strict**: Keine `any` Types. Immer explizite Interfaces definieren.
- **RLS immer aktiv**: Zugangskontrolle läuft in der Datenbank, nicht nur im Frontend
- **GRANTs nicht vergessen**: Bei jeder neuen Tabelle explizit `GRANT SELECT, INSERT, UPDATE, DELETE ON public.<tabelle> TO authenticated;` ausführen – ohne das greift RLS nie, da Postgres vorher mit „permission denied" abbricht. Bereits zweimal vergessen: `buchungen` (2026-05-22) und `mitglieder` (2026-05-26).
- **Neue Tabelle anlegen**: Immer das Skill `supabase-tabelle-anlegen` nutzen (`.claude/skills/`) – verifiziertes Rezept mit korrekter Trigger-Funktion (`handle_updated_at()`), RLS-Muster (`get_own_rolle()`), GRANT und Workflow-Checkliste.
- **Komponente bauen/ändern**: Immer das Skill `fcb-komponente-bauen` nutzen (`.claude/skills/`) – verifizierte Werte für Tokens, Fonts, Icons, Framer Motion, A11y + die Migrations-Eigenheit (neu = `fcb.*`/dunkel, Legacy = noch hell, nicht blind kopieren).
- **Supabase MCP nutzen**: Für alle Datenbankoperationen den MCP-Server verwenden
- **Keine direkten DB-Calls ohne RLS-Check** in Server Components
- **Fehlerbehandlung**: Alle Supabase-Calls mit try/catch und aussagekräftigen Fehlermeldungen
- **Deutsch**: Alle UI-Texte, Fehlermeldungen und Kommentare auf Deutsch
- **Codekommentare**: Neuen und geänderten Code sinnvoll kommentieren – nicht jede Zeile, aber überall dort, wo der Zusammenhang nicht sofort klar ist. Kommentare erklären das *Warum* oder den *Kontext*, nicht das *Was* (das liest man am Code selbst). Beispiele wo kommentiert wird: komplexe Logik, nicht-offensichtliche Bedingungen, RLS-relevante Stellen, Supabase-spezifisches Verhalten, Workarounds oder bewusste Entscheidungen.

## Wichtige Dateipfade

```
src/
├── app/
│   ├── kalender/page.tsx          ← Buchungskalender (nur trainer/vorstand/admin)
│   ├── vorstand/page.tsx          ← Admin-Bereich (nur vorstand/admin)
│   ├── mitglieder/page.tsx        ← Mitgliederverwaltung (nur vorstand/admin)
│   ├── mein-verein/page.tsx       ← Vereinslinks & Info (mitglied + höher)
│   ├── profil/page.tsx            ← Profilverwaltung (alle eingeloggten Rollen)
│   ├── login/page.tsx
│   ├── registrieren/page.tsx
│   └── confirm-email/page.tsx
├── components/
│   ├── Navigation.tsx             ← Rollenbasierte Navigation (modern, fcb-Tokens)
│   ├── Header.tsx                 ← Smart-Sticky-Nav, kanonisches Design-Vorbild (modern)
│   ├── Footer.tsx
│   ├── ConditionalChrome.tsx      ← Blendet Header/Footer auf Preview-Routen aus
│   ├── UserDropdown.tsx           ← Nutzer-Menü in der Nav (modern, fcb-Tokens)
│   ├── ThemeToggle.tsx            ← Hell/Dunkel-Umschaltung (darkMode: 'class')
│   ├── Buchungsformular.tsx
│   ├── BenutzerListe.tsx          ← Nutzerverwaltung + Mannschaftsanfragen im Vorstand-Bereich
│   ├── MannschaftsanfragenVerwaltung.tsx
│   ├── BearbeitenModal.tsx / LoeschenModal.tsx
│   ├── MitgliederVerwaltung.tsx   ← Mitgliederverwaltung (Phase 2)
│   ├── MitgliedBearbeitenModal.tsx
│   ├── TrainerVerzeichnis.tsx
│   ├── NewsCard.tsx / NewsSection.tsx  ← Neuigkeiten (NewsCard noch Legacy-hell)
│   ├── TooltipContent.tsx
│   ├── ToastMessage.tsx           ← Globale Erfolgs-/Fehlermeldungen
│   ├── icons/BrandIcons.tsx       ← Facebook/Instagram als Inline-SVG (Lucide hat keine Brand-Icons)
│   ├── instagram/                 ← InstagramSection / InstagramCarousel (modern)
│   ├── hero/                      ← Hero-Varianten (Design-Exploration)
│   ├── auth-preview/              ← TEMPORÄR (design-round-2): navbar/ + dropdown/ Varianten, nach Auswahl löschen
│   └── profil/                    ← Profil-Unterkomponenten
│       ├── PersoenlicheDaten.tsx
│       ├── AccountSicherheit.tsx
│       ├── AvatarUploadModal.tsx
│       ├── MannschaftLizenzen.tsx
│       └── MannschaftsAnfrageModal.tsx
├── lib/
│   ├── supabaseClient.ts          ← Supabase-Client (anon key), importiert als @/lib/supabaseClient
│   ├── mannschaften.ts            ← Mannschaftsliste (Konstanten)
│   ├── lizenzen.ts                ← Lizenz-Daten
│   └── vereinslinks.ts            ← Externe Vereinslinks (WhatsApp, Social Media etc.)
└── utils/
    ├── checkSession.ts            ← Session + Rolle prüfen
    ├── getUserRolle.ts            ← Rolle eines Users abrufen
    ├── fetchEvents.ts             ← Buchungen laden
    ├── fetchNews.ts               ← Neuigkeiten laden
    ├── getEventColor.ts           ← Kalender-Farben nach Mannschaft
    ├── formatKalenderTitel.ts     ← Buchungstitel formatieren
    ├── formatCapitalized.ts       ← Hilfsfunktion Großschreibung
    └── passwortStaerke.ts         ← Passwort-Stärke-Berechnung
```

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
```

**Environment:** `.env.local` mit `NEXT_PUBLIC_SUPABASE_URL` und
`NEXT_PUBLIC_SUPABASE_ANON_KEY`. `src/lib/supabaseClient.ts` hat Placeholder-Fallbacks,
damit Preview-Branches ohne Env-Vars trotzdem bauen – auf `main` sind echte Werte gesetzt.

**Tests:** Keine automatisierten Tests (nur `dev`/`build`/`start`/`lint`). Verifikation läuft
über Lint, `npx tsc --noEmit` und manuelles Testen (s. „Manuell zu testen").

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

## Design-Spec (abgestimmt mit Claudian – Stand 2026-05-28)

Alle Designentscheidungen wurden gemeinsam mit Basti besprochen und sind verbindlich.
Bei neuen Komponenten und Änderungen **immer** diese Spec einhalten.
Die vollständige Designdokumentation liegt in der Obsidian-Projektdatei `02 Projekte/Website FCB.md`.

> **Migrationsstatus (wichtig!):** Das Projekt zieht schrittweise auf dieses Design um.
> Die `fcb.*`-Token-Optik (dunkel, Oswald/Inter) ist bereits in den **neuen/überarbeiteten**
> Komponenten umgesetzt (`Header`, `Navigation`, `UserDropdown`, `instagram/`, Homepage, alle
> Preview-Routen). **Viele Legacy-Seiten sind noch hell** (`gray-*`, `var(--background)`,
> Geist/Arial-Body in `globals.css`): u. a. `login`, `registrieren`, `profil`, `vorstand`,
> `kalender`, `mitglieder`, `NewsCard`. → **Beim Bauen das moderne Vorbild `Header.tsx` nehmen,
> NICHT die Legacy-Komponenten kopieren.** Legacy-Seiten nur dann aufs neue Design ziehen, wenn
> Basti das ausdrücklich beauftragt – nie ungefragt „mitmigrieren".

### Vereinskontext
- **FCB** = 1. FC 1911 Burgkunstadt – Mannschaften: 2× Herren, E-/F-/G-Jugend
- **JFG** = JFG Kunstadt-Obermain – Leistungsjugend: A-/B-/C-/D-Jugend (teils B1+B2)
- FCB und JFG teilen dieselbe Basis-Palette, unterscheiden sich durch ihre Akzentfarbe

### Farbpalette
Tokens sind in `tailwind.config.ts` unter `fcb.*` definiert:

| Token | Klasse | Hex | Verwendung |
|---|---|---|---|
| Hintergrund | `bg-fcb-bg` | `#0a0a0a` | Seiten-BG, Hero, dunkle Sections |
| Surface | `bg-fcb-surface` | `#161616` | Cards, Panels, Modals |
| Border | `border-fcb-border` | `#2a2a2a` | Trennlinien, Rahmen |
| Text | `text-fcb-text` | `#ffffff` | Primärtext |
| Muted | `text-fcb-muted` | `#888888` | Datum, Metainfo |
| Navbar | `bg-fcb-nav` | `#52525b` | Navbar-Hintergrund |
| FCB-Blau | `text-fcb-blue` / `bg-fcb-blue` | `#1d5fad` | FCB-Akzent: Links, aktive States, CTAs |
| JFG-Rot | `text-fcb-red` / `bg-fcb-red` | `#cc1f1f` | JFG-Bereich-Akzent |

### Typografie
- **Display / Headlines**: `font-oswald` → Oswald (via `next/font/google`, CSS-Variable – lädt zuverlässig) – Gewicht 600–700, gerne Großbuchstaben. **Hinweis:** `font-display` existiert ebenfalls, ist aber NICHT an `next/font` gebunden → für neue Komponenten `font-oswald` nehmen.
- **Fließtext / UI**: `font-inter` → Inter – Gewicht 400/500. (Globaler Default in `layout.tsx` ist aktuell noch Geist; Oswald/Inter werden per Klasse aktiviert.)

### Design-Prinzipien
- **Keine Emojis** in der UI – ausschließlich Lucide-Icons
- **Smart-Sticky-Nav**: verschwindet beim Scrollen nach unten, erscheint beim Scrollen nach oben (Framer Motion)
- **Framer Motion** für alle Animationen (Einblendungen, Hover, Übergänge)
- **Ladescreen**: Beim ersten Aufruf kurzer FCB-Ladescreen (~1,5 Sek.) mit Wappen auf schwarzem Hintergrund
- **Accessibility**: Kontrast WCAG AA einhalten, Fokus-States immer sichtbar
- **Keine magic hex-values** im Code – immer `fcb.*`-Tokens verwenden

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
