// Feste Mannschaftsliste des 1. FC 1911 Burgkunstadt
// Wird für Profilseite, Buchungsformular und Anfrage-Modal verwendet
// Stand 2026-07-06: AH, Damen und Mädchen entfernt – diese Mannschaften
// gibt es im Verein aktuell nicht (Abgleich mit Basti).

import type { Traeger } from "@/lib/teams";
import type { TenantId } from "@/lib/tenant";

/**
 * Eine auswählbare Mannschaft samt Träger.
 *
 * `name` ist gleichzeitig Anzeige- UND Speicherwert (steht so in
 * `profiles.mannschaft`, `buchungen.mannschaft` und `mannschaftsanfragen.mannschaft`)
 * und darf deshalb nicht umformuliert werden.
 *
 * Die Namen weichen bewusst von `TEAMS` in `src/lib/teams.ts` ab
 * ("A-Junioren (U19)" hier vs. "A-Junioren" dort): Formulare zeigen die
 * Altersklasse mit, die Mannschaftsseite nicht. Der Träger wird deshalb hier
 * explizit gepflegt statt per String-Matching aus TEAMS geraten zu werden.
 */
export interface MannschaftsOption {
  name: string;
  traeger: Traeger;
}

/**
 * Einzige Quelle der Zuordnung Mannschaftsname → Träger.
 * Reihenfolge bestimmt die Reihenfolge in allen Auswahlfeldern.
 */
export const MANNSCHAFTS_OPTIONEN: MannschaftsOption[] = [
  { name: "1. Mannschaft", traeger: "fcb" },
  { name: "2. Mannschaft", traeger: "fcb" },
  { name: "A-Junioren (U19)", traeger: "jfg" },
  { name: "B-Junioren (U17)", traeger: "jfg" },
  { name: "C-Junioren (U15)", traeger: "jfg" },
  { name: "D-Junioren (U13)", traeger: "jfg" },
  { name: "E-Junioren (U11)", traeger: "fcb" },
  { name: "F-Junioren (U9)", traeger: "fcb" },
  { name: "G-Junioren/Bambini (U7)", traeger: "fcb" },
];

/**
 * Vollständige Liste aller Mannschaften – Bestandsexport, Reihenfolge
 * unverändert. Bewusst NICHT tenant-gefiltert: Vorstandsbereich und
 * Mitgliederverwaltung müssen unabhängig vom aufgerufenen Auftritt immer alle
 * Mannschaften anbieten können.
 */
export const MANNSCHAFTEN: string[] = MANNSCHAFTS_OPTIONEN.map((o) => o.name);

/**
 * Mannschaften, die auf einem Auftritt zur Auswahl stehen (Profil-Anfragen).
 *
 * - FCB: alle Mannschaften. Der Hauptverein verwaltet die JFG-Jahrgänge mit,
 *   deshalb hier bewusst KEINE Einschränkung (= Bestandsverhalten).
 * - JFG: nur die eigenen A- bis D-Junioren.
 */
export function getMannschaftenFuerTenant(tenant: TenantId): string[] {
  if (tenant === "fcb") return MANNSCHAFTEN;
  return MANNSCHAFTS_OPTIONEN.filter((o) => o.traeger === tenant).map((o) => o.name);
}
