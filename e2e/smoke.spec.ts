import { test, expect, type Page, type BrowserContext } from "@playwright/test";

// Consent-Cookie setzen, damit der Banner nicht Klicks abfängt
const CONSENT_KEY = "fcb_consent_v1";
const CONSENT_VALUE = JSON.stringify({ notwendig: true, externeInhalte: false });
const THEME_KEY = "theme";
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://jktvmckqfklfziszfsxf.supabase.co";
const SUPABASE_REF = new URL(SUPABASE_URL).hostname.split(".")[0];
const SUPABASE_AUTH_STORAGE_KEY = `sb-${SUPABASE_REF}-auth-token`;
const TEST_USER_ID = "11111111-1111-4111-8111-111111111111";
const TEST_USER_EMAIL = "basti.test@example.com";

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

/** Mockt eine eingeloggte Supabase-Session plus Profilrolle für clientseitige Gates. */
async function mockEingeloggterNutzer(
  page: Page,
  opts: { rolle: string }
) {
  const now = Math.floor(Date.now() / 1000);
  const user = {
    id: TEST_USER_ID,
    aud: "authenticated",
    role: "authenticated",
    email: TEST_USER_EMAIL,
    email_confirmed_at: new Date(now * 1000).toISOString(),
    phone: "",
    confirmed_at: new Date(now * 1000).toISOString(),
    last_sign_in_at: new Date(now * 1000).toISOString(),
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {},
    identities: [],
    created_at: new Date(now * 1000).toISOString(),
    updated_at: new Date(now * 1000).toISOString(),
    is_anonymous: false,
  };
  const session = {
    access_token: "test-access-token",
    refresh_token: "test-refresh-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: now + 3600,
    user,
  };
  const profile = {
    id: TEST_USER_ID,
    vorname: "Basti",
    nachname: "Tester",
    email: TEST_USER_EMAIL,
    telefonnummer: null,
    avatar_url: null,
    rolle: opts.rolle,
    mannschaft: [],
  };

  await page.addInitScript(
    ({ storageKey, sessionValue }) => {
      localStorage.setItem(storageKey, JSON.stringify(sessionValue));
    },
    { storageKey: SUPABASE_AUTH_STORAGE_KEY, sessionValue: session }
  );

  await page.route("**/auth/v1/user", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(user),
    });
  });

  await page.route("**/auth/v1/token**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(session),
    });
  });

  await page.route("**/rest/v1/profiles**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "content-range": "0-0/1" },
      body: JSON.stringify(profile),
    });
  });
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

  // Der ThemeToggle ist jetzt ein Switch (role="switch").
  // Im Dark-Modus ist aria-checked="true" (Dunkel ist aktiv/eingeschaltet).
  const toggle = page.locator('[role="switch"]').first();
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-checked", "true");

  await toggle.click();

  // Nach dem Klick: aria-checked flippt auf "false" (Dunkel ist deaktiviert = hell aktiv)
  await expect(toggle).toHaveAttribute("aria-checked", "false");

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
// 4. Auth-Seite folgt dem Theme (kein Dark-Island mehr)
// ──────────────────────────────────────────────
test("Auth-Seite /login folgt dem globalen Theme (kein Dark-Island)", async ({
  page,
}) => {
  // Light-Modus erzwingen
  await seedStorage(page, { theme: "light" });
  await page.goto("/login");

  // Das globale html-Element ist "light" – und bleibt es auch auf der Auth-Seite
  await expect(page.locator("html")).toHaveClass(/light/);

  // Es gibt keinen .dark-Wrapper-Subtree mehr – Auth folgt dem globalen Theme
  const darkWrappers = page.locator(".dark");
  await expect(darkWrappers).toHaveCount(0);

  // Das Login-Formular ist sichtbar
  // h1 lautet "WILLKOMMEN ZURÜCK" (Oswald, uppercase) – enthält-Text-Prüfung
  await expect(page.locator("h1")).toContainText("Willkommen zurück");

  // Auf der Auth-Seite gibt es einen Theme-Switcher (role="switch")
  const themeSwitcher = page.locator('[role="switch"]').first();
  await expect(themeSwitcher).toBeVisible();
});

// ──────────────────────────────────────────────
// 5. Geschützte Routen leiten auf /login um (kein Crash)
// ──────────────────────────────────────────────
test.describe("Geschützte Routen – Redirect zu /login", () => {
  const gatedRoutes = ["/profil", "/mein-verein", "/vorstandsbereich", "/platzbuchung"];

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

// ──────────────────────────────────────────────
// 5b. Alte Routennamen leiten dauerhaft auf die neuen um (next.config.ts)
// ──────────────────────────────────────────────
test.describe("Alte Routen – Redirect auf neue Routennamen", () => {
  const umbenannteRouten = [
    { alt: "/kalender", neu: "/platzbuchung" },
    { alt: "/vorstand", neu: "/vorstandsbereich" },
  ];

  for (const { alt, neu } of umbenannteRouten) {
    test(`${alt} leitet auf ${neu} um`, async ({ page }) => {
      await seedStorage(page);
      await page.goto(alt, { waitUntil: "load" });

      // Nach dem Redirect landet die URL auf der neuen Route (Query/Hash ignorieren)
      expect(new URL(page.url()).pathname).toBe(neu);
    });
  }
});

// ──────────────────────────────────────────────
// 6. Rollen-Gates zeigen einheitliche Zugriffshinweise
// ──────────────────────────────────────────────
test.describe("Geschützte Routen – Rollen-Hinweise", () => {
  const freigabeRouten = ["/platzbuchung", "/vorstandsbereich", "/mitglieder", "/mein-verein"];

  for (const path of freigabeRouten) {
    test(`${path} zeigt für ausstehende Nutzer den Freigabe-Hinweis`, async ({
      page,
    }) => {
      await seedStorage(page);
      await mockEingeloggterNutzer(page, { rolle: "ausstehend" });

      await page.goto(path, { waitUntil: "load" });

      await expect(page.locator("body")).toContainText(
        "Dein Konto wartet noch auf Freigabe durch den Vorstand."
      );
      await expect(page.locator("body")).toContainText(
        "Sobald du freigeschaltet bist, hast du hier Zugriff."
      );
    });
  }

  for (const path of ["/platzbuchung", "/mitglieder"]) {
    test(`${path} zeigt für Mitglieder den Rollen-Hinweis statt Freigabe-Hinweis`, async ({
      page,
    }) => {
      await seedStorage(page);
      await mockEingeloggterNutzer(page, { rolle: "mitglied" });

      await page.goto(path, { waitUntil: "load" });

      await expect(page.locator("body")).toContainText(
        "Dieser Bereich ist für deine aktuelle Rolle (Mitglied) nicht vorgesehen."
      );
      await expect(page.locator("body")).toContainText("Zugriff haben:");
      await expect(page.locator("body")).not.toContainText(
        "wartet auf Freigabe"
      );
    });
  }

  test("/mein-verein zeigt für Mitglieder Inhalt statt Zugriffs-Hinweis", async ({
    page,
  }) => {
    await seedStorage(page);
    await mockEingeloggterNutzer(page, { rolle: "mitglied" });

    await page.goto("/mein-verein", { waitUntil: "load" });

    await expect(page.getByRole("heading", { name: "Mein Verein" })).toBeVisible();
    await expect(page.locator("body")).toContainText("WhatsApp-Gruppe");
    await expect(page.locator("body")).not.toContainText(
      "wartet noch auf Freigabe"
    );
    await expect(page.locator("body")).not.toContainText("nicht vorgesehen");
  });
});

// ──────────────────────────────────────────────
// 7. Account-Menü zeigt alle Rollenbereiche
// ──────────────────────────────────────────────
test("UserDropdown zeigt ausstehenden Nutzern alle Bereichslinks", async ({
  page,
}) => {
  await seedStorage(page);
  await mockEingeloggterNutzer(page, { rolle: "ausstehend" });

  await page.goto("/impressum", { waitUntil: "load" });

  await page.getByRole("button", { name: "BT" }).click();
  const menu = page.locator('[role="menu"]').first();
  await expect(menu).toBeVisible();

  for (const label of [
    "Platzbuchung",
    "Meine Buchungen",
    "Mitglieder",
    "Vorstandsbereich",
    "Mein Verein",
  ]) {
    // Headless UI rendert Menu.Item-Kinder mit role="menuitem", nicht "link"
    await expect(menu.getByRole("menuitem", { name: label })).toBeVisible();
  }
});
