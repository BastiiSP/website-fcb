"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { checkSession } from "@/utils/checkSession";
import TrainerVerzeichnis from "@/components/TrainerVerzeichnis";
import MitgliederVerwaltung from "@/components/MitgliederVerwaltung";
import PageShell from "@/components/ui/PageShell";
import PageHeader from "@/components/ui/PageHeader";

export default function MitgliederPage() {
  const supabase = createClient();
  const router = useRouter();

  const [laden, setLaden] = useState(true);
  const [rolle, setRolle] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const pruefeZugriff = async () => {
      const { userId: uid, rolle: r } = await checkSession(supabase);

      // Nicht eingeloggte Nutzer werden zum Login weitergeleitet
      if (!uid) {
        router.push("/login");
        return;
      }

      setUserId(uid);
      setRolle(r);
      setLaden(false);
    };

    pruefeZugriff();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (laden) {
    return (
      <PageShell maxWidth="2xl">
        <p className="text-center font-inter text-fcb-muted mt-8">Lade Inhalte …</p>
      </PageShell>
    );
  }

  // ausstehend und mitglied haben keinen Zugriff – nur trainer/vorstand/admin
  if (rolle === "ausstehend" || rolle === "mitglied") {
    return (
      <PageShell maxWidth="2xl">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center space-y-3 max-w-md">
            <p className="font-oswald text-xl font-semibold uppercase tracking-wide text-fcb-text">
              Kein Zugriff
            </p>
            <p className="font-inter text-sm text-fcb-muted">
              Dein Konto wurde noch nicht freigegeben. Sobald ein Vorstandsmitglied
              dein Konto aktiviert hat, kannst du diese Seite aufrufen.
            </p>
          </div>
        </div>
      </PageShell>
    );
  }

  // Rollenweiche: trainer → Trainer-Verzeichnis, vorstand/admin → Mitgliederverwaltung
  const istTrainer = rolle === "trainer";
  const istVorstandOderAdmin = rolle === "vorstand" || rolle === "admin";

  return (
    <PageShell maxWidth="2xl">
      {istTrainer && (
        <>
          <PageHeader
            title="Trainer-Verzeichnis"
            subtitle="Kontaktdaten aller Trainer, Platzwarte und Vorstandsmitglieder"
          />
          <TrainerVerzeichnis />
        </>
      )}

      {istVorstandOderAdmin && (
        <>
          <PageHeader
            title="Mitgliederverwaltung"
            subtitle="Vereinsmitglieder verwalten – hinzufügen, bearbeiten, löschen und exportieren"
          />
          {/* userId ist hier garantiert nicht null, da wir oben auf !uid prüfen */}
          <MitgliederVerwaltung eigeneUserId={userId!} />
        </>
      )}

      {/* Fallback: eingeloggt, aber unbekannte Rolle */}
      {!istTrainer && !istVorstandOderAdmin && (
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="font-inter text-center text-fcb-muted">Unbekannte Rolle – kein Zugriff.</p>
        </div>
      )}
    </PageShell>
  );
}
