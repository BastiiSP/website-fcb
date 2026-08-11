import { expect, test } from "@playwright/test";
import { SPORTHEIM_KATEGORIEN } from "../src/lib/sportheim";
import { PLATZ_FARBEN } from "../src/utils/getEventColor";

test("Sportheim-Kategorien nutzen drei eigenständige Kalenderfarben", () => {
  const sportheimFarben = Object.fromEntries(
    Object.entries(SPORTHEIM_KATEGORIEN).map(([art, kategorie]) => [
      art,
      kategorie.farbe,
    ]),
  );

  expect(sportheimFarben).toEqual({
    "heimspiel-fcb": "#1d5fad",
    "heimspiel-jfg": "#cc1f1f",
    buchung: "#f59e0b",
  });

  const farbwerte = Object.values(sportheimFarben);
  expect(new Set(farbwerte).size).toBe(3);
  expect(farbwerte).not.toContain(PLATZ_FARBEN.hauptplatz);
  expect(farbwerte).not.toContain(PLATZ_FARBEN.nebenplatz);
});
