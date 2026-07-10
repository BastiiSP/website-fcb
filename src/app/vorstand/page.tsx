"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { checkSession } from "@/utils/checkSession";
import BenutzerListe from "@/components/BenutzerListe";
import MannschaftsanfragenVerwaltung from "@/components/MannschaftsanfragenVerwaltung";
import BuchungenVerwaltung from "@/components/BuchungenVerwaltung";
import SportheimAnfragenVerwaltung from "@/components/SportheimAnfragenVerwaltung";
import PageShell from "@/components/ui/PageShell";
import PageHeader from "@/components/ui/PageHeader";
import Tabs from "@/components/ui/Tabs";
import ZugriffsHinweis from "@/components/ui/ZugriffsHinweis";

// Tab-Typ: Benutzer, Mannschaftsanfragen, Buchungsübersicht, Sportheimanfragen
const TABS = [
  { id: "benutzer",  label: "Benutzer" },
  { id: "anfragen",  label: "Mannschaftsanfragen" },
  { id: "buchungen", label: "Buchungen" },
  { id: "sportheim", label: "Sportheim" },
];

// Zugriff nur für Vorstand und Admin – RLS in der DB sichert dies zusätzlich ab
const ERLAUBTE_ROLLEN = ["vorstand", "admin"];

export default function VorstandPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [rolle, setRolle] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "benutzer" | "anfragen" | "buchungen" | "sportheim"
  >("benutzer");

  useEffect(() => {
    const checkAccess = async () => {
      const session = await checkSession(supabase);
      setRolle(session?.rolle ?? null);
      setLoading(false);
    };

    checkAccess();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <PageShell maxWidth="2xl">
        <p className="font-inter text-fcb-muted">Lade Inhalte …</p>
      </PageShell>
    );
  }

  const zugelassen = rolle === "vorstand" || rolle === "admin";

  return (
    <PageShell maxWidth="2xl">
      <PageHeader
        title="Vorstandsbereich"
        subtitle="Vereinsverwaltung"
      />

      {!zugelassen ? (
        <ZugriffsHinweis rolle={rolle} erlaubteRollen={ERLAUBTE_ROLLEN} />
      ) : (
        <>
          {/* Tab-Navigation – a11y-konform via Tabs-Primitiv */}
          <div className="mb-8">
            <Tabs
              tabs={TABS}
              active={activeTab}
              onChange={(id) =>
                setActiveTab(id as "benutzer" | "anfragen" | "buchungen" | "sportheim")
              }
            />
          </div>

          {activeTab === "benutzer" && (
            <section>
              <BenutzerListe eigeneRolle={rolle ?? ""} />
            </section>
          )}

          {activeTab === "anfragen" && (
            <section>
              <MannschaftsanfragenVerwaltung />
            </section>
          )}

          {activeTab === "buchungen" && (
            <section>
              <BuchungenVerwaltung />
            </section>
          )}

          {activeTab === "sportheim" && (
            <section>
              <SportheimAnfragenVerwaltung />
            </section>
          )}
        </>
      )}
    </PageShell>
  );
}
