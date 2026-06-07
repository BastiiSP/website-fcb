# FCB Website – Agent-Kontext (Codex u. a.)

> **Single Source of Truth: [`CLAUDE.md`](./CLAUDE.md).**
> Der gesamte Projektkontext – Tech-Stack, Rollenkonzept, Datenbankschema, Code-Regeln,
> Dateipfade, Design-Spec, Workflow und das Claudian-Update-Format – wird **ausschließlich**
> in `CLAUDE.md` gepflegt. Diese Datei verweist nur darauf, damit beide Dokumente nicht
> auseinanderdriften (frühere Duplizierung führte zu veralteten Angaben).

## Für Codex / andere Agenten

1. **Lies zuerst `CLAUDE.md` vollständig** – sie gilt 1:1 auch hier.
2. **Skill-Pfad-Hinweis:** Die dort referenzierten Skills (`supabase-tabelle-anlegen`,
   `fcb-komponente-bauen`) liegen unter `.claude/skills/`. Nutzt dein Agent ein anderes
   Skill-Verzeichnis, übertrage das Rezept sinngemäß – Inhalt und Workflow bleiben gleich.
3. **Kritisch (Auszug, Details in `CLAUDE.md`):** Rollensystem nie ohne Rücksprache ändern;
   `profiles`/`rolle` (nicht `profile`/`rollen`); bei neuen Tabellen GRANT + RLS nicht vergessen;
   lokaler `npm run build` scheitert an Turbopack+FullCalendar (kein eigener Bug) → mit
   `npm run lint` + `npx tsc --noEmit` verifizieren; alle UI-Texte/Kommentare auf Deutsch.

Alle Änderungen am Projektkontext bitte **in `CLAUDE.md`** vornehmen, nicht hier.
