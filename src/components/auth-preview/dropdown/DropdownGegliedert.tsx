import { LogIn, LogOut, User, UserPlus } from "lucide-react";
import DropdownShell from "./DropdownShell";
import DropdownStage from "./DropdownStage";
import { DUMMY_USER } from "./dummyUser";

/**
 * Variante A – Gegliedert (entspricht dem aktuellen UserDropdown):
 * Header-Bereich oben, abgesetzter blauer Login-Button, Trennlinie, Registrieren-Link.
 * Eingeloggt: Name/E-Mail als Header, „Profil bearbeiten", „Abmelden" in fcb-red.
 */
export default function DropdownGegliedert() {
  return (
    <DropdownStage
      beschreibung={`Variante A – Gegliedert: Header oben, abgesetzter blauer Login-Button, Trennlinie, Registrieren-Link. Klare Hierarchie, entspricht dem aktuellen Stand.`}
      ausgeloggt={
        <DropdownShell>
          {/* Kopf: einladender Hinweis */}
          <div className="border-b border-fcb-border px-4 py-3">
            <p className="font-inter text-sm font-semibold text-fcb-text">
              Willkommen beim FCB
            </p>
            <p className="font-inter text-xs text-fcb-muted">
              Melde dich an oder registriere dich.
            </p>
          </div>
          {/* Login-Pfad – primäre, abgesetzte Aktion */}
          <div className="p-1">
            <span className="flex items-center gap-2 rounded-md bg-fcb-blue px-3 py-2 font-inter text-sm font-medium text-white">
              <LogIn className="h-4 w-4" />
              Login
            </span>
          </div>
          {/* Registrieren-Pfad – optisch getrennt */}
          <div className="border-t border-fcb-border p-1">
            <span className="flex items-center gap-2 rounded-md px-3 py-2 font-inter text-sm text-fcb-text">
              <UserPlus className="h-4 w-4 text-fcb-muted" />
              Noch kein Konto? Registrieren
            </span>
          </div>
        </DropdownShell>
      }
      eingeloggt={
        <DropdownShell>
          {/* Kopf: Name + E-Mail */}
          <div className="border-b border-fcb-border px-4 py-3">
            <p className="font-inter text-sm font-semibold text-fcb-text">
              {DUMMY_USER.name}
            </p>
            <p className="truncate font-inter text-xs text-fcb-muted">
              {DUMMY_USER.email}
            </p>
          </div>
          {/* Aktionen */}
          <div className="p-1">
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
