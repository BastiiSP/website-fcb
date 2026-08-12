---
name: e2e-tenant-test-schreiben
description: Beim Schreiben eines neuen Playwright-E2E-Tests in e2e/ – Consent-Seeding, ?tenant=jfg-Override, Akzentfarben-Check, rollenbasiertes Mocking. Triggert bei neuer E2E-Test, Playwright-Test, e2e/*.spec.ts, Tenant-Test, FCB/JFG-Testfall, test:e2e.
---

# E2E-Tenant-Test schreiben (FCB)

## Überblick

Verifiziertes Muster für neue Playwright-Tests in `e2e/`, extrahiert aus den bestehenden
Suiten `e2e/tenant.spec.ts`, `e2e/bfv.spec.ts`, `e2e/sportheim.spec.ts` und
`e2e/smoke.spec.ts`. **Kernprinzip:** Die JFG-Domain ist zwar live, aber Preview-Deployments
und lokale Läufe testen die JFG-Marke weiterhin über den Test-Override `?tenant=jfg`
(siehe `src/proxy.ts`), nicht über eine echte zweite Domain.

## Verifizierte Bausteine (NICHT raten)

| Baustein | Korrekter Wert |
|---|---|
| Testverzeichnis | `e2e/*.spec.ts` – `playwright.config.ts` hat `testDir: "./e2e"` |
| Ausführen | `npm run test:e2e` (= `playwright test`). Startet `npm run dev` automatisch, `reuseExistingServer: true` – ein bereits laufender Dev-Server wird wiederverwendet. |
| Consent-Key | `"fcb_consent_v1"` in `localStorage`, Wert `JSON.stringify({ notwendig: true, externeInhalte: false })` – ohne das fängt der Cookie-Banner Klicks ab |
| Consent setzen | `page.addInitScript(...)` **vor** `page.goto()`, nicht danach (Banner rendert sofort) |
| Tenant-Override | Query-Param `?tenant=jfg` bzw. `?tenant=fcb` (siehe `src/lib/tenant.ts`: `TENANT_QUERY_PARAM`). Setzt serverseitig das Cookie `fcb-tenant` (`TENANT_COOKIE`), das die Folgenavigation im gewählten Auftritt hält. Auf echten Produktionsdomains wirkungslos – nur relevant für localhost/Preview, dort wird aber getestet. |
| Tenant-Attribut prüfen | `await expect(page.locator("html")).toHaveAttribute("data-tenant", "fcb" \| "jfg")` |
| Akzentfarbe auslesen | CSS-Variable `--color-accent` auf `<html>` per `getComputedStyle`, liefert RGB-Kanäle als String (nicht Hex!): FCB `"29 95 173"` (`#1d5fad`), JFG `"204 31 31"` (`#cc1f1f`) |
| Hostname-Zuordnung (kein Browser nötig) | `tenantAusHostname()` / `istProduktionsHost()` aus `src/lib/tenant.ts` direkt importieren und als reine Funktions-Unit-Tests in einem `test.describe`-Block ohne `page` prüfen |
| Rollen-Mocking (aus `smoke.spec.ts`) | Für rollengeschützte Seiten: Supabase-Session + Profil in `localStorage` seeden (Key `sb-<project-ref>-auth-token`) und `page.route("**/rest/v1/profiles**", ...)` sowie `**/auth/v1/user`/`**/auth/v1/token**` mocken – siehe `mockEingeloggterNutzer()` in `e2e/smoke.spec.ts` als Vorlage, nicht neu erfinden |
| Unit-Tests ohne Browser (aus `bfv.spec.ts`) | Reine Funktionslogik (z. B. `src/lib/bfv.ts`, `src/lib/sportheim.ts`) direkt importieren und `globalThis.fetch` mocken statt eine Seite zu laden – schneller und stabiler als ein UI-Test für reine Datenverarbeitung |

## Kanonisches Vorbild: `e2e/tenant.spec.ts`

Zeigt das vollständige moderne Muster:

```ts
import { test, expect, type Page } from "@playwright/test";
import { tenantAusHostname, istProduktionsHost } from "../src/lib/tenant";

const CONSENT_KEY = "fcb_consent_v1";
const CONSENT_VALUE = JSON.stringify({ notwendig: true, externeInhalte: false });
const AKZENT_FCB = "29 95 173"; // #1d5fad
const AKZENT_JFG = "204 31 31"; // #cc1f1f

async function seedConsent(page: Page) {
  await page.addInitScript(
    ({ key, value }) => localStorage.setItem(key, value),
    { key: CONSENT_KEY, value: CONSENT_VALUE }
  );
}

async function akzentVariable(page: Page): Promise<string> {
  return page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim()
  );
}

test.describe("Mein Feature je Marke", () => {
  test("FCB zeigt X", async ({ page }) => {
    await seedConsent(page);
    await page.goto("/meine-route");
    await expect(page.locator("html")).toHaveAttribute("data-tenant", "fcb");
    expect(await akzentVariable(page)).toBe(AKZENT_FCB);
  });

  test("JFG zeigt Y", async ({ page }) => {
    await seedConsent(page);
    await page.goto("/meine-route?tenant=jfg");
    await expect(page.locator("html")).toHaveAttribute("data-tenant", "jfg");
    expect(await akzentVariable(page)).toBe(AKZENT_JFG);
  });
});
```

## Workflow-Checkliste

1. **Datei benennen** nach Feature, nicht nach Testtyp: `e2e/<feature>.spec.ts` (Vorbild: `bfv.spec.ts`, `sportheim.spec.ts`, nicht `test1.spec.ts`).
2. **Consent zuerst**: Jeder Test, der `page.goto()` auf eine echte Route macht, ruft vorher `seedConsent(page)` auf – sonst blockt der Cookie-Banner Klicks/Assertions.
3. **Beide Marken testen**, wenn das Feature tenant-abhängig ist: einmal ohne Override (FCB) und einmal mit `?tenant=jfg`. Bei rein markenneutralen Features (z. B. BFV-Parsing-Logik) reicht ein Testfall.
4. **404-Fälle für markenexklusive Routen** nicht vergessen (Vorbild: `/sportheim` ist FCB-exklusiv – `e2e/tenant.spec.ts` prüft sowohl den 404 auf JFG als auch den 200 auf FCB).
5. **Farbe UND Text prüfen**, nicht nur eins – ein Test, der nur `data-tenant` prüft, hätte die Farb-Regression von `--color-accent` nicht gefangen.
6. **Reine Logik ohne Browser testen** wenn möglich (`bfv.spec.ts`-Muster) – schneller, kein Dev-Server-Flakiness.
7. **Deutsche Kommentare fürs Warum**, besonders bei Regressionstests (Vorbild: die Kommentare in `tenant.spec.ts` zu Vercel-Preview-Aliasen und in `bfv.spec.ts` zu Sportheim-Sperren erklären *warum* der Test existiert, nicht nur *was* er prüft).
8. **Ausführen** vor Commit: `npm run test:e2e` (ganze Suite) oder `npx playwright test e2e/<datei>.spec.ts` (gezielt).

## Häufige Fehler

| Fehler | Folge / Fix |
|---|---|
| `page.goto()` vor `seedConsent()` | Cookie-Banner überlagert die Seite, Klicks/Assertions schlagen fehl |
| Akzentfarbe als Hex geprüft (`"#1d5fad"`) | `getComputedStyle` liefert RGB-Kanäle als Space-separierten String (`"29 95 173"`), kein Hex |
| `?tenant=jfg` in einem Test gesetzt, im nächsten `test()` derselben Datei nicht zurückgesetzt | Cookie `fcb-tenant` überlebt nicht automatisch zwischen `test()`-Blöcken (jeder Test bekommt einen frischen Context) – i. d. R. unkritisch, aber bei Navigation innerhalb *eines* Tests zurückschalten via `?tenant=fcb` |
| Neue markenexklusive Route ohne 404-Test auf der anderen Marke | Regression bleibt unbemerkt – siehe `e2e/tenant.spec.ts` "/sportheim ist auf dem JFG-Auftritt nicht erreichbar" als Pflicht-Gegenstück |
| Rollen-Mocking neu erfunden statt `mockEingeloggterNutzer()` aus `smoke.spec.ts` zu nutzen/kopieren | Doppelte, potenziell inkonsistente Session-Mocks |
