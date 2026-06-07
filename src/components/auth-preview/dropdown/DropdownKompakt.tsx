import { LogIn, LogOut, User, UserPlus } from "lucide-react";
import DropdownShell from "./DropdownShell";
import DropdownStage from "./DropdownStage";
import { DUMMY_USER } from "./dummyUser";

/**
 * Variante B – Kompakt: kein Header-Bereich, direkt die Aktionen als flache Liste.
 * Login und Registrieren gleichwertig untereinander.
 * Eingeloggt: Name als erstes Listenelement ohne eigene Sektion.
 */
export default function DropdownKompakt() {
  return (
    <DropdownStage
      beschreibung={`Variante B – Kompakt: Kein Header, direkt die Aktionen als flache Liste. Login und Registrieren gleichwertig untereinander.`}
      ausgeloggt={
        <DropdownShell className="w-56">
          <div className="p-1">
            <span className="flex items-center gap-2 rounded-md px-3 py-2 font-inter text-sm text-fcb-text">
              <LogIn className="h-4 w-4 text-fcb-muted" />
              Anmelden
            </span>
            <span className="flex items-center gap-2 rounded-md px-3 py-2 font-inter text-sm text-fcb-text">
              <UserPlus className="h-4 w-4 text-fcb-muted" />
              Registrieren
            </span>
          </div>
        </DropdownShell>
      }
      eingeloggt={
        <DropdownShell className="w-56">
          <div className="p-1">
            {/* Name als erstes Listenelement, leicht hervorgehoben – keine Sektion */}
            <span className="block rounded-md px-3 py-2 font-inter text-sm font-semibold text-fcb-text">
              {DUMMY_USER.name}
            </span>
            <span className="flex items-center gap-2 rounded-md px-3 py-2 font-inter text-sm text-fcb-text">
              <User className="h-4 w-4 text-fcb-muted" />
              Profil bearbeiten
            </span>
            <span className="flex items-center gap-2 rounded-md px-3 py-2 font-inter text-sm font-medium text-fcb-red">
              <LogOut className="h-4 w-4" />
              Abmelden
            </span>
          </div>
        </DropdownShell>
      }
    />
  );
}
