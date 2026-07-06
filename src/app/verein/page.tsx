import type { Metadata } from "next";
import {
  CalendarDays,
  Handshake,
  MapPin,
  Users,
} from "lucide-react";
import PageShell from "@/components/ui/PageShell";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import IconBadge from "@/components/ui/IconBadge";
import ButtonLink from "@/components/ui/ButtonLink";

export const metadata: Metadata = {
  title: "Der Verein – 1. FC 1911 Burgkunstadt",
  description:
    "Seit 1911 Fußball in der Schuhstadt: wer wir sind, woher wir kommen und wer beim 1. FC 1911 Burgkunstadt den Hut aufhat.",
};

// Öffentliche Vereinsseite – Server Component, kein Auth-Check.
// Fakten: Gründung 1911, ~450 Mitglieder, Schwarz-Weiß, Alter Postweg 10,
// 1. Vorsitzender Wolfgang Strassgürtel, Jugend A–D in der JFG Kunstadt-Obermain.

const FAKTEN = [
  {
    icon: CalendarDays,
    wert: "1911",
    text: "gegründet – seit über 110 Jahren wird bei uns gekickt",
  },
  {
    icon: Users,
    wert: "≈ 450",
    text: "Mitglieder – vom Bambini bis zum Ehrenmitglied",
  },
  {
    icon: MapPin,
    wert: "2 Plätze",
    text: "Haupt- und Nebenplatz am Alten Postweg",
  },
  {
    icon: Handshake,
    wert: "JFG",
    text: "ältere Jugend gemeinsam mit den Nachbarvereinen",
  },
];

/** Einheitliche Section-Überschrift der Vereinsseite. */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 mt-12 font-oswald text-2xl font-semibold uppercase tracking-wide text-fcb-text first:mt-0">
      {children}
    </h2>
  );
}

export default function VereinPage() {
  return (
    <PageShell maxWidth="xl">
      <PageHeader
        title="Der Verein"
        subtitle="1. FC 1911 Burgkunstadt e. V. – die Schuhstädter."
      />

      <SectionHeading>Wer wir sind</SectionHeading>
      <div className="max-w-2xl space-y-4 font-inter text-base leading-relaxed text-fcb-text/80">
        <p>
          Wir sind der Fußballverein in Burgkunstadt. Rund 450 Mitglieder, zwei
          Plätze am Alten Postweg und an guten Sonntagen eine Bratwurst in der
          Hand – das ist der FCB. Bei uns spielen die Kleinsten bei den Bambini,
          die Herren um Punkte und die Alten Herren um die Ehre.
        </p>
        <p>
          Große Töne spucken wir nicht. Wir wollen, dass in Burgkunstadt jeder
          Fußball spielen kann, der Lust darauf hat – egal ob mit sechs oder
          sechzig, ob im Tor oder am Grill. Wer einmal da war, kommt meistens
          wieder.
        </p>
      </div>

      <SectionHeading>Geschichte</SectionHeading>
      <div className="max-w-2xl space-y-4 font-inter text-base leading-relaxed text-fcb-text/80">
        <p>
          Gegründet 1911, als Burgkunstadt noch überall als Schuhstadt bekannt
          war – daher tragen wir den Namen „Schuhstädter“ bis heute mit Stolz.
          Seitdem gehört der FCB fest zur Stadt: Generationen von
          Burgkunstadtern haben hier ihre ersten Tore geschossen.
        </p>
        <p>
          Über hundert Jahre Vereinsgeschichte heißt auch: Auf- und Abstiege,
          Platzbau in Eigenleistung und unzählige Ehrenamtliche, ohne die hier
          gar nichts laufen würde. Die ausführliche Chronik arbeiten wir nach
          und nach auf – wer alte Fotos oder Geschichten hat, darf sich gerne
          melden.
        </p>
      </div>

      <SectionHeading>Zahlen &amp; Fakten</SectionHeading>
      <div className="grid gap-4 sm:grid-cols-2">
        {FAKTEN.map(({ icon, wert, text }) => (
          <Card key={wert} className="flex items-center gap-4">
            <IconBadge icon={icon} accent="blue" size="lg" />
            <div>
              <p className="font-oswald text-xl font-semibold text-fcb-text">{wert}</p>
              <p className="font-inter text-sm text-fcb-muted">{text}</p>
            </div>
          </Card>
        ))}
      </div>

      <SectionHeading>Vorstand &amp; Ansprechpartner</SectionHeading>
      <Card className="max-w-2xl">
        <p className="font-oswald text-lg font-semibold uppercase tracking-wide text-fcb-text">
          Wolfgang Strassgürtel
        </p>
        <p className="mt-1 font-inter text-sm text-fcb-muted">1. Vorsitzender</p>
        <p className="mt-4 font-inter text-sm leading-relaxed text-fcb-text/80">
          Den kompletten Vorstand stellen wir hier nach und nach vor. Bis dahin
          gilt: Bei Fragen einfach melden – wir leiten dich an die richtige
          Person weiter.
        </p>
        <div className="mt-5">
          <ButtonLink href="/kontakt" variant="secondary" size="md">
            Zum Kontakt
          </ButtonLink>
        </div>
      </Card>

      {/* Abschluss-CTA */}
      <div className="mt-14 rounded-2xl border border-fcb-border bg-fcb-surface p-6 text-center sm:p-8">
        <h2 className="font-oswald text-xl font-semibold uppercase tracking-wide text-fcb-text">
          Lust mitzumachen?
        </h2>
        <p className="mx-auto mt-2 max-w-xl font-inter text-sm leading-relaxed text-fcb-text/80">
          Ob als Spieler, Trainer oder helfende Hand am Sportheim – beim FCB
          gibt es immer was zu tun. Schau bei einer Mannschaft vorbei oder
          schreib uns.
        </p>
        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href="/mannschaften" variant="primary" size="md">
            Zu den Mannschaften
          </ButtonLink>
          <ButtonLink href="/kontakt" variant="secondary" size="md">
            Kontakt aufnehmen
          </ButtonLink>
        </div>
      </div>
    </PageShell>
  );
}
