import type { Spiel, SpielbetriebDaten, TabellenEintrag } from "@/lib/bfvTypes";

const REVALIDATE_SECONDS = 60 * 60; // 1 Stunde
const BFV_WIDGET_API_BASE = "https://widget-prod.bfv.de/api/service/widget/v1";

/**
 * Konfiguration einer BFV-Mannschaft.
 *
 * Der BFV liefert Liga, Staffel und `compoundId` über den Matches-Endpunkt.
 * Deshalb muss hier nur die stabile `teamPermanentId` aus der öffentlichen
 * BFV-Mannschafts-URL gepflegt werden.
 */
export interface BfvTeamConfig {
  /** Team-ID aus der BFV-URL und aus `/team/{teamPermanentId}/matches`. */
  teamPermanentId: string;
  /** Anzeigename für Logs und spätere Admin-Hinweise. */
  anzeigename: string;
  /** Öffentliche BFV-Quellseite, nicht fussball.de. */
  quelleUrl: string;
  /** Optionaler Fallback, falls der BFV kurzfristig keinen Liganamen liefert. */
  ligaNameFallback?: string;
}

/**
 * BFV-Konfiguration für die FCB-Herren.
 *
 * Weitere Teams ergänzen:
 * 1. Auf bfv.de die öffentliche Mannschaftsseite öffnen.
 * 2. Die `teamPermanentId` aus dem letzten URL-Segment übernehmen.
 * 3. Einen Eintrag mit Team-ID aus `src/lib/teams.ts`, Anzeigename und
 *    Quellen-URL ergänzen.
 * 4. Live prüfen: `/team/{teamPermanentId}/matches` muss `data.team.compoundId`
 *    liefern; die Tabelle kommt anschließend automatisch über diese ID.
 */
export const BFV_TEAMS: Record<string, BfvTeamConfig> = {
  "herren-1": {
    teamPermanentId: "016PAE5PRO000000VV0AG811VTE5EA5R",
    anzeigename: "1. Mannschaft",
    quelleUrl:
      "https://www.bfv.de/mannschaften/1-fc-burgkunstadt/016PAE5PRO000000VV0AG811VTE5EA5R",
    ligaNameFallback: "Kreisliga 2",
  },
  "herren-2": {
    teamPermanentId: "01SBAIPT94000000VS548984VTL2SVNK",
    anzeigename: "2. Mannschaft",
    quelleUrl:
      "https://www.bfv.de/mannschaften/1fc-burgkunstadt-2/01SBAIPT94000000VS548984VTL2SVNK",
    ligaNameFallback: "Kreisklasse 2",
  },
};

interface BfvWidgetResponse<TData> {
  state: number;
  message: string | null;
  data: TData;
}

interface BfvTeamData {
  permanentId: string;
  name: string;
  typeName: string;
  seasonId: string;
  clubId: string;
  clubName: string;
  compoundId: string;
  competitionName: string;
  competitionBreadcrumb: string;
}

type BfvCompetitionType =
  | "Meisterschaften"
  | "Pokale"
  | "Freundschaftsspiele"
  | "Turniere";

interface BfvMatchData {
  matchId: string;
  compoundId: string;
  competitionName: string;
  competitionType: BfvCompetitionType;
  teamType: string;
  kickoffDate: string | null;
  kickoffTime: string | null;
  homeTeamName: string;
  homeTeamPermanentId: string;
  homeClubId: string;
  guestTeamName: string;
  guestTeamPermanentId: string;
  guestClubId: string;
  result: string;
  tickerMatchId: string | null;
  prePublished: boolean;
}

interface BfvMatchesData {
  team: BfvTeamData;
  matches: BfvMatchData[];
}

interface BfvTableConfiguration {
  promotionTeamCount: number;
}

interface BfvTableTeam {
  permanentId: string;
  name: string;
}

interface BfvTableRow {
  position: number;
  matches: number;
  matchesWon: number;
  matchesDrawn: number;
  matchesLost: number;
  goalsDiff: number;
  points: number;
  trend: number;
  live: boolean;
  team: BfvTableTeam;
}

interface BfvTableData {
  configuration: BfvTableConfiguration;
  compoundId: string;
  competitionName: string;
  comment: string | null;
  table: BfvTableRow[];
}

function letzterSonntagImMonat(year: number, monthIndex: number): number {
  const letzterTag = new Date(Date.UTC(year, monthIndex + 1, 0));
  return letzterTag.getUTCDate() - letzterTag.getUTCDay();
}

function lokaleMinutenSeitJahresbeginn(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): number {
  const start = Date.UTC(year, 0, 1);
  const aktuell = Date.UTC(year, month - 1, day, hour, minute);
  return Math.floor((aktuell - start) / 60000);
}

/**
 * BFV liefert Anstoßzeiten als deutsche Ortszeit ohne Offset. Damit das ISO
 * nicht von der Server-Zeitzone abhängt, berechnen wir die EU-Sommerzeitregel
 * für Europe/Berlin selbst: +02:00 vom letzten Sonntag im März ab 02:00 bis
 * zum letzten Sonntag im Oktober vor 03:00, sonst +01:00.
 */
function berlinOffsetFuerLokaleZeit(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): "+01:00" | "+02:00" {
  const sommerzeitStartTag = letzterSonntagImMonat(year, 2);
  const sommerzeitEndeTag = letzterSonntagImMonat(year, 9);
  const aktuell = lokaleMinutenSeitJahresbeginn(year, month, day, hour, minute);
  const start = lokaleMinutenSeitJahresbeginn(
    year,
    3,
    sommerzeitStartTag,
    2,
    0,
  );
  const ende = lokaleMinutenSeitJahresbeginn(year, 10, sommerzeitEndeTag, 3, 0);

  return aktuell >= start && aktuell < ende ? "+02:00" : "+01:00";
}

function bfvAnstossZuIso(
  kickoffDate: string | null,
  kickoffTime: string | null,
): string | null {
  if (!kickoffDate) return null;

  const datum = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(kickoffDate);
  const zeit = /^(\d{2}):(\d{2})$/.exec(kickoffTime ?? "00:00");
  if (!datum || !zeit) return null;

  const day = Number(datum[1]);
  const month = Number(datum[2]);
  const year = Number(datum[3]);
  const hour = Number(zeit[1]);
  const minute = Number(zeit[2]);
  const offset = berlinOffsetFuerLokaleZeit(year, month, day, hour, minute);
  const isoDatum = `${datum[3]}-${datum[2]}-${datum[1]}T${zeit[1]}:${zeit[2]}:00${offset}`;
  const parsed = new Date(isoDatum);

  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/**
 * Konsistente deutsche Spielart-Labels je BFV-competitionType.
 * Die API kennt aktuell genau diese vier Typen; kommt ein neuer dazu,
 * fällt das Mapping auf den Rohwert zurück statt zu brechen.
 */
const SPIELART_LABELS: Record<BfvCompetitionType, string> = {
  Meisterschaften: "Ligaspiel",
  Pokale: "Pokalspiel",
  Freundschaftsspiele: "Freundschaftsspiel",
  Turniere: "Turnierspiel",
};

function spielartLabel(match: BfvMatchData): string {
  // Runtime-Schutz: competitionType ist als Union typisiert, aber der BFV
  // könnte unangekündigt neue Typen liefern – dann Rohwert anzeigen.
  return SPIELART_LABELS[match.competitionType] ?? match.competitionType;
}

function wettbewerbsName(match: BfvMatchData): string {
  return match.competitionType === "Freundschaftsspiele"
    ? "Freundschaftsspiel"
    : match.competitionName;
}

function ergebnisOderUndefined(result: string): string | undefined {
  const trimmed = result.trim();
  return /\d/.test(trimmed) ? trimmed : undefined;
}

function ligaNameAusTeam(team: BfvTeamData, fallback?: string): string {
  const breadcrumbTeile = team.competitionBreadcrumb
    .split("|")
    .map((teil) => teil.trim())
    .filter(Boolean);
  const gebiet = breadcrumbTeile.at(-1);

  if (team.competitionName && gebiet) {
    return `${team.competitionName} – ${gebiet}`;
  }

  return team.competitionName || fallback || team.name;
}

function mapSpiel(match: BfvMatchData): Spiel | null {
  const anstoss = bfvAnstossZuIso(match.kickoffDate, match.kickoffTime);
  if (!anstoss) return null;

  return {
    anstoss,
    spielart: spielartLabel(match),
    wettbewerb: wettbewerbsName(match),
    heim: match.homeTeamName,
    gast: match.guestTeamName,
    ergebnis: ergebnisOderUndefined(match.result),
  };
}

function mapTabelle(
  table: BfvTableRow[],
  teamPermanentId: string,
): TabellenEintrag[] {
  return table
    .map((entry) => ({
      platz: entry.position,
      mannschaft: entry.team.name,
      spiele: entry.matches,
      siege: entry.matchesWon,
      unentschieden: entry.matchesDrawn,
      niederlagen: entry.matchesLost,
      tordifferenz: entry.goalsDiff,
      punkte: entry.points,
      eigenesTeam: entry.team.permanentId === teamPermanentId,
    }))
    .sort((a, b) => a.platz - b.platz);
}

async function fetchBfvJson<TData>(
  url: string,
): Promise<BfvWidgetResponse<TData> | null> {
  try {
    const res = await fetch(url, {
      // Der BFV aktualisiert Spielbetrieb fortlaufend, aber stündliches
      // serverseitiges Caching reicht für die Website und schont die Quelle.
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) {
      console.error(`[bfv] Abruf fehlgeschlagen: HTTP ${res.status} (${url})`);
      return null;
    }

    return (await res.json()) as BfvWidgetResponse<TData>;
  } catch (err) {
    console.error("[bfv] Unerwarteter Fehler beim BFV-Abruf:", err);
    return null;
  }
}

/**
 * Lädt Tabelle und Spiele eines konfigurierten BFV-Teams.
 *
 * Der Tabellen-Endpunkt hängt an `compoundId`, nicht an `teamPermanentId`.
 * Deshalb ist der Matches-Abruf der erste Pflichtschritt; ohne ihn kennen wir
 * die korrekte aktuelle Staffel nicht und geben kontrolliert `null` zurück.
 */
export async function getSpielbetrieb(
  teamId: string,
): Promise<SpielbetriebDaten | null> {
  const config = BFV_TEAMS[teamId];
  if (!config) return null;

  const matchesUrl = `${BFV_WIDGET_API_BASE}/team/${config.teamPermanentId}/matches`;
  const matchesResponse = await fetchBfvJson<BfvMatchesData>(matchesUrl);

  if (!matchesResponse) return null;

  const { team, matches } = matchesResponse.data;
  const tableUrl = `${BFV_WIDGET_API_BASE}/competition/${team.compoundId}/table`;
  const tableResponse = await fetchBfvJson<BfvTableData>(tableUrl);
  const spiele = matches.map(mapSpiel).filter((spiel): spiel is Spiel => spiel !== null);
  const tabelle = tableResponse
    ? mapTabelle(tableResponse.data.table, config.teamPermanentId)
    : [];
  const jetzt = Date.now();

  const naechsteSpiele = spiele
    .filter((spiel) => !spiel.ergebnis && new Date(spiel.anstoss).getTime() >= jetzt)
    .sort((a, b) => new Date(a.anstoss).getTime() - new Date(b.anstoss).getTime())
    .slice(0, 5);

  const letzteSpiele = spiele
    .filter((spiel) => Boolean(spiel.ergebnis))
    .sort((a, b) => new Date(b.anstoss).getTime() - new Date(a.anstoss).getTime())
    .slice(0, 5);

  return {
    ligaName: ligaNameAusTeam(team, config.ligaNameFallback),
    tabelle,
    naechsteSpiele,
    letzteSpiele,
    abgerufenAm: new Date().toISOString(),
    quelleUrl: config.quelleUrl,
  };
}
