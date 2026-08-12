---
name: rls-rollenkonzept-check
description: Vor Änderungen an RLS-Policies oder Zugriffslogik der Tabellen profiles/buchungen – prüft gegen das in CLAUDE.md als KRITISCH markierte Rollenkonzept. Triggert bei RLS-Policy ändern, profiles-Policy, buchungen-Policy, Rollenrechte, rolle-Spalte, Migration mit "on public.profiles"/"on public.buchungen", Rollen vergeben.
---

# RLS-Rollenkonzept-Check (FCB)

## Überblick

Das Rollensystem ist laut CLAUDE.md ("Rollenkonzept – KRITISCH") das Herzstück der
Zugangskontrolle und darf **niemals ohne Rücksprache geändert werden**. Dieses Skill
prüft geplante Änderungen an `profiles`- und `buchungen`-RLS gezielt gegen die
dokumentierte Rollenhierarchie, bevor eine Migration angewendet wird.

## Rollenkonzept (verbindlich, aus CLAUDE.md)

| Rolle | Wer | Rechte |
|---|---|---|
| `ausstehend` | Jeder nach Selbstregistrierung | Nur Profil-Seite – wartet auf Freigabe durch Vorstand |
| `mitglied` | Vereinsmitglieder mit Login | Mein-Verein-Seite + Profil; **kein** Kalender-Zugriff |
| `trainer` | Trainer, Platzwarte, Betreuer | Platzbuchungen anlegen & eigene verwalten |
| `vorstand` | Vorstandsmitglieder | Alles + alle Buchungen verwalten + Nutzer freischalten |
| `admin` | IT-Verantwortlicher | Alles + Vorstandsrollen und Admin-Rollen vergeben |

**Eskalationsregel (die eigentlich kritische Zeile):** Vorstand darf zwischen
`ausstehend` / `mitglied` / `trainer` wechseln. **Nur `admin` darf `vorstand` und
`admin` vergeben.**

## Verifizierter Ist-Zustand (NICHT raten)

| Baustein | Korrekter Wert |
|---|---|
| Rollen-Helper für RLS | `public.get_own_rolle()` (`STABLE SECURITY DEFINER`) – IMMER statt Inline-`EXISTS (SELECT … FROM profiles)`, sonst RLS-Rekursion auf `profiles` |
| RLS-Muster „nur vorstand/admin" | `get_own_rolle() = any (array['vorstand'::text, 'admin'::text])` (Vorbild: `supabase/migrations/20260707120000_create_sportheim_anfragen.sql`) |
| Bestehende `profiles`-Policy-Erweiterung | `supabase/migrations/20260708120000_allow_trainer_directory_profiles_select.sql` – SELECT gezielt nur um `trainer` erweitert (Trainer-Verzeichnis), nicht um `mitglied`/`ausstehend` |
| **Wo die Eskalationsregel aktuell durchgesetzt wird** | **Ausschließlich clientseitig** in `src/components/BenutzerListe.tsx`: `ROLLEN_OPTIONEN` (Zeile ~24) begrenzt, welche Ziel-Rolle ein `vorstand`- bzw. `admin`-Nutzer im Dropdown wählen darf; `rolleAendern()` (Zeile ~67) ruft danach direkt `supabase.from("profiles").update({ rolle: neueRolle }).eq("id", userId)` auf – ein normaler Client-Call, der komplett der `profiles`-UPDATE-RLS-Policy unterliegt |
| Privilegierte Server-Route ohne Rollen-Check | `src/app/api/benutzer-ablehnen/route.ts` nutzt `SUPABASE_SERVICE_ROLE_KEY` (umgeht RLS vollständig) und löscht per `auth.admin.deleteUser(userId)` einen Account – die Route selbst prüft **nicht**, ob der Aufrufer eingeloggt oder vorstand/admin ist |

## Der eigentliche Prüfpunkt

Weil die Eskalationsregel nur clientseitig gilt, hängt die Sicherheit der Rollenvergabe
komplett davon ab, was die `profiles`-UPDATE-Policy in der Datenbank tatsächlich erlaubt.
**Bei jeder Änderung an einer `profiles`-Policy (oder Erstprüfung der bestehenden)
konkret verifizieren:**

1. Erlaubt die UPDATE-Policy (`USING`/`WITH CHECK`) einem `vorstand`-Nutzer, die Spalte
   `rolle` einer fremden Zeile auf `vorstand` oder `admin` zu setzen? Falls ja: Lücke,
   ein direkter REST-Call an `/rest/v1/profiles` (unter Umgehung von `BenutzerListe.tsx`)
   könnte sich selbst zum Admin machen.
2. Erlaubt die Policy einem Nutzer, seine **eigene** `rolle` zu ändern (Privilegien-
   Eskalation über die eigene Zeile statt über eine fremde)?
3. Gilt für `buchungen` weiterhin exakt: `trainer`/`vorstand`/`admin` dürfen buchen,
   `mitglied`/`ausstehend` nicht (siehe Tabelle oben) – Policy-`USING`/`WITH CHECK` muss
   das 1:1 abbilden, nicht großzügiger sein.
4. Wird an einer neuen oder geänderten Server-Route unter `src/app/api/*` der
   `SUPABASE_SERVICE_ROLE_KEY` verwendet (umgeht RLS)? Dann muss die Route selbst Session
   + Rolle des Aufrufers prüfen (z. B. via `src/utils/checkSession.ts` /
   `getUserRolle.ts`) – RLS kann dort nichts absichern.
5. GRANT vorhanden? Ohne `grant select, insert, update, delete on public.<tabelle> to
   authenticated;` greift RLS nie (schon zweimal vergessen: `buchungen`, `mitglieder`).

## Workflow-Checkliste

1. **Vor jeder Migration** die betroffene(n) Policy(s) laut Punkt 1–5 oben durchgehen.
2. **Bei Unsicherheit über Absicht** (z. B. „soll `mitglied` jetzt auch lesen dürfen?")
   → Basti fragen, nicht raten. Das Rollensystem ist laut CLAUDE.md kritisch.
3. **Nach Anwendung**: Supabase-Security-Advisor (`get_advisors`, type `security`) prüfen
   – keine Warnung „RLS disabled" oder „policy exists but RLS not enabled".
4. **Test-Query als schwächste betroffene Rolle** fahren (z. B. als `vorstand` versuchen,
   `rolle` auf `admin` zu setzen) – muss abgelehnt werden.
5. Für neue Tabellen komplett: Skill `supabase-tabelle-anlegen` nutzen.

## Häufige Fehler

| Fehler | Folge / Fix |
|---|---|
| UPDATE-Policy auf `profiles` prüft nur „ist Aufrufer vorstand/admin", nicht welchen Wert er in `rolle` schreibt | Vorstand kann sich per direktem REST-Call zu `admin` machen – Eskalationsregel existiert nur in `BenutzerListe.tsx`, nicht in der DB |
| Neue Service-Role-Route ohne eigenen Rollen-Check | RLS greift nicht (Service-Role umgeht sie) – Route selbst muss Aufrufer verifizieren, siehe Lücke in `benutzer-ablehnen/route.ts` |
| Inline-`EXISTS (SELECT … FROM profiles)` in neuer Policy | RLS-Rekursion. `get_own_rolle()` verwenden |
| GRANT vergessen | „permission denied", RLS greift nie |
| `buchungen`-Schreibrechte versehentlich auf `mitglied` erweitert | Widerspricht Rollenkonzept – `mitglied` hat laut CLAUDE.md explizit „kein Kalender-Zugriff" |
