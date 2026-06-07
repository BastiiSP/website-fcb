import { UserPlus } from "lucide-react";
import NavbarMock from "./NavbarMock";
import AvatarKreis from "./AvatarKreis";
import PreviewStage from "./PreviewStage";

/**
 * Variante B – Split: zwei Buttons direkt in der Navbar sichtbar.
 * „Anmelden“ als Ghost-Button, „Registrieren“ gefüllt. Kein Dropdown für Besucher.
 */
export default function NavbarSplit() {
  return (
    <PreviewStage
      beschreibung={`Variante B – Split: Zwei Buttons direkt sichtbar – „Anmelden“ als Ghost-Button, „Registrieren“ gefüllt. Kein Dropdown für Besucher nötig.`}
      ausgeloggt={
        <NavbarMock>
          {/* Ghost-Button – nur Text, transparenter Hintergrund */}
          <span className="cursor-default rounded-full px-3 py-1.5 font-inter text-sm font-medium text-white/90">
            Anmelden
          </span>
          {/* Gefüllter Button für die Primäraktion Registrieren */}
          <span className="flex cursor-default items-center gap-1.5 rounded-full bg-fcb-blue px-3 py-1.5 font-inter text-sm font-medium text-white">
            <UserPlus className="h-4 w-4" />
            <span>Registrieren</span>
          </span>
        </NavbarMock>
      }
      eingeloggt={
        <NavbarMock>
          <AvatarKreis />
        </NavbarMock>
      }
    />
  );
}
