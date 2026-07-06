import { NextResponse } from "next/server";
import { BFV_TEAMS, getSpielbetrieb } from "@/lib/bfv";

/**
 * Debug-/Inspektions-Endpoint für die BFV-Spielbetriebsdaten
 * (Muster wie /api/instagram): macht sichtbar, was getSpielbetrieb()
 * pro Mannschaft liefert, ohne die Seite rendern zu müssen.
 *
 * Aufruf: /api/spielbetrieb?team=herren-1 – ohne Parameter werden alle
 * konfigurierten Teams geliefert. Es sind ausschließlich öffentliche,
 * faktische Sportdaten (Tabelle, Ergebnisse, Termine).
 *
 * revalidate = 3600 → 1 Stunde Caching, gleiche Frequenz wie die
 * BFV-Abrufe selbst (Quelle nicht überlasten).
 */
export const revalidate = 3600;

export async function GET(request: Request) {
  const teamId = new URL(request.url).searchParams.get("team");

  if (teamId) {
    const daten = await getSpielbetrieb(teamId);
    if (!daten) {
      return NextResponse.json(
        { fehler: `Keine BFV-Daten für Team "${teamId}" konfiguriert oder abrufbar.` },
        { status: 404 },
      );
    }
    return NextResponse.json(daten);
  }

  // Ohne Parameter: alle konfigurierten Teams parallel abfragen.
  const teamIds = Object.keys(BFV_TEAMS);
  const eintraege = await Promise.all(
    teamIds.map(async (id) => [id, await getSpielbetrieb(id)] as const),
  );
  return NextResponse.json(Object.fromEntries(eintraege));
}
