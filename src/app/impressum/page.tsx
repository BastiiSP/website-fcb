import type { Metadata } from "next";
import {
  RechtstextLayout,
  RechtstextSektion,
} from "@/components/rechtstexte/RechtstextLayout";

export const metadata: Metadata = {
  title: "Impressum – 1. FC 1911 Burgkunstadt",
  description: "Impressum und Anbieterkennzeichnung des 1. FC 1911 Burgkunstadt e.V.",
};

export default function ImpressumPage() {
  return (
    <RechtstextLayout titel="Impressum" stand="Juni 2026">
      {/* Anbieterkennzeichnung: § 5 TMG wurde am 14.05.2024 durch § 5 DDG
          (Digitale-Dienste-Gesetz) abgelöst. */}
      <RechtstextSektion titel="Angaben gemäß § 5 DDG">
        <p>
          1. FC 1911 Burgkunstadt e.V.
          <br />
          Alter Postweg 10
          <br />
          96224 Burgkunstadt
        </p>
      </RechtstextSektion>

      <RechtstextSektion titel="Vertreten durch">
        <p>1. Vorsitzender: Wolfgang Strassgürtel</p>
      </RechtstextSektion>

      <RechtstextSektion titel="Eintragung im Vereinsregister">
        <p>
          Eingetragen im Vereinsregister beim Amtsgericht Coburg unter der
          Nummer VR 20074.
        </p>
      </RechtstextSektion>

      <RechtstextSektion titel="Kontakt">
        <p>
          Telefon: 09572 2090152
          <br />
          E-Mail:{" "}
          <a
            href="mailto:info@fcburgkunstadt.de"
            className="text-fcb-accent hover:underline"
          >
            info@fcburgkunstadt.de
          </a>
        </p>
      </RechtstextSektion>

      {/* § 55 Abs. 2 RStV ist seit Nov. 2020 außer Kraft – korrekt: § 18 Abs. 2 MStV. */}
      <RechtstextSektion titel="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
        <p>
          Wolfgang Strassgürtel
          <br />
          Alter Postweg 10
          <br />
          96224 Burgkunstadt
        </p>
      </RechtstextSektion>

      <RechtstextSektion titel="Haftungsausschluss">
        <p>
          Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt
          erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der
          Inhalte können wir jedoch keine Gewähr übernehmen.
        </p>
        <p>
          Unsere Seiten enthalten Links zu externen Websites Dritter, auf deren
          Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten
          Seiten ist stets der jeweilige Anbieter verantwortlich.
        </p>
      </RechtstextSektion>
    </RechtstextLayout>
  );
}
