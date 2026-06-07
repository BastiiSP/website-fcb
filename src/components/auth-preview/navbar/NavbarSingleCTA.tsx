import { LogIn } from "lucide-react";
import NavbarMock from "./NavbarMock";
import AvatarKreis from "./AvatarKreis";
import PreviewStage from "./PreviewStage";

/**
 * Variante A – Single CTA: ein gefüllter blauer Pill-Button „Anmelden".
 * Der Klick würde das Dropdown öffnen (siehe /dropdown-preview).
 */
export default function NavbarSingleCTA() {
  return (
    <PreviewStage
      beschreibung={`Variante A – Single CTA: Ein gefüllter blauer Pill-Button „Anmelden". Ein klarer Einstieg; der Klick öffnet das Dropdown (siehe /dropdown-preview).`}
      ausgeloggt={
        <NavbarMock>
          {/* Rein visueller Mock – span statt button (kein echter Klick nötig) */}
          <span className="flex cursor-default items-center gap-1.5 rounded-full border border-fcb-blue bg-fcb-blue px-3 py-1.5 font-inter text-sm font-medium text-white">
            <LogIn className="h-4 w-4" />
            <span>Anmelden</span>
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
