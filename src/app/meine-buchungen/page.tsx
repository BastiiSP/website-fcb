"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import MeineBuchungen from "@/components/MeineBuchungen";
import PageShell from "@/components/ui/PageShell";
import PageHeader from "@/components/ui/PageHeader";

const supabase = createClient();

/**
 * Eigene Buchungsübersicht: jede eingeloggte Person sieht hier ausschließlich
 * ihre eigenen Platzbuchungen und kann kommende bearbeiten oder stornieren.
 * Keine Rollen-Beschränkung nötig – die RLS-Policies begrenzen Sichtbarkeit
 * und Änderungsrechte ohnehin auf die eigene Person (bzw. Vorstand/Admin).
 */
export default function MeineBuchungenSeite() {
  const [userId, setUserId] = useState<string | null>(null);
  const [geprueft, setGeprueft] = useState(false);

  useEffect(() => {
    const pruefeSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        window.location.href = "/login";
        return;
      }

      setUserId(session.user.id);
      setGeprueft(true);
    };

    pruefeSession();
  }, []);

  return (
    <PageShell maxWidth="2xl">
      <PageHeader
        title="Meine Buchungen"
        subtitle="Deine eigenen Platzbuchungen – bearbeiten oder stornieren"
      />

      {!geprueft || !userId ? (
        <p className="font-inter text-center text-fcb-muted">Lade …</p>
      ) : (
        <MeineBuchungen userId={userId} />
      )}
    </PageShell>
  );
}
