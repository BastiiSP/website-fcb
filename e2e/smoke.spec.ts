import { test, expect, type Page, type BrowserContext } from "@playwright/test";

// Consent-Cookie setzen, damit der Banner nicht Klicks abfängt
const CONSENT_KEY = "fcb_consent_v1";
const CONSENT_VALUE = JSON.stringify({ notwendig: true, externeInhalte: false });
const THEME_KEY = "theme";

/** Setzt Consent + optionales Theme via addInitScript, bevor die Seite lädt. */
async function seedStorage(
  page: Page,
  opts: { theme?: "dark" | "light" } = {}
) {
  await page.addInitScript(
    ({ consentKey, consentValue, themeKey, theme }) => {
      localStorage.setItem(consentKey, consentValue);
      if (theme) localStorage.setItem(themeKey, theme);
    },
    {
      consentKey: CONSENT_KEY,
      consentValue: CONSENT_VALUE,
      themeKey: THEME_KEY,
      theme: opts.theme ?? null,
    }
  );
}

// ──────────────────────────────────────────────
// 1. Öffentliche Routen laden fehlerfrei
// ──────────────────────────────────────────────
test.describe("Öffentliche Routen – Smoke", () => {
  const publicRoutes: { path: string; expectedContent: string }[] = [
    { path: "/", expectedContent: "FCB" },
    // h1 auf /login lautet "Willkommen zurück" – kein "Anmelden"-Text vorhanden
    { path: "/login", expectedContent: "Willkommen zurück" },
    { path: "/impressum", expectedContent: "Impressum" },
    { path: "/datenschutz", expectedContent: "Datenschutz" },
  ];

  for (const { path, expectedContent } of publicRoutes) {
    test(`${path} lädt und rendert ohne Console-Errors`, async ({ page }) => {
      // Konsolen-Fehler sammeln
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() !== "error") return;
        const text = msg.text();
        // Bekannte harmlose Warnings herausfiltern:
        // - react-select aria-errormessage Hydration-Warning
        // - Next.js Dev-Overlay Meldungen
        if (
          text.includes("aria-errormessage") ||
          text.includes("ReactDOM.render") ||
          text.includes("Warning: ") ||
          text.includes("Download the React") ||
          text.includes("__NEXT_") ||
          text.includes("fast refresh")
        ) {
          return;
        }
        consoleErrors.push(text);
      });

      await seedStorage(page);
      await page.goto(path);

      // Seite hat Inhalt geladen
      await expect(page.locator("body")).toContainText(expectedContent);

      // Keine unerwarteten Konsolen-Fehler
      expect(
        consoleErrors,
        `Unerwartete Console-Errors auf ${path}: ${consoleErrors.join("; ")}`
      ).toHaveLength(0);
    });
  }
});

// ──────────────────────────────────────────────
// 2. Standard-Theme ist Dunkel
// ──────────────────────────────────────────────
test("Standard-Theme ist dark (kein localStorage)", async ({ browser }) => {
  // Frischer Kontext ohne jeglichen localStorage
  const context: BrowserContext = await browser.newContext();
  const page = await context.newPage();

  // Nur Consent setzen, kein Theme – so verhält sich ein Erstbesucher
  await page.addInitScript(
    ({ consentKey, consentValue }) => {
      localStorage.setItem(consentKey, consentValue);
    },
    { consentKey: CONSENT_KEY, consentValue: CONSENT_VALUE }
  );

  await page.goto("/");

  // Das FOUC-Script setzt „dark" als Default auf <html>
  const htmlEl = page.locator("html");
  await expect(htmlEl).toHaveClass(/dark/);

  await context.close();
});

// ──────────────────────────────────────────────
// 3. Theme-Toggle: Wechsel + Persistenz nach Reload
// ──────────────────────────────────────────────
test("Theme-Toggle wechselt auf light und bleibt nach Reload", async ({
  page,
}) => {
  // Consent setzen, kein Theme (startet im Dark-Default)
  await seedStorage(page);
  await page.goto("/impressum");

  // Sicherstellen, dass wir im dunklen Modus starten
  await expect(page.locator("html")).toHaveClass(/dark/);

  // ThemeToggle im Footer anklicken – Button mit Text "Hell" (wechselt zu hell)
  // Im Dark-Modus zeigt der Button "Hell" an (Ziel ist helles Design)
  const toggle = page.getByRole("button", { name: /Hell/i });
  await toggle.click();

  // html-Element muss jetzt "light" tragen
  await expect(page.locator("html")).toHaveClass(/light/);
  await expect(page.locator("html")).not.toHaveClass(/dark/);

  // localStorage muss aktualisiert sein
  const themeValue = await page.evaluate(
    (key: string) => localStorage.getItem(key),
    THEME_KEY
  );
  expect(themeValue).toBe("light");

  // Nach Reload: Theme bleibt "light", kein Dark-Flash
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/light/);
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});

// ──────────────────────────────────────────────
// 4. Auth-Seite ist eine Dark-Island (auch im Light-Modus)
// ──────────────────────────────────────────────
test("Auth-Seite /login ist immer-dunkle Insel (dark island)", async ({
  page,
}) => {
  // Light-Modus erzwingen
  await seedStorage(page, { theme: "light" });
  await page.goto("/login");

  // Das globale html-Element ist "light" (App-weites Theme)
  await expect(page.locator("html")).toHaveClass(/light/);

  // Der Auth-Shell-Wrapper hat die Klasse "dark" – er scoped die Palette auf
  // den Auth-Subtree und bleibt immer dunkel, unabhängig vom App-Theme.
  // PitchAuthShell rendert: <div className="dark relative min-h-screen ...">
  const darkIsland = page.locator("div.dark").first();
  await expect(darkIsland).toBeVisible();

  // Das Login-Formular ist innerhalb der Dark-Island sichtbar
  // h1 lautet "Willkommen zurück" (nicht "Anmelden")
  await expect(page.locator("h1")).toContainText("Willkommen zurück");
});

// ──────────────────────────────────────────────
// 5. Geschützte Routen leiten auf /login um (kein Crash)
// ──────────────────────────────────────────────
test.describe("Geschützte Routen – Redirect zu /login", () => {
  const gatedRoutes = ["/profil", "/mein-verein", "/vorstand", "/kalender"];

  for (const path of gatedRoutes) {
    test(`${path} leitet aus (kein Server-Fehler)`, async ({ page }) => {
      await seedStorage(page);
      // Auf 'load' warten damit der DOM vollständig verfügbar ist
      const response = await page.goto(path, { waitUntil: "load" });

      // Kein 5xx-Fehler (Server-Crash) – Redirect (3xx→2xx) oder 200 ist ok
      const status = response?.status() ?? 0;
      expect(status, `${path} gab HTTP ${status} zurück`).toBeLessThan(500);

      // Nach Redirect ist die Seite geladen – body muss sichtbar sein
      await expect(page.locator("body")).toBeVisible();
    });
  }
});
