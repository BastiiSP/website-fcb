# Website des 1. FC 1911 Burgkunstadt

Offizielle Vereinswebsite mit öffentlichem Bereich (Verein, Mannschaften mit BFV-Tabellen,
News via Instagram, Kontakt) und internem Bereich (Platzbuchungskalender, Mitglieder- und
Nutzerverwaltung mit Rollensystem).

**Live:** https://www.fcbuku.de

## Tech-Stack

- [Next.js 16](https://nextjs.org) (App Router) · React 19 · TypeScript 5 (strict)
- Tailwind CSS 3.4 (Dual-Theme hell/dunkel über semantische Tokens) · Framer Motion 12
- [Supabase](https://supabase.com) (PostgreSQL, Auth, RLS)
- FullCalendar 6 (Buchungskalender)
- Vercel (Hosting, auto-deploy bei Push auf `main`)

## Lokale Entwicklung

```bash
npm install
npm run dev        # Entwicklungsserver auf localhost:3000
npm run lint       # ESLint
npm run test:e2e   # Playwright-Smoke-Suite (e2e/smoke.spec.ts)
```

Benötigt `.env.local` mit `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

**Hinweis:** Der lokale `npm run build` scheitert häufig an einer bekannten
Turbopack+FullCalendar-Inkompatibilität – das ist kein eigener Bug, Vercel baut sauber.
Verifikation vor dem Push: `npm run lint` + `npx tsc --noEmit`.

## Projektkontext

Der vollständige Projektkontext (Rollenkonzept, Datenbankschema, Code-Regeln, Design-Spec,
Dateipfade, Workflow) ist in [`CLAUDE.md`](./CLAUDE.md) dokumentiert – Single Source of Truth,
gilt auch für andere Agenten (siehe [`AGENTS.md`](./AGENTS.md)).
