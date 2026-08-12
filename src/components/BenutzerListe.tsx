"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { ChevronDown, ChevronUp } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

type Nutzer = {
  id: string;
  vorname: string;
  nachname: string;
  telefonnummer: string | null;
  rolle: string;
  mannschaft: string[] | null;
};


interface BenutzerListeProps {
  eigeneRolle: string;
}

// mitglied ergänzt gegenüber bisherigem Stand
const ROLLEN_OPTIONEN: Record<string, string[]> = {
  vorstand: ["ausstehend", "trainer", "mitglied"],
  admin: ["ausstehend", "trainer", "mitglied", "vorstand", "admin"],
};

// Rollen-Badge-Mapping: Farbe kommuniziert Status auf einen Blick
type BadgeVariant = "yellow" | "blue" | "green" | "purple" | "red" | "neutral";
const ROLLEN_BADGE: Record<string, { label: string; variant: BadgeVariant }> = {
  ausstehend: { label: "Ausstehend", variant: "yellow" },
  mitglied:   { label: "Mitglied",   variant: "blue" },
  trainer:    { label: "Trainer",    variant: "green" },
  vorstand:   { label: "Vorstand",   variant: "purple" },
  admin:      { label: "Admin",      variant: "red" },
};

export default function BenutzerListe({ eigeneRolle }: BenutzerListeProps) {
  const supabase = createClient();
  // Mannschaftsanfragen wurden in MannschaftsanfragenVerwaltung.tsx ausgelagert
  const [nutzer, setNutzer] = useState<Nutzer[]>([]);
  const [suche, setSuche] = useState("");
  const [expandedUserIds, setExpandedUserIds] = useState<string[]>([]);
  const [fehler, setFehler] = useState("");
  const [erfolg, setErfolg] = useState("");

  useEffect(() => {
    ladeNutzer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ladeNutzer = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, vorname, nachname, telefonnummer, rolle, mannschaft")
      .order("nachname");

    if (error) {
      setFehler("Fehler beim Laden der Nutzerliste: " + error.message);
      return;
    }

    setNutzer(data ?? []);
  };

  const rolleAendern = async (userId: string, neueRolle: string) => {
    const erlaubteRollen = ROLLEN_OPTIONEN[eigeneRolle] ?? [];
    if (!erlaubteRollen.includes(neueRolle)) {
      setFehler("Du darfst diese Rolle nicht vergeben.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ rolle: neueRolle })
      .eq("id", userId);

    if (error) {
      setFehler("Fehler beim Ändern der Rolle: " + error.message);
    } else {
      setErfolg("Rolle erfolgreich geändert.");
      ladeNutzer();
    }
  };

  const ablehnen = async (userId: string, name: string) => {
    if (!confirm(`Nutzer ${name} wirklich ablehnen und Konto löschen?`)) return;

    // Access-Token mitschicken, damit die Route serverseitig prüfen kann,
    // wer den Aufruf macht (Sicherheitsfix 2026-08-12).
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setFehler("Nicht angemeldet – bitte neu einloggen.");
      return;
    }

    const res = await fetch("/api/benutzer-ablehnen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ userId }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setFehler("Fehler beim Ablehnen: " + (body.error ?? res.statusText));
    } else {
      setErfolg(`Nutzer ${name} wurde abgelehnt und gelöscht.`);
      ladeNutzer();
    }
  };

  const toggleDetails = (id: string) => {
    setExpandedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const ausstehende = nutzer.filter((n) => n.rolle === "ausstehend");
  const aktive = nutzer.filter((n) => n.rolle !== "ausstehend");
  const gefilterteAktive = aktive.filter((n) =>
    `${n.vorname} ${n.nachname}`.toLowerCase().includes(suche.toLowerCase())
  );

  const erlaubteRollen = ROLLEN_OPTIONEN[eigeneRolle] ?? [];

  return (
    <div className="space-y-8">
      {fehler && (
        <p className="font-inter text-sm p-3 border border-fcb-red/40 rounded-lg bg-fcb-red/10 text-fcb-red">
          {fehler}
        </p>
      )}
      {erfolg && (
        <p className="font-inter text-sm p-3 border border-green-500/40 rounded-lg bg-green-500/10 text-green-500">
          {erfolg}
        </p>
      )}

      {/* Ausstehende Anfragen */}
      {ausstehende.length > 0 && (
        <section>
          <h2 className="font-oswald text-lg font-semibold uppercase tracking-wide text-fcb-text mb-3">
            Ausstehende Anfragen ({ausstehende.length})
          </h2>
          <div className="space-y-3">
            {ausstehende.map((n) => (
              <div
                key={n.id}
                className="border border-yellow-500/40 rounded-xl p-4 bg-yellow-500/10"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-inter font-semibold text-fcb-text">
                      {n.vorname} {n.nachname}
                    </p>
                    {n.telefonnummer && (
                      <p className="font-inter text-sm text-fcb-muted">
                        Telefon: {n.telefonnummer}
                      </p>
                    )}
                    {n.mannschaft && n.mannschaft.length > 0 && (
                      <p className="font-inter text-sm text-fcb-muted">
                        Mannschaft(en): {n.mannschaft.join(", ")}
                      </p>
                    )}
                  </div>
                  {/* Dropdown statt fester Buttons – freischalten geschieht implizit
                      durch Auswahl einer Nicht-ausstehend-Rolle. ROLLEN_OPTIONEN
                      enthält "ausstehend" für beide Rollen, daher immer sichtbar. */}
                  <div className="flex items-center gap-2">
                    {/* w-36 entspricht der festen Breite im "Aktive Nutzer"-Block */}
                    <select
                      value={n.rolle}
                      onChange={(e) => rolleAendern(n.id, e.target.value)}
                      className="w-36 rounded-lg border border-fcb-border bg-fcb-bg px-2 py-1.5 font-inter text-sm text-fcb-text focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent/40 focus:border-fcb-accent"
                    >
                      {erlaubteRollen.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => ablehnen(n.id, `${n.vorname} ${n.nachname}`)}
                    >
                      Ablehnen
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Aktive Nutzer */}
      <section>
        <h2 className="font-oswald text-lg font-semibold uppercase tracking-wide text-fcb-text mb-3">
          Aktive Nutzer ({aktive.length})
        </h2>

        {/* Suchfeld retokenisiert – kein .form-field mehr */}
        <input
          type="text"
          placeholder="Nutzer suchen …"
          value={suche}
          onChange={(e) => setSuche(e.target.value)}
          className="w-full rounded-lg border border-fcb-border bg-fcb-bg px-3 py-2.5 font-inter text-sm text-fcb-text placeholder:text-fcb-muted/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent/40 focus:border-fcb-accent mb-4"
        />

        <div className="space-y-3">
          {gefilterteAktive.map((n) => (
            <div
              key={n.id}
              className="border border-fcb-border rounded-xl p-4 bg-fcb-surface hover:bg-fcb-border/40 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-inter font-semibold text-fcb-text">
                    {n.vorname} {n.nachname}
                  </p>
                  {/* Rolle als Badge – visuell konsistent mit ROLLEN_BADGE-Mapping */}
                  <div className="mt-1">
                    <Badge variant={(ROLLEN_BADGE[n.rolle]?.variant) ?? "neutral"}>
                      {ROLLEN_BADGE[n.rolle]?.label ?? n.rolle}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleDetails(n.id)}
                    className="font-inter text-sm text-fcb-muted hover:text-fcb-text transition-colors flex items-center gap-1"
                  >
                    {expandedUserIds.includes(n.id) ? (
                      <>Details ausblenden <ChevronUp className="w-4 h-4" /></>
                    ) : (
                      <>Weitere Infos <ChevronDown className="w-4 h-4" /></>
                    )}
                  </button>

                  {/*
                    Dropdown nur anzeigen, wenn die aktuelle Rolle des Nutzers
                    auch tatsächlich von der eingeloggten Person geändert werden
                    darf. Sonst Badge: ein vorstand-User darf z. B. einen admin
                    nicht herabstufen – ohne diesen Guard würde das <select>
                    fälschlich auf die erste Option ("ausstehend") zurückfallen.
                    Der w-36-Container stellt sicher, dass "Weitere Infos" in
                    jeder Zeile exakt auf derselben horizontalen Position bleibt,
                    egal ob Dropdown (breiter) oder Badge (schmaler) gezeigt wird.
                  */}
                  <div className="w-36 flex items-center">
                    {erlaubteRollen.includes(n.rolle) ? (
                      <select
                        value={n.rolle}
                        onChange={(e) => rolleAendern(n.id, e.target.value)}
                        className="w-full rounded-lg border border-fcb-border bg-fcb-bg px-2 py-1.5 font-inter text-sm text-fcb-text focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent/40 focus:border-fcb-accent"
                      >
                        {erlaubteRollen.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      // Nicht-änderbarer Badge für Rollen außerhalb der eigenen Berechtigung
                      // (z. B. vorstand sieht admin-Badge, kann ihn nicht ändern)
                      <span title="Diese Rolle kannst du nicht ändern">
                        <Badge variant={(ROLLEN_BADGE[n.rolle]?.variant) ?? "neutral"}>
                          {ROLLEN_BADGE[n.rolle]?.label ?? n.rolle}
                        </Badge>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {expandedUserIds.includes(n.id) && (
                <div className="mt-3 font-inter text-sm space-y-1 text-fcb-muted">
                  {n.telefonnummer && <p>Telefon: {n.telefonnummer}</p>}
                  {n.mannschaft && n.mannschaft.length > 0 && (
                    <p>Mannschaft(en): {n.mannschaft.join(", ")}</p>
                  )}
                  {!n.telefonnummer && (!n.mannschaft || n.mannschaft.length === 0) && (
                    <p className="italic text-fcb-muted/60">Keine weiteren Informationen vorhanden.</p>
                  )}
                </div>
              )}
            </div>
          ))}

          {gefilterteAktive.length === 0 && (
            <p className="font-inter text-sm italic text-center text-fcb-muted py-8">
              Keine Nutzer gefunden.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
