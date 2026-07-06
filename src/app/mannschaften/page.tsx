import type { Metadata } from "next";
import PageShell from "@/components/ui/PageShell";
import PageHeader from "@/components/ui/PageHeader";
import TeamCard from "@/components/ui/TeamCard";
import ButtonLink from "@/components/ui/ButtonLink";
import { TEAMS, TRAEGER_INFO, type Traeger } from "@/lib/teams";

export const metadata: Metadata = {
  title: "Mannschaften – 1. FC 1911 Burgkunstadt",
  description:
    "Alle Mannschaften des 1. FC 1911 Burgkunstadt: von den Bambini über die leistungsorientierte JFG-Jugend bis zur Ersten.",
};

// Öffentliche Mannschaftsübersicht – kein Auth-Check, Server Component.
// Die TeamCards (Client, Framer Motion) kommen fertig aus dem Design-System.

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

export default function MannschaftenPage() {
  const fcbTeams = TEAMS.filter((t) => t.traeger === "fcb");
  const jfgTeams = TEAMS.filter((t) => t.traeger === "jfg");

  return (
    <PageShell maxWidth="2xl">
      <PageHeader
        title="Unsere Mannschaften"
        subtitle="Von den Bambini bis zur Ersten: Hier spielt ganz Burgkunstadt."
      />

      <p className="max-w-2xl font-inter text-base leading-relaxed text-fcb-text/80">
        Beim FCB kann jeder kicken: die Kleinsten fangen bei den Bambini an und
        die Herren spielen sonntags um Punkte. Für die älteren Jugendjahrgänge
        haben wir mit den Nachbarvereinen die JFG Kunstadt-Obermain gegründet,
        unser Leistungsprojekt für den Nachwuchs.
      </p>

      <TraegerHeading
        traeger="fcb"
        sub="Die Herren und die jüngsten Jahrgänge, direkt beim FCB."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fcbTeams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jfgTeams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>

      {/* Abschluss-CTA – bewusst nur ein primary auf der Seite */}
      <div className="mt-14 rounded-2xl border border-fcb-border bg-fcb-surface p-6 text-center sm:p-8">
        <h2 className="font-oswald text-xl font-semibold uppercase tracking-wide text-fcb-text">
          Du willst mitspielen?
        </h2>
        <p className="mx-auto mt-2 max-w-xl font-inter text-sm leading-relaxed text-fcb-text/80">
          Komm einfach zum Training vorbei oder meld dich kurz. Wir sagen dir,
          wann deine Altersklasse auf dem Platz steht.
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
