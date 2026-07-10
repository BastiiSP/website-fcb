"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { checkSession } from "@/utils/checkSession";
import TrainerVerzeichnis from "@/components/TrainerVerzeichnis";
import MitgliederVerwaltung from "@/components/MitgliederVerwaltung";
import PageShell from "@/components/ui/PageShell";
import PageHeader from "@/components/ui/PageHeader";
import ZugriffsHinweis from "@/components/ui/ZugriffsHinweis";

// Zugriff nur für Trainer, Vorstand und Admin – RLS in der DB sichert dies zusätzlich ab
const ERLAUBTE_ROLLEN = ["trainer", "vorstand", "admin"];

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

  // Rollenweiche: trainer → Trainer-Verzeichnis, vorstand/admin → Mitgliederverwaltung.
  // Jede andere Rolle (inkl. fehlender/unbekannter Rolle – fail-closed statt
  // versehentlich Zugriff zu gewähren) bekommt den ZugriffsHinweis statt Inhalt.
  const istTrainer = rolle === "trainer";
  const istVorstandOderAdmin = rolle === "vorstand" || rolle === "admin";
  const zugelassen = istTrainer || istVorstandOderAdmin;

  // Einheitliches "Mitglieder"-H1 für alle Rollen – der rollenspezifische
  // Unterschied steckt nur noch im Untertitel, nicht mehr in der Überschrift.
  const untertitel = !zugelassen
    ? "Trainer-Verzeichnis und Mitgliederverwaltung"
    : istTrainer
      ? "Trainer-Verzeichnis"
      : "Mitgliederverwaltung – hinzufügen, bearbeiten, löschen und exportieren";

  return (
    <PageShell maxWidth="2xl">
      <PageHeader title="Mitglieder" subtitle={untertitel} />

      {!zugelassen ? (
        <ZugriffsHinweis rolle={rolle} erlaubteRollen={ERLAUBTE_ROLLEN} />
      ) : istTrainer ? (
        <TrainerVerzeichnis />
      ) : (
        // userId ist hier garantiert nicht null, da wir oben auf !uid prüfen
        <MitgliederVerwaltung eigeneUserId={userId!} />
      )}
    </PageShell>
  );
}
