import { EventApi } from "@fullcalendar/core";
import {
  Clock,
  MapPin,
  Pencil,
  Repeat,
  StickyNote,
  Trash2,
  User,
} from "lucide-react";
import type { Buchung } from "@/components/BearbeitenModal";
import { ANLASS_LABEL, PLATZANTEIL_LABEL } from "@/lib/buchungsOptionen";

type Props = {
  props: Buchung; // Buchungsdetails (z. B. Platz, Person, Bemerkung etc.)
  event: EventApi; // Kalender-Event (z. B. Start/Ende)
  userId: string | null;
  rolle: string | null;
  onEdit: () => void;
  onDelete: () => void;
};

// Detail-Zeile mit Lucide-Icon – ersetzt die frühere Emoji-Liste (Design-Spec:
// keine Emojis in der UI)
function DetailZeile({
  Icon,
  children,
}: {
  Icon: typeof MapPin;
  children: React.ReactNode;
}) {
  return (
    <p className="flex items-center gap-2 font-inter text-sm text-fcb-text">
      <Icon size={16} aria-hidden className="shrink-0 text-fcb-muted" />
      <span>{children}</span>
    </p>
  );
}

export default function TooltipContent({
  props,
  event,
  userId,
  rolle,
  onEdit,
  onDelete,
}: Props) {
  // Ersteller, Vorstand oder Admin darf bearbeiten/löschen (admin = höchste Instanz)
  const darfBearbeiten =
    rolle === "vorstand" || rolle === "admin" || props.user_id === userId;

  return (
    <div className="space-y-2 p-1">
      {/* Kopf: Anlass + Mannschaft als Titel des Popovers */}
      <div className="border-b border-fcb-border pb-2">
        <p className="font-oswald text-sm font-semibold uppercase tracking-wide text-fcb-text">
          {ANLASS_LABEL[props.anlass] ?? props.anlass}
        </p>
        <p className="font-inter text-sm text-fcb-muted">{props.mannschaft}</p>
      </div>

      <div className="space-y-1.5">
        <DetailZeile Icon={Clock}>
          {new Date(event.start!).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          –{" "}
          {new Date(event.end!).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          Uhr
        </DetailZeile>

        <DetailZeile Icon={MapPin}>
          {props.platz.charAt(0).toUpperCase() + props.platz.slice(1)} ·{" "}
          {PLATZANTEIL_LABEL[props.platzanteil] ?? props.platzanteil}
        </DetailZeile>

        <DetailZeile Icon={User}>{props.buchende_person}</DetailZeile>

        {/* Serien-Kennzeichnung: Bearbeiten/Löschen bietet dann die Bereichswahl an */}
        {props.serien_id && (
          <DetailZeile Icon={Repeat}>Wöchentliche Serie</DetailZeile>
        )}

        {props.bemerkung && (
          <DetailZeile Icon={StickyNote}>{props.bemerkung}</DetailZeile>
        )}
      </div>

      {/* Bearbeiten & Löschen nur für Berechtigte */}
      {darfBearbeiten && (
        <div className="flex gap-2 border-t border-fcb-border pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-fcb-border bg-fcb-surface px-2.5 py-1.5 font-inter text-xs font-medium text-fcb-text transition-colors hover:border-fcb-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent"
          >
            <Pencil size={14} aria-hidden /> Bearbeiten
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-fcb-red px-2.5 py-1.5 font-inter text-xs font-medium text-white transition hover:bg-fcb-red/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-red"
          >
            <Trash2 size={14} aria-hidden /> Löschen
          </button>
        </div>
      )}
    </div>
  );
}
