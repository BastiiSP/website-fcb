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
- **Tailwind CSS 3**
- **Supabase** (PostgreSQL + Auth + RLS)
- **FullCalendar 6** (Buchungskalender)
- **Vercel** (Hosting + Analytics)

## Rollenkonzept – KRITISCH

Niemals ohne Rücksprache ändern. Das Rollensystem ist das Herzstück der Zugangskontrolle.

| Rolle | Wer | Rechte |
|---|---|---|
| `ausstehend` | Jeder nach Selbstregistrierung | Kein Zugriff auf Buchungen – wartet auf Freigabe |
| `trainer` | Trainer, Platzwarte, Betreuer | Platzbuchungen anlegen & eigene verwalten |
| `vorstand` | Vorstandsmitglieder | Alles + alle Buchungen verwalten + Nutzer freischalten |
| `admin` | IT-Verantwortlicher | Alles + Vorstandsrollen und Admin-Rollen vergeben |

**Wichtig:** Vorstand darf nur zwischen `ausstehend` ↔ `trainer` wechseln. Nur `admin` darf `vorstand` und `admin` vergeben.

## Datenbankschema (Phase 1 – aktiv)

### Tabelle: `profiles`

| Spalte | Typ | Besonderheit |
|---|---|---|
| `id` | UUID | FK → auth.users, Primary Key |
| `vorname` | TEXT | NOT NULL |
| `nachname` | TEXT | NOT NULL |
| `telefonnummer` | TEXT | optional |
| `rolle` | TEXT | DEFAULT 'ausstehend', CHECK (ausstehend/trainer/vorstand/admin) |
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

### Tabelle: `mitglieder` (Phase 2 – noch nicht implementiert)

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

## Code-Regeln

- **Tabellenname**: `profiles` (Plural) – niemals `profile` (Singular, das war der alte kaputte Name)
- **Spaltenname**: `rolle` (Singular, String) – niemals `rollen` (Plural/Array, das war der alte kaputte Name)
- **TypeScript strict**: Keine `any` Types. Immer explizite Interfaces definieren.
- **RLS immer aktiv**: Zugangskontrolle läuft in der Datenbank, nicht nur im Frontend
- **GRANTs nicht vergessen**: Bei jeder neuen Tabelle explizit `GRANT SELECT, INSERT, UPDATE, DELETE ON public.<tabelle> TO authenticated;` ausführen – ohne das greift RLS nie, da Postgres vorher mit „permission denied" abbricht. Bereits zweimal vergessen: `buchungen` (2026-05-22) und `mitglieder` (2026-05-26).
- **Supabase MCP nutzen**: Für alle Datenbankoperationen den MCP-Server verwenden
- **Keine direkten DB-Calls ohne RLS-Check** in Server Components
- **Fehlerbehandlung**: Alle Supabase-Calls mit try/catch und aussagekräftigen Fehlermeldungen
- **Deutsch**: Alle UI-Texte, Fehlermeldungen und Kommentare auf Deutsch
- **Codekommentare**: Neuen und geänderten Code sinnvoll kommentieren – nicht jede Zeile, aber überall dort, wo der Zusammenhang nicht sofort klar ist. Kommentare erklären das *Warum* oder den *Kontext*, nicht das *Was* (das liest man am Code selbst). Beispiele wo kommentiert wird: komplexe Logik, nicht-offensichtliche Bedingungen, RLS-relevante Stellen, Supabase-spezifisches Verhalten, Workarounds oder bewusste Entscheidungen.

## Wichtige Dateipfade

```
src/
├── app/
│   ├── kalender/page.tsx       ← Buchungskalender (nur trainer/vorstand/admin)
│   ├── vorstand/page.tsx       ← Admin-Bereich (nur vorstand/admin)
│   ├── login/page.tsx
│   ├── registrieren/page.tsx
│   └── confirm-email/page.tsx
├── components/
│   ├── Buchungsformular.tsx
│   ├── BenutzerListe.tsx       ← Nutzerverwaltung im Vorstand-Bereich
│   ├── BearbeitenModal.tsx
│   └── LoeschenModal.tsx
├── lib/
│   └── supabaseClient.ts       ← Supabase-Client (anon key)
└── utils/
    ├── checkSession.ts         ← Session + Rolle prüfen
    ├── getUserRolle.ts         ← Rolle eines Users abrufen
    └── fetchEvents.ts          ← Buchungen laden
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
npm run build      # Production Build
npm run lint       # ESLint
```

## Deployment

Push auf `main` → Vercel deployed automatisch.
Vor dem Push immer `npm run build` lokal prüfen.

```bash
git add -A
git commit -m "feat: [beschreibung]"
git push
```

## Arbeitsweise: Plan-Modus

Handover-Prompts von Claudian sind für den Plan-Modus formuliert: Sie beschreiben Ziele
und Anforderungen, keine Implementierungsschritte. Lies den Prompt vollständig, erstelle
einen strukturierten Plan (Was, in welcher Reihenfolge, warum so) und warte auf Bastis
Freigabe – erst dann wird Code geschrieben.

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
