"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { checkSession } from "@/utils/checkSession";
import TrainerVerzeichnis from "@/components/TrainerVerzeichnis";
import MitgliederVerwaltung from "@/components/MitgliederVerwaltung";

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
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Lade Inhalte …</p>
      </main>
    );
  }

  // Ausstehende Nutzer haben keinen Zugriff auf diese Seite
  if (rolle === "ausstehend") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-xl font-semibold">Kein Zugriff</p>
          <p className="text-sm opacity-75">
            Dein Konto wurde noch nicht freigegeben. Sobald ein Vorstandsmitglied
            dein Konto aktiviert hat, kannst du diese Seite aufrufen.
          </p>
        </div>
      </main>
    );
  }

  // Rollenweiche: trainer → Trainer-Verzeichnis, vorstand/admin → Mitgliederverwaltung
  const istTrainer = rolle === "trainer";
  const istVorstandOderAdmin = rolle === "vorstand" || rolle === "admin";

  return (
    <main className="min-h-screen p-4 sm:p-8">
      {istTrainer && (
        <>
          <h1 className="text-2xl font-bold mb-2">Trainer-Verzeichnis</h1>
          <p className="text-sm opacity-60 mb-6">
            Kontaktdaten aller Trainer, Platzwarte und Vorstandsmitglieder
          </p>
          <TrainerVerzeichnis />
        </>
      )}

      {istVorstandOderAdmin && (
        <>
          <h1 className="text-2xl font-bold mb-2">Mitgliederverwaltung</h1>
          <p className="text-sm opacity-60 mb-6">
            Vereinsmitglieder verwalten – hinzufügen, bearbeiten, löschen und exportieren
          </p>
          {/* userId ist hier garantiert nicht null, da wir oben auf !uid prüfen */}
          <MitgliederVerwaltung eigeneUserId={userId!} />
        </>
      )}

      {/* Fallback: eingeloggt, aber unbekannte Rolle */}
      {!istTrainer && !istVorstandOderAdmin && (
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-center opacity-70">Unbekannte Rolle – kein Zugriff.</p>
        </div>
      )}
    </main>
  );
}
