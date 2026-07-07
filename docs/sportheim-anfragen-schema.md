# Schema-Vertrag: Sportheim-Anfragen

## Entscheidung

`sportheim_anfragen` ist eine gemeinsame Tabelle fuer oeffentliche Anfragen und interne Sperrtermine. Der Unterschied steht in `typ`; dadurch kann der Kalender belegte Zeitfenster aus einer einzigen Quelle lesen, ohne Kontakt- oder Anlassdaten oeffentlich freizugeben.

## Tabelle `public.sportheim_anfragen`

| Spalte | Typ | Regeln |
|---|---|---|
| `id` | `uuid` | Primary Key, Default `gen_random_uuid()` |
| `typ` | `text` | `anfrage` oder `sperrung`, Default `anfrage` |
| `vorname` | `text` | Pflicht bei `typ = 'anfrage'`, `null` bei `sperrung` |
| `nachname` | `text` | Pflicht bei `typ = 'anfrage'`, `null` bei `sperrung` |
| `email` | `text` | Pflicht bei `typ = 'anfrage'`, `null` bei `sperrung` |
| `telefonnummer` | `text` | Pflicht bei `typ = 'anfrage'`, `null` bei `sperrung` |
| `startzeit` | `timestamptz` | Pflicht |
| `endzeit` | `timestamptz` | Pflicht, muss nach `startzeit` liegen |
| `anlass` | `text` | Pflicht bei `typ = 'anfrage'`, optional intern bei `sperrung` |
| `nachricht` | `text` | Optional |
| `status` | `text` | `offen`, `angenommen`, `abgelehnt`; Default `offen`; bei `sperrung` immer `angenommen` |
| `erstellt_von` | `uuid` | Optionaler FK auf `auth.users(id)`, `on delete set null` |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()`, Trigger `set_sportheim_anfragen_updated_at` via `public.handle_updated_at()` |

## Funktion `public.sportheim_belegte_zeiten()`

Signatur:

```sql
public.sportheim_belegte_zeiten()
returns table (
  startzeit timestamptz,
  endzeit timestamptz,
  typ text
)
stable security definer
```

Filter:

- gibt nur `status = 'angenommen'` oder `typ = 'sperrung'` zurueck
- gibt keine Kontaktfelder, keinen `anlass`, keine `nachricht`, keinen Status und keine IDs zurueck
- offene und abgelehnte Anfragen sind fuer den oeffentlichen Kalender unsichtbar

## RLS und GRANTs

Tabellen-GRANTs:

- `authenticated`: `SELECT`, `INSERT`, `UPDATE`, `DELETE` auf `public.sportheim_anfragen`
- `anon`: nur `INSERT` auf `public.sportheim_anfragen`

Tabellen-Policies:

- `sportheim_anfragen_select`: nur `authenticated` mit `public.get_own_rolle() in ('vorstand', 'admin')`
- `sportheim_anfragen_insert_vorstand_admin`: nur `authenticated` mit `public.get_own_rolle() in ('vorstand', 'admin')`
- `sportheim_anfragen_update`: nur `authenticated` mit `public.get_own_rolle() in ('vorstand', 'admin')`
- `sportheim_anfragen_delete`: nur `authenticated` mit `public.get_own_rolle() in ('vorstand', 'admin')`
- `sportheim_anfragen_insert_oeffentliche_anfrage`: `anon` und `authenticated` duerfen nur `typ = 'anfrage'`, `status = 'offen'`, `erstellt_von is null` einfuegen

Funktions-GRANTs:

- `anon`: `EXECUTE` auf `public.sportheim_belegte_zeiten()`
- `authenticated`: `EXECUTE` auf `public.sportheim_belegte_zeiten()`

Praktische Folgen:

- Anonyme Besucher koennen neue, offene Anfragen erstellen, aber keine bestehenden Zeilen lesen, aendern oder loeschen.
- Angemeldete Nicht-Vorstandsrollen koennen ebenfalls nur neue, offene Anfragen erstellen.
- Sperrtermine koennen nur Vorstand/Admin erstellen und werden durch Constraint immer als `angenommen` gespeichert.
- Statuswechsel sind ausschliesslich ueber Vorstand/Admin-Updates moeglich.
