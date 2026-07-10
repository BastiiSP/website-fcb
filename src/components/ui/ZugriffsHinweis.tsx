import Banner from "@/components/ui/Banner";
import { ROLLEN_LABELS } from "@/lib/rollen";

interface ZugriffsHinweisProps {
  rolle: string | null;
  erlaubteRollen: string[];
}

/**
 * Zeigt statt gesperrter Seiteninhalte einen erklärenden Hinweis. Unterscheidet
 * bewusst farblich UND sprachlich zwei Fälle, die früher oft verwechselt wurden:
 * - "Konto wartet noch auf Freigabe" (ausstehend, oder Rolle fehlt/unbekannt –
 *   fail-closed, damit ein Ladefehler nie versehentlich Zugriff vortäuscht)
 * - "Rolle reicht für diesen Bereich nicht aus" (jede andere, bereits
 *   freigeschaltete Rolle ohne ausreichende Berechtigung)
 */
export default function ZugriffsHinweis({ rolle, erlaubteRollen }: ZugriffsHinweisProps) {
  if (!rolle || rolle === "ausstehend") {
    return (
      <Banner
        variant="warning"
        message="Dein Konto wartet noch auf Freigabe durch den Vorstand. Sobald du freigeschaltet bist, hast du hier Zugriff."
      />
    );
  }

  const eigeneRolle = ROLLEN_LABELS[rolle] ?? rolle;
  const rollenListe = erlaubteRollen.map((r) => ROLLEN_LABELS[r] ?? r).join(", ");

  return (
    <Banner
      variant="info"
      message={`Dieser Bereich ist für deine aktuelle Rolle (${eigeneRolle}) nicht vorgesehen. Zugriff haben: ${rollenListe}.`}
    />
  );
}
