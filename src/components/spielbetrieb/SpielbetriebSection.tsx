import SpielbetriebExplorer, {
  type SpielbetriebEintrag,
} from "@/components/spielbetrieb/SpielbetriebExplorer";
import { getTeamsFuerTraeger } from "@/lib/teams";
import { getBfvAnzeigename, getSpielbetrieb } from "@/lib/bfv";
import { getTenantConfigServer } from "@/lib/tenant.server";

// Spielbetriebs-Abschnitt für /mannschaften (Server Component):
// lädt die BFV-Daten aller Mannschaften (null für unkonfigurierte/fehlende)
// und übergibt sie dem Explorer, in dem Besucher erst ihre Altersklasse wählen.
// Datengetrieben über die Teams des aktuellen Trägers × BFV_TEAMS: Beide
// Marken nutzen dadurch denselben Pfad, Mehrfachteams löst der Explorer auf.

export default async function SpielbetriebSection() {
  const tenant = await getTenantConfigServer();

  // Alle Teams parallel anfragen – getSpielbetrieb liefert null für
  // unkonfigurierte Teams und bei vollständigen Abruf-Fehlern (wirft nie).
  // Die Trägerauswahl verhindert fremde Mannschaften auf der jeweiligen Domain.
  const eintraege: SpielbetriebEintrag[] = await Promise.all(
    getTeamsFuerTraeger(tenant.traeger).map(async (team) => ({
      team,
      daten: await getSpielbetrieb(team.id),
      // Nur für Einzelteams gesetzt – Mehrfachteams bringen ihren Namen mit.
      anzeigename: getBfvAnzeigename(team.id),
    })),
  );

  return (
    <section aria-labelledby="spielbetrieb-heading">
      <div className="mb-5 mt-12">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-6 w-1 rounded-full bg-fcb-accent" />
          <h2
            id="spielbetrieb-heading"
            className="font-oswald text-2xl font-semibold uppercase tracking-wide text-fcb-text"
          >
            Tabelle &amp; Spiele
          </h2>
        </div>
        <p className="mt-1 pl-4 font-inter text-sm text-fcb-muted">
          Mannschaft wählen – offizielle Daten des Bayerischen
          Fußball-Verbands, stündlich aktualisiert.
        </p>
      </div>

      <SpielbetriebExplorer eintraege={eintraege} />
    </section>
  );
}
