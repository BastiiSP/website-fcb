"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { checkSession } from "@/utils/checkSession";
import BenutzerListe from "@/components/BenutzerListe";
import MannschaftsanfragenVerwaltung from "@/components/MannschaftsanfragenVerwaltung";
import PageShell from "@/components/ui/PageShell";
import PageHeader from "@/components/ui/PageHeader";
import Tabs from "@/components/ui/Tabs";

// Tab-Typ: Benutzer, Mannschaftsanfragen, Buchungsübersicht
const TABS = [
  { id: "benutzer",  label: "Benutzer" },
  { id: "anfragen",  label: "Mannschaftsanfragen" },
  { id: "buchungen", label: "Buchungen" },
];

export default function VorstandPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [zugelassen, setZugelassen] = useState(false);
  const [eigeneRolle, setEigeneRolle] = useState("");
  const [activeTab, setActiveTab] = useState<"benutzer" | "anfragen" | "buchungen">(
    "benutzer"
  );

  useEffect(() => {
    const checkAccess = async () => {
      const session = await checkSession(supabase);
      const rolle = session?.rolle ?? "";

      // Zugriff nur für Vorstand und Admin – RLS in der DB sichert dies zusätzlich ab
      if (rolle === "vorstand" || rolle === "admin") {
        setZugelassen(true);
        setEigeneRolle(rolle);
      } else {
        setZugelassen(false);
      }

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

  if (!zugelassen) {
    return (
      <PageShell maxWidth="2xl">
        <div className="text-center space-y-4">
          <p className="font-oswald text-xl font-semibold uppercase tracking-wide text-fcb-text">
            Kein Zugriff
          </p>
          <p className="font-inter text-sm text-fcb-muted">
            Diese Seite ist nur für Vorstandsmitglieder und Admins zugänglich.
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell maxWidth="2xl">
      <PageHeader
        title="Vorstandsbereich"
        subtitle="Vereinsverwaltung"
      />

      {/* Tab-Navigation – a11y-konform via Tabs-Primitiv */}
      <div className="mb-8">
        <Tabs
          tabs={TABS}
          active={activeTab}
          onChange={(id) => setActiveTab(id as "benutzer" | "anfragen" | "buchungen")}
        />
      </div>

      {activeTab === "benutzer" && (
        <section>
          <BenutzerListe eigeneRolle={eigeneRolle} />
        </section>
      )}

      {activeTab === "anfragen" && (
        <section>
          <MannschaftsanfragenVerwaltung />
        </section>
      )}

      {activeTab === "buchungen" && (
        <section>
          <p className="font-inter text-fcb-muted text-lg mb-2">Buchungsübersicht folgt …</p>
        </section>
      )}
    </PageShell>
  );
}
