"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { checkSession } from "@/utils/checkSession";
import Link from "next/link";
import PersoenlicheDaten from "@/components/profil/PersoenlicheDaten";
import MannschaftLizenzen from "@/components/profil/MannschaftLizenzen";
import AccountSicherheit from "@/components/profil/AccountSicherheit";
import AvatarUploadModal from "@/components/profil/AvatarUploadModal";
import PageShell from "@/components/ui/PageShell";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import Tabs from "@/components/ui/Tabs";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";

type Tab = "persoenlich" | "mannschaft" | "account";

interface ProfilDaten {
  id: string;
  vorname: string;
  nachname: string;
  email: string;
  telefonnummer: string | null;
  geburtsdatum: string | null;
  strasse: string | null;
  plz: string | null;
  ort: string | null;
  mannschaft: string[];
  trainer_lizenzen: string[];
  avatar_url: string | null;
  rolle: string;
}

// Read-only Anzeige der aktuellen Rolle im Profil. Ändert NICHTS am
// Rollenkonzept (Vergabe bleibt Vorstand/Admin vorbehalten) – reine Information
// für den Nutzer, v. a. für den Status 'ausstehend'.
const ROLLEN_BADGE: Record<string, { label: string; variant: "yellow" | "blue" | "green" | "purple" | "red" | "neutral" }> = {
  ausstehend: { label: "Ausstehend", variant: "yellow" },
  mitglied:   { label: "Mitglied",   variant: "blue" },
  trainer:    { label: "Trainer",    variant: "green" },
  vorstand:   { label: "Vorstand",   variant: "purple" },
  admin:      { label: "Admin",      variant: "red" },
};

export default function ProfilPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [profil, setProfil] = useState<ProfilDaten | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("persoenlich");
  const [avatarModalOffen, setAvatarModalOffen] = useState(false);

  useEffect(() => {
    const ladeProfil = async () => {
      const { userId, userEmail } = await checkSession(supabase);

      if (!userId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, vorname, nachname, telefonnummer, geburtsdatum, strasse, plz, ort, mannschaft, trainer_lizenzen, avatar_url, rolle"
        )
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Fehler beim Laden des Profils:", error.message);
      } else if (data) {
        setProfil({
          ...data,
          email: userEmail ?? "",
          mannschaft: data.mannschaft ?? [],
          trainer_lizenzen: data.trainer_lizenzen ?? [],
        });
      }

      setLoading(false);
    };

    ladeProfil();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wird die E-Mail-Bestätigung im selben Tab/Session abgeschlossen, feuert Supabase
  // USER_UPDATED mit der neuen Adresse – dann das angezeigte Profil aktualisieren,
  // ohne dass der Nutzer die Seite neu laden muss.
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const aktuelleEmail = session?.user?.email;
      if (aktuelleEmail) {
        setProfil((vorher) =>
          vorher && vorher.email !== aktuelleEmail
            ? { ...vorher, email: aktuelleEmail }
            : vorher
        );
      }
    });

    return () => listener.subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAvatarErfolg = (neueUrl: string) => {
    setAvatarModalOffen(false);
    if (profil) setProfil({ ...profil, avatar_url: neueUrl });

    // UserDropdown im Header informieren – kein globaler Auth-Context vorhanden,
    // daher Custom-Event als minimaler Kommunikationskanal.
    window.dispatchEvent(
      new CustomEvent("avatar-aktualisiert", { detail: neueUrl })
    );
  };

  if (loading) {
    return (
      <PageShell maxWidth="xl">
        <p className="font-inter text-fcb-muted">Lade Profil …</p>
      </PageShell>
    );
  }

  if (!profil) {
    return (
      <PageShell maxWidth="xl">
        <div className="text-center space-y-4">
          <p className="font-oswald text-xl font-semibold uppercase tracking-wide text-fcb-text">
            Nicht eingeloggt
          </p>
          <p className="font-inter text-sm text-fcb-muted">
            Bitte melde dich an, um dein Profil zu bearbeiten.
          </p>
          <Link href="/login">
            <Button variant="secondary" size="md">Zum Login</Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  // Rollen-Badge: bekannte Rollen → Variant; unbekannte → neutral
  const rollenInfo = ROLLEN_BADGE[profil.rolle] ?? { label: profil.rolle, variant: "neutral" as const };

  const tabs = [
    { id: "persoenlich", label: "Persönliche Daten" },
    { id: "mannschaft",  label: "Mannschaft & Lizenzen" },
    { id: "account",     label: "Account & Sicherheit" },
  ];

  return (
    <PageShell maxWidth="xl">
      {/* Seitentitel + Rollen-Badge */}
      <PageHeader
        title="Profil"
        actions={
          <Badge variant={rollenInfo.variant}>
            Rolle: {rollenInfo.label}
          </Badge>
        }
      />

      {/* Hinweis für noch nicht freigeschaltete Konten */}
      {profil.rolle === "ausstehend" && (
        <div className="mb-8">
          <Banner
            variant="warning"
            message="Dein Konto wird geprüft und freigeschaltet. Bei Fragen wende dich an die Vorstandschaft oder den IT-Verantwortlichen."
          />
        </div>
      )}

      {/* Tab-Navigation */}
      <div className="mb-8">
        <Tabs
          tabs={tabs}
          active={activeTab}
          onChange={(id) => setActiveTab(id as Tab)}
        />
      </div>

      {/* Tab-Inhalte */}
      {activeTab === "persoenlich" && (
        <PersoenlicheDaten
          userId={profil.id}
          initialDaten={{
            vorname: profil.vorname,
            nachname: profil.nachname,
            telefonnummer: profil.telefonnummer,
            geburtsdatum: profil.geburtsdatum,
            strasse: profil.strasse,
            plz: profil.plz,
            ort: profil.ort,
          }}
          avatarUrl={profil.avatar_url}
          onAvatarClick={() => setAvatarModalOffen(true)}
        />
      )}

      {activeTab === "mannschaft" && (
        <MannschaftLizenzen
          userId={profil.id}
          initialMannschaft={profil.mannschaft}
          initialLizenzen={profil.trainer_lizenzen}
        />
      )}

      {activeTab === "account" && (
        <AccountSicherheit aktuelleEmail={profil.email} />
      )}

      {/* Avatar-Upload-Modal – immer gerendert, Sichtbarkeit via open-Prop gesteuert */}
      <AvatarUploadModal
        open={avatarModalOffen}
        userId={profil.id}
        onClose={() => setAvatarModalOffen(false)}
        onErfolg={handleAvatarErfolg}
      />
    </PageShell>
  );
}
