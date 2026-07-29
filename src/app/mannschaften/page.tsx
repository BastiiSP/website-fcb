import type { Metadata } from "next";
import PageShell from "@/components/ui/PageShell";
import PageHeader from "@/components/ui/PageHeader";
import TeamCard from "@/components/ui/TeamCard";
import ButtonLink from "@/components/ui/ButtonLink";
import SpielbetriebSection from "@/components/spielbetrieb/SpielbetriebSection";
import { getTeamsFuerTraeger, TRAEGER_INFO, type Team, type Traeger } from "@/lib/teams";
import type { TenantId } from "@/lib/tenant";
import { getTenantConfigServer } from "@/lib/tenant.server";

// Öffentliche Mannschaftsübersicht – kein Auth-Check, Server Component.
// Die TeamCards (Client, Framer Motion) kommen fertig aus dem Design-System.
//
// Multi-Tenant: Jeder Auftritt zeigt die Mannschaften seines Trägers. Der FCB
// zeigt zusätzlich die JFG-Jahrgänge, weil er Mitträger der Fördergemeinschaft
// ist und diese Kooperation hier erklärt (Bestandsinhalt).

/** Markenabhängige Fließtexte der Seite. */
interface SeitenTexte {
  metaDescription: string;
  subtitle: string;
  intro: string;
  ctaTitel: string;
  ctaText: string;
}

const TEXTE: Record<TenantId, SeitenTexte> = {
  // FCB: Bestandstexte, unverändert.
  fcb: {
    metaDescription:
      "Alle Mannschaften des 1. FC 1911 Burgkunstadt: von den Bambini über die leistungsorientierte JFG-Jugend bis zur Ersten.",
    subtitle: "Von den Bambini bis zur Ersten: Hier spielt ganz Burgkunstadt.",
    intro:
      "Beim FCB kann jeder kicken: die Kleinsten fangen bei den Bambini an und die Herren spielen sonntags um Punkte. Für die älteren Jugendjahrgänge haben wir mit den Nachbarvereinen die JFG Kunstadt-Obermain gegründet, unser Leistungsprojekt für den Nachwuchs.",
    ctaTitel: "Du willst mitspielen?",
    ctaText:
      "Komm einfach zum Training vorbei oder meld dich kurz. Wir sagen dir, wann deine Altersklasse auf dem Platz steht.",
  },
  // JFG: PLATZHALTER – kurz und sachlich formuliert, damit die Seite live
  // gehen kann. Die endgültigen Texte liefert Basti nach (Anzahl/Namen der
  // Trägervereine, Selbstbeschreibung, Ansprache).
  jfg: {
    metaDescription:
      "PLATZHALTER: Die Mannschaften der JFG Kunstadt-Obermain – A- bis D-Junioren aus drei Trägervereinen.",
    subtitle: "A- bis D-Junioren: leistungsorientierter Nachwuchsfußball.",
    intro:
      "PLATZHALTER: In der JFG Kunstadt-Obermain bündeln drei Trägervereine ihre älteren Jugendjahrgänge. Die Teams werden leistungsgerecht eingeteilt, damit jeder Spieler genau dort gefördert wird, wo er steht.",
    ctaTitel: "Du willst bei uns spielen?",
    ctaText:
      "PLATZHALTER: Melde dich kurz bei uns – wir sagen dir, wann dein Jahrgang trainiert, und laden dich zum Probetraining ein.",
  },
};

/** Zwischenüberschrift je Träger – Akzentstrich in der Trägerfarbe. */
function TraegerHeading({ traeger, sub }: { traeger: Traeger; sub: string }) {
  const info = TRAEGER_INFO[traeger];
  // Akzentklassen bewusst als volle Literale (Tailwind-Scanner)
  const bar = traeger === "fcb" ? "bg-fcb-blue" : "bg-fcb-red";
  return (
    <div className="mb-5 mt-12 first:mt-0">
      <div className="flex items-center gap-3">
        <span aria-hidden className={`h-6 w-1 rounded-full ${bar}`} />
        <h2 className="font-oswald text-2xl font-semibold uppercase tracking-wide text-fcb-text">
          {info.name}
        </h2>
      </div>
      <p className="mt-1 pl-4 font-inter text-sm text-fcb-muted">{sub}</p>
    </div>
  );
}

/** Team-Grid im Muster der Design-Spec (mobile-first, ab sm im Raster). */
function TeamGrid({ teams, className = "" }: { teams: Team[]; className?: string }) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className}`.trim()}>
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenantConfigServer();
  return {
    title: `Mannschaften – ${tenant.metaTitle}`,
    description: TEXTE[tenant.id].metaDescription,
  };
}

export default async function MannschaftenPage() {
  const tenant = await getTenantConfigServer();
  const texte = TEXTE[tenant.id];
  const eigeneTeams = getTeamsFuerTraeger(tenant.traeger);

  return (
    <PageShell maxWidth="2xl">
      <PageHeader title="Unsere Mannschaften" subtitle={texte.subtitle} />

      <p className="max-w-2xl font-inter text-base leading-relaxed text-fcb-text/80">
        {texte.intro}
      </p>

      {tenant.id === "fcb" ? (
        // FCB-Auftritt: beide Träger-Blöcke inkl. Erklärung der JFG-Kooperation.
        <>
          <TraegerHeading
            traeger="fcb"
            sub="Die Herren und die jüngsten Jahrgänge, direkt beim FCB."
          />
          <TeamGrid teams={eigeneTeams} />

          <TraegerHeading
            traeger="jfg"
            sub="A- bis D-Junioren: leistungsorientierte Jugendarbeit in der Jugendfördergemeinschaft."
          />
          <p className="mb-5 max-w-2xl font-inter text-sm leading-relaxed text-fcb-text/70">
            Warum eine JFG? Weil wir aus unseren Talenten das Maximum herausholen
            wollen. In der JFG Kunstadt-Obermain bündeln wir mit den Nachbarvereinen
            die Jahrgänge und teilen die Teams leistungsgerecht ein. So wird jeder
            Nachwuchskicker genau da gefördert, wo er steht. Das Konzept geht auf:
            Unsere JFG-Teams messen sich regelmäßig mit den
            Nachwuchsleistungszentren der Region und lassen sie teilweise hinter
            sich.
          </p>
          <TeamGrid teams={getTeamsFuerTraeger("jfg")} />
        </>
      ) : (
        // JFG-Auftritt: nur die eigenen Teams. Eine Träger-Zwischenüberschrift
        // wäre hier redundant (der ganze Auftritt ist die JFG), deshalb folgt
        // das Grid direkt auf den Einleitungstext.
        <TeamGrid teams={eigeneTeams} className="mt-8" />
      )}

      {/* Tabelle & Spiele: Auswahl Verein → Mannschaft; Teams ohne BFV-Daten
          (aktuell die Jugend) zeigen einen Hinweis statt einer Daten-Card.
          Die Sektion entscheidet selbst, ob sie zum Auftritt passt. */}
      <SpielbetriebSection />

      {/* Abschluss-CTA – bewusst nur ein primary auf der Seite */}
      <div className="mt-14 rounded-2xl border border-fcb-border bg-fcb-surface p-6 text-center sm:p-8">
        <h2 className="font-oswald text-xl font-semibold uppercase tracking-wide text-fcb-text">
          {texte.ctaTitel}
        </h2>
        <p className="mx-auto mt-2 max-w-xl font-inter text-sm leading-relaxed text-fcb-text/80">
          {texte.ctaText}
        </p>
        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href="/kontakt" variant="primary" size="md">
            Kontakt aufnehmen
          </ButtonLink>
          <ButtonLink href="/verein" variant="secondary" size="md">
            Mehr über den Verein
          </ButtonLink>
        </div>
      </div>
    </PageShell>
  );
}
