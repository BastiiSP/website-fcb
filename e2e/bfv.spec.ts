import { expect, test } from "@playwright/test";
import { getHeimspiele, getSpielbetrieb } from "../src/lib/bfv";

interface MehrfachErgebnis {
  anzeigename: string;
  daten: null | {
    quelleUrl: string;
  };
}

const A1_ID = "011MICDMU4000000VTVG0001VTR8C1K7";
const A2_ID = "0312HJ55NC000000VS5489BSVSCPI5U4";
const B1_ID = "011MIAAUCO000000VTVG0001VTR8C1K7";
const B2_ID = "02Q1986GHK000000VS5489B1VVDHMN8Q";
const D1_ID = "011MIEFB10000000VTVG0001VTR8C1K7";
const D2_ID = "0312I6CRGC000000VS5489BSVSCPI5U4";

const MEHRFACH_FAELLE = [
  {
    teamId: "a-junioren",
    namen: ["JFG Kunstadt-Obermain A1", "JFG Kunstadt-Obermain A2"],
    urls: [
      `https://www.bfv.de/mannschaften/jfg-kunstadt-obermain-a1/${A1_ID}`,
      `https://www.bfv.de/mannschaften/jfg-kunstadt-obermain-a2/${A2_ID}`,
    ],
  },
  {
    teamId: "b-junioren",
    namen: [
      "JFG Kunstadt-Obermain B1",
      "JFG Kunstadt-Obermain 2 (9er flex)",
    ],
    urls: [
      `https://www.bfv.de/mannschaften/jfg-kunstadt-obermain-b1/${B1_ID}`,
      `https://www.bfv.de/mannschaften/jfg-kunstadt-obermain-2-9er-flex/${B2_ID}`,
    ],
  },
  {
    teamId: "d-junioren",
    namen: ["JFG Kunstadt-Obermain D 1", "JFG Kunstadt-Obermain D 2"],
    urls: [
      `https://www.bfv.de/mannschaften/jfg-kunstadt-obermain-d-1/${D1_ID}`,
      `https://www.bfv.de/mannschaften/jfg-kunstadt-obermain-d-2/${D2_ID}`,
    ],
  },
] as const;

/**
 * Bildet die zwei BFV-Endpunkte vollständig genug nach, damit der Test den
 * echten Mapping-Pfad prüft und nur die externe Netzwerkgrenze ersetzt.
 */
function bfvAntwort(url: string): Response {
  const teamTreffer = /\/team\/([^/]+)\/matches$/.exec(url);
  if (teamTreffer) {
    const permanentId = teamTreffer[1];
    return Response.json({
      state: 1,
      message: null,
      data: {
        team: {
          permanentId,
          name: `BFV-Team ${permanentId}`,
          typeName: "A-Junioren",
          seasonId: "26/27",
          clubId: "test-club",
          clubName: "JFG Kunstadt-Obermain",
          compoundId: `staffel-${permanentId}`,
          competitionName: "Teststaffel",
          competitionBreadcrumb: "Deutschland | Bayern | Testgebiet",
        },
        matches: [],
      },
    });
  }

  if (/\/competition\/staffel-[^/]+\/table$/.test(url)) {
    return Response.json({
      state: 1,
      message: null,
      data: {
        configuration: { promotionTeamCount: 0 },
        compoundId: "teststaffel",
        competitionName: "Teststaffel",
        comment: null,
        table: [],
      },
    });
  }

  return new Response(null, { status: 404 });
}

test.beforeEach(() => {
  globalThis.fetch = async (input: string | URL | Request) =>
    bfvAntwort(
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url,
    );
});

test.afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
});

const ORIGINAL_FETCH = globalThis.fetch;

for (const { teamId, namen, urls } of MEHRFACH_FAELLE) {
  test(`${teamId} liefert beide BFV-Teams getrennt`, async () => {
    const ergebnis = await getSpielbetrieb(teamId);

    expect(Array.isArray(ergebnis)).toBe(true);
    const teams = ergebnis as unknown as MehrfachErgebnis[];
    expect(teams).toHaveLength(2);
    expect(teams.map(({ anzeigename }) => anzeigename)).toEqual(namen);
    expect(teams.map(({ daten }) => daten?.quelleUrl)).toEqual(urls);
  });
}

test("c-junioren behält wie bestehende Einzelteams die einzelne Objektform", async () => {
  const ergebnis = await getSpielbetrieb("c-junioren");

  expect(ergebnis).not.toBeNull();
  expect(Array.isArray(ergebnis)).toBe(false);
  expect(ergebnis).toMatchObject({
    quelleUrl:
      "https://www.bfv.de/mannschaften/jfg-kunstadt-obermain/011MIATUBK000000VTVG0001VTR8C1K7",
  });
  expect(ergebnis).not.toHaveProperty("anzeigename");
});

test("ein bestehendes FCB-Team behält die einzelne Objektform", async () => {
  const ergebnis = await getSpielbetrieb("herren-1");

  expect(ergebnis).not.toBeNull();
  expect(Array.isArray(ergebnis)).toBe(false);
  expect(ergebnis).toMatchObject({
    quelleUrl:
      "https://www.bfv.de/mannschaften/1-fc-burgkunstadt/016PAE5PRO000000VV0AG811VTE5EA5R",
  });
  expect(ergebnis).not.toHaveProperty("anzeigename");
});

/**
 * Regression: Der BFV liefert für Staffeln ohne Tabelle (Kinderfußball) HTTP 200
 * mit `data: null`. Ein ungeschützter Zugriff darauf hat die komplette Seite
 * /mannschaften mit einem TypeError abgeräumt – die Spiele müssen trotzdem
 * durchkommen, nur eben ohne Tabelle.
 */
test("Staffel ohne Tabelle liefert Spiele statt die Seite zu sprengen", async () => {
  globalThis.fetch = async (input: string | URL | Request) => {
    const url = String(typeof input === "string" ? input : (input as Request).url ?? input);
    return /\/table$/.test(url)
      ? Response.json({ state: 1, message: null, data: null })
      : bfvAntwort(url);
  };

  const ergebnis = await getSpielbetrieb("f-junioren");

  expect(ergebnis).not.toBeNull();
  expect(Array.isArray(ergebnis)).toBe(false);
  expect(ergebnis).toMatchObject({ tabelle: [] });
});

/**
 * Der Sportheim-Belegungskalender darf nur sperren, was die Anlage am Alten
 * Postweg wirklich belegt. Die JFG spielt auf drei Vereinsanlagen und die
 * BFV-API kennt keinen Spielort – ohne diesen Filter blockierten JFG-Spiele in
 * Mainroth/Redwitz das Burgkunstadter Sportheim.
 */
test("Sportheim-Sperren umfassen nur Heimspiele am Alten Postweg", async () => {
  globalThis.fetch = async (input: string | URL | Request) => {
    const url = String(typeof input === "string" ? input : (input as Request).url ?? input);
    const treffer = /\/team\/([^/]+)\/matches$/.exec(url);
    if (!treffer) return bfvAntwort(url);

    const permanentId = treffer[1];
    return Response.json({
      state: 1,
      message: null,
      data: {
        team: {
          permanentId,
          name: `BFV-Team ${permanentId}`,
          typeName: "Test",
          seasonId: "26/27",
          clubId: "test-club",
          clubName: "Testverein",
          compoundId: `staffel-${permanentId}`,
          competitionName: "Teststaffel",
          competitionBreadcrumb: "Deutschland | Bayern | Testgebiet",
        },
        // Ein Heimspiel je konfiguriertem Team – gefiltert wird also
        // ausschließlich über heimspieleAmAltenPostweg, nicht über die Daten.
        matches: [
          {
            matchId: `match-${permanentId}`,
            compoundId: `staffel-${permanentId}`,
            competitionName: "Teststaffel",
            competitionType: "Meisterschaften",
            teamType: "Test",
            kickoffDate: "12.09.2026",
            kickoffTime: "15:00",
            homeTeamName: "Heim",
            homeTeamPermanentId: permanentId,
            homeClubId: "test-club",
            guestTeamName: "Gast",
            guestTeamPermanentId: "gegner",
            guestClubId: "gegner-club",
            result: "",
            tickerMatchId: null,
            prePublished: false,
          },
        ],
      },
    });
  };

  const mannschaften = (await getHeimspiele()).map((spiel) => spiel.mannschaft);

  expect(mannschaften.sort()).toEqual([
    "1. Mannschaft",
    "2. Mannschaft",
    "F-Junioren",
  ]);
  expect(mannschaften.some((name) => name.includes("JFG"))).toBe(false);
});

test("ein einzelner Ausfall lässt das andere Mehrfachteam erreichbar", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input: string | URL | Request) =>
    String(input).includes(A2_ID)
      ? new Response(null, { status: 503 })
      : originalFetch(input);

  const ergebnis = await getSpielbetrieb("a-junioren");

  expect(Array.isArray(ergebnis)).toBe(true);
  const teams = ergebnis as unknown as MehrfachErgebnis[];
  expect(teams.map(({ daten }) => daten !== null)).toEqual([true, false]);
});
