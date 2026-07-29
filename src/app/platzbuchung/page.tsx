"use client";

import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput } from "@fullcalendar/core";
import { createClient } from "@/lib/supabaseClient";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { format } from "date-fns";
import { de } from "date-fns/locale";

import Link from "next/link";
import ToastMessage from "@/components/ToastMessage";
import Buchungsformular from "@/components/Buchungsformular";
import LoeschenModal from "@/components/LoeschenModal";
import BearbeitenModal, {
  type Buchung,
  type SerienBereich,
} from "@/components/BearbeitenModal";
import TooltipContent from "@/components/TooltipContent";
import { loescheSerie } from "@/lib/serienbuchung";
import KalenderToolbar, {
  type KalenderAnsicht,
} from "@/components/kalender/KalenderToolbar";
import EventChip from "@/components/kalender/EventChip";
import { fetchEvents } from "@/utils/fetchEvents";
import { PLATZ_FARBEN } from "@/utils/getEventColor";
import PageShell from "@/components/ui/PageShell";
import PageHeader from "@/components/ui/PageHeader";
import ZugriffsHinweis from "@/components/ui/ZugriffsHinweis";
import { checkSession } from "@/utils/checkSession";

const supabase = createClient();

// Zugriff nur für Trainer, Vorstand und Admin – RLS in der DB sichert dies zusätzlich ab
const ERLAUBTE_ROLLEN = ["trainer", "vorstand", "admin"];

export default function PlatzbuchungSeite() {
  // 🔁 States für User, Rollen und Events
  const [events, setEvents] = useState<EventInput[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [rolle, setRolle] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ UI States: Meldungen, Modal, Tooltip
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  // Komplette Buchung statt nur ID vorhalten → Rechte-Check vor dem Löschen möglich
  const [zuLoeschendeBuchung, setZuLoeschendeBuchung] = useState<Buchung | null>(null);
  const [bearbeiteBuchung, setBearbeiteBuchung] = useState<Buchung | null>(
    null
  );
  const [geoeffneterTooltipId, setGeoeffneterTooltipId] = useState<
    string | null
  >(null);

  // Eigene Toolbar (Outlook-Muster) statt der FullCalendar-headerToolbar:
  // Ref steuert die Kalender-API, Titel/Ansicht kommen aus datesSet zurück.
  const kalenderRef = useRef<FullCalendar | null>(null);
  const [kalenderTitel, setKalenderTitel] = useState("");
  const [ansicht, setAnsicht] = useState<KalenderAnsicht>("timeGridWeek");

  // Session prüfen und Rolle laden – checkSession() nutzt getUser() statt
  // getSession(), damit die Rolle nach z. B. einer E-Mail-Änderung stets aktuell ist.
  useEffect(() => {
    const pruefeZugang = async () => {
      const { userId: geprueftUserId, rolle: geprueftRolle } = await checkSession(supabase);

      if (!geprueftUserId) {
        window.location.href = "/login";
        return;
      }

      setUserId(geprueftUserId);
      setRolle(geprueftRolle);
      setIsLoggedIn(true);

      // Kalenderdaten nur laden, wenn die Rolle auch Zugriff hat
      if (ERLAUBTE_ROLLEN.includes(geprueftRolle ?? "")) {
        fetchEvents(supabase, setEvents);
      }
    };

    pruefeZugang();
  }, []);

  // 🗑️ Termin löschen – bereich steuert bei Serien: nur diese Instanz oder
  // alle zukünftigen Termine der Serie
  const handleLoeschen = async (bereich: SerienBereich) => {
    if (!zuLoeschendeBuchung) return;

    // Rechte-Check wie beim Bearbeiten – RLS würde das Löschen ohnehin blocken,
    // aber so gibt es eine verständliche Meldung statt eines stillen Fehlschlags.
    const darfLoeschen =
      rolle === "vorstand" ||
      rolle === "admin" ||
      zuLoeschendeBuchung.user_id === userId;
    if (!darfLoeschen) {
      setErrorMessage("Du darfst diese Buchung nicht löschen.");
      setZuLoeschendeBuchung(null);
      return;
    }

    if (bereich !== "einzeln" && zuLoeschendeBuchung.serien_id) {
      try {
        // Pivot ist der ausgewählte Termin: "abDiesem" löscht ihn + alle
        // folgenden, "alle" die komplette Serie inkl. vergangener Termine.
        const anzahl = await loescheSerie(
          zuLoeschendeBuchung.serien_id,
          supabase,
          bereich === "abDiesem"
            ? new Date(zuLoeschendeBuchung.startzeit).toISOString()
            : null
        );
        setSuccessMessage(
          `${
            bereich === "abDiesem" ? "Serie ab diesem Termin" : "Ganze Serie"
          } gelöscht: ${anzahl} Termin${anzahl !== 1 ? "e" : ""} entfernt.`
        );
        fetchEvents(supabase, setEvents);
      } catch {
        setErrorMessage("Löschen der Serie fehlgeschlagen.");
      }
      setZuLoeschendeBuchung(null);
      return;
    }

    const { error } = await supabase
      .from("buchungen")
      .delete()
      .eq("id", zuLoeschendeBuchung.id);

    if (error) {
      setErrorMessage("Löschen fehlgeschlagen.");
    } else {
      setSuccessMessage("Buchung erfolgreich gelöscht.");
      fetchEvents(supabase, setEvents);
    }

    setZuLoeschendeBuchung(null);
  };

  // Toolbar-Aktionen delegieren an die FullCalendar-API
  const kalenderApi = () => kalenderRef.current?.getApi();

  /**
   * Gemeinsame Logik für eventDrop und eventResize:
   * Rechte-Check → Kollisionsprüfung → Persistierung in Supabase → Reload.
   * Beide FullCalendar-Callbacks haben .event, .event.start/end und .revert().
   */
  const aktualisiereBuchungszeiten = async (info: {
    event: { start: Date | null; end: Date | null; extendedProps: Record<string, unknown> };
    revert: () => void;
  }) => {
    const buchung = info.event.extendedProps as Buchung;
    const neuesStart = info.event.start;
    const neuesEnde = info.event.end;

    // Schutz gegen undefinierte Daten
    if (!neuesStart || !neuesEnde) return;

    const startISO = neuesStart.toISOString();
    const endISO = neuesEnde.toISOString();

    // Buchung nur aktualisieren, wenn sich Zeiten wirklich geändert haben
    if (startISO === buchung.startzeit && endISO === buchung.endzeit) {
      return;
    }

    // 👮 Zugriffsrechte prüfen – admin steht über dem Vorstand und darf ebenfalls alles
    const darfAnpassen =
      rolle === "vorstand" || rolle === "admin" || buchung.user_id === userId;
    if (!darfAnpassen) {
      info.revert();
      setErrorMessage("Du darfst diese Buchung nicht bearbeiten.");
      return;
    }

    // 🔎 Bestehende Buchungen für denselben Platz abrufen (Kollisionscheck)
    const { data: existing, error } = await supabase
      .from("buchungen")
      .select("startzeit, endzeit, platzanteil")
      .eq("platz", buchung.platz)
      .neq("id", buchung.id) // Aktuelle Buchung ausschließen
      .gte("endzeit", startISO)
      .lte("startzeit", endISO);

    if (error) {
      console.error("Fehler beim Abrufen:", error);
      setErrorMessage("Fehler bei der Überprüfung der Platzbelegung.");
      info.revert();
      return;
    }

    const anteilsWerte: Record<string, number> = {
      ganz: 1,
      halb: 0.5,
      viertel: 0.25,
    };

    let belegung = 0;
    for (const eintrag of existing || []) {
      const existingStart = new Date(eintrag.startzeit).getTime();
      const existingEnd = new Date(eintrag.endzeit).getTime();
      const newStart = neuesStart.getTime();
      const newEnd = neuesEnde.getTime();

      if (newStart < existingEnd && newEnd > existingStart) {
        belegung += anteilsWerte[eintrag.platzanteil] || 0;
      }
    }

    const aktuellerWert = anteilsWerte[buchung.platzanteil] || 0;

    if (belegung + aktuellerWert > 1) {
      setErrorMessage("Der Platz ist zu diesem Zeitpunkt vollständig belegt.");
      info.revert();
      return;
    }

    // ✅ Buchung mit neuen Zeiten speichern
    const { error: updateError } = await supabase
      .from("buchungen")
      .update({ startzeit: startISO, endzeit: endISO })
      .eq("id", buchung.id);

    if (updateError) {
      setErrorMessage("Fehler beim Speichern der neuen Zeiten.");
      info.revert();
      return;
    }

    setSuccessMessage("Buchung erfolgreich angepasst.");
    await fetchEvents(supabase, setEvents);
  };

  return (
    <>
      {/* Toast-Meldungen liegen über allem anderen */}
      {errorMessage && (
        <ToastMessage
          message={errorMessage}
          type="error"
          onClose={() => setErrorMessage("")}
        />
      )}
      {successMessage && (
        <ToastMessage
          message={successMessage}
          type="success"
          onClose={() => setSuccessMessage("")}
        />
      )}

      <PageShell maxWidth="2xl">
        <PageHeader
          title="Platzbuchung"
          subtitle="Trainings- und Spielzeiten auf Haupt- und Nebenplatz buchen"
        />

        {!isLoggedIn ? (
          <div className="text-center font-inter space-y-4">
            <p className="text-fcb-muted">
              Du bist nicht eingeloggt. Bitte logge dich ein, um die
              Platzbelegung zu sehen.
            </p>
            <Link
              href="/login"
              className="inline-block rounded-lg bg-fcb-blue px-4 py-2 font-semibold text-white transition hover:bg-fcb-blue/90"
            >
              Zum Login / zur Registrierung
            </Link>
          </div>
        ) : !ERLAUBTE_ROLLEN.includes(rolle ?? "") ? (
          <ZugriffsHinweis rolle={rolle} erlaubteRollen={ERLAUBTE_ROLLEN} />
        ) : (
          <>
            {/* Farb-Legende: zeigt dauerhaft, welche Farbe für welchen Platz steht */}
            <div className="flex flex-wrap gap-2 mb-3">
              {Object.entries(PLATZ_FARBEN).map(([platz, farbe]) => (
                <span
                  key={platz}
                  className="inline-flex items-center gap-2 rounded-full border border-fcb-border bg-fcb-surface px-3 py-1 font-inter text-sm font-medium text-fcb-text"
                >
                  <span
                    className="inline-block h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: farbe }}
                  />
                  {platz.charAt(0).toUpperCase() + platz.slice(1)}
                </span>
              ))}
            </div>

            {/* Surface-Container hebt den Kalender vom Seiten-Hintergrund (bg-fcb-bg) ab */}
            <div className="rounded-2xl border border-fcb-border bg-fcb-surface p-3 sm:p-5">
              {/* Eigene Toolbar im Outlook-Stil – steuert FullCalendar über die API */}
              <KalenderToolbar
                titel={kalenderTitel}
                ansicht={ansicht}
                onHeute={() => kalenderApi()?.today()}
                onZurueck={() => kalenderApi()?.prev()}
                onWeiter={() => kalenderApi()?.next()}
                onAnsichtWechsel={(neueAnsicht) =>
                  kalenderApi()?.changeView(neueAnsicht)
                }
              />

              <FullCalendar
                ref={kalenderRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                locale="de"
                firstDay={1}
                // Kopfzeile komplett deaktiviert – ersetzt durch KalenderToolbar
                headerToolbar={false}
                // Titel + aktive Ansicht in den React-State spiegeln
                datesSet={(arg) => {
                  setKalenderTitel(arg.view.title);
                  setAnsicht(arg.view.type as KalenderAnsicht);
                }}
                slotMinTime="08:00:00"
                slotMaxTime="22:30:00"
                allDaySlot={false}
                height="auto"
                // Gleichzeitige Buchungen (z. B. zwei halbe Plätze) sauber
                // nebeneinander statt überlappend rendern
                slotEventOverlap={false}
                // Rote "Jetzt"-Linie wie in Outlook/Teams
                nowIndicator={true}
                editable={true}
                eventResizableFromStart={true}
                eventDrop={async (info) => aktualisiereBuchungszeiten(info)}
                eventResize={async (info) => aktualisiereBuchungszeiten(info)}
                events={events}
                // Spaltenkopf im Outlook-Stil: Wochentag klein, Tageszahl groß,
                // heutiger Tag als gefüllter blauer Kreis
                dayHeaderContent={(arg) => {
                  if (arg.view.type === "dayGridMonth") {
                    return (
                      <span className="font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted">
                        {format(arg.date, "EEEEEE", { locale: de })}
                      </span>
                    );
                  }
                  return (
                    <div className="flex flex-col items-center gap-0.5 py-1">
                      <span className="font-inter text-[11px] font-medium uppercase tracking-wider text-fcb-muted">
                        {format(arg.date, "EEEEEE", { locale: de })}
                      </span>
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full font-inter text-sm font-semibold ${
                          arg.isToday
                            ? "bg-fcb-blue text-white"
                            : "text-fcb-text"
                        }`}
                      >
                        {format(arg.date, "d")}
                      </span>
                    </div>
                  );
                }}
                eventContent={(arg) => {
                  const props = arg.event.extendedProps as Buchung;
                  const istGeoeffnet = geoeffneterTooltipId === arg.event.id;

                  return (
                    <Tippy
                      visible={istGeoeffnet}
                      onClickOutside={() => setGeoeffneterTooltipId(null)}
                      content={
                        <TooltipContent
                          props={props}
                          event={arg.event}
                          userId={userId}
                          rolle={rolle}
                          onEdit={() => {
                            setBearbeiteBuchung(props);
                            setGeoeffneterTooltipId(null);
                          }}
                          onDelete={() => {
                            setZuLoeschendeBuchung(props);
                            setGeoeffneterTooltipId(null);
                          }}
                        />
                      }
                      interactive={true}
                      // theme "custom" ist in globals.css theme-aware definiert
                      // (hell/dunkel) – ersetzt das starre light-border-Theme
                      theme="custom"
                      placement="top"
                      appendTo={document.body}
                      zIndex={9999}
                    >
                      <div
                        className="h-full w-full"
                        onClick={() =>
                          setGeoeffneterTooltipId((prev) =>
                            prev === arg.event.id ? null : arg.event.id
                          )
                        }
                      >
                        <EventChip
                          buchung={props}
                          start={arg.event.start}
                          end={arg.event.end}
                          kompakt={arg.view.type === "dayGridMonth"}
                        />
                      </div>
                    </Tippy>
                  );
                }}
              />
            </div>

            {/* Buchungsformular */}
            <Buchungsformular
              userId={userId!}
              supabase={supabase}
              setEvents={setEvents}
              setSuccessMessage={setSuccessMessage}
              setErrorMessage={setErrorMessage}
            />
          </>
        )}
      </PageShell>

      {/* Lösch-Bestätigung – bei Serienterminen mit Auswahl Einzeltermin/Serie */}
      <LoeschenModal
        show={zuLoeschendeBuchung !== null}
        onClose={() => setZuLoeschendeBuchung(null)}
        onConfirm={handleLoeschen}
        mannschaft={zuLoeschendeBuchung?.mannschaft || ""}
        serienWahl={!!zuLoeschendeBuchung?.serien_id}
      />

      {/* Bearbeiten-Modal */}
      <BearbeitenModal
        show={!!bearbeiteBuchung}
        onClose={() => setBearbeiteBuchung(null)}
        supabase={supabase}
        initialData={bearbeiteBuchung!}
        onSave={(meldung) => {
          setBearbeiteBuchung(null);
          setSuccessMessage(meldung ?? "Buchung erfolgreich aktualisiert.");
          fetchEvents(supabase, setEvents);
        }}
      />
    </>
  );
}
