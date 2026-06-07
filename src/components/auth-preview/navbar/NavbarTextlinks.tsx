import NavbarMock from "./NavbarMock";
import AvatarKreis from "./AvatarKreis";
import PreviewStage from "./PreviewStage";

/**
 * Variante C – Textlinks: zwei dezente Textlinks mit Trennzeichen.
 * Minimal, kein Button-Styling.
 */
export default function NavbarTextlinks() {
  return (
    <PreviewStage
      beschreibung={`Variante C – Textlinks: Zwei dezente Textlinks „Anmelden · Registrieren“. Sehr minimal, kein Button-Styling.`}
      ausgeloggt={
        <NavbarMock>
          <div className="flex items-center gap-2 font-inter text-sm text-white/90">
            <span className="cursor-default">Anmelden</span>
            <span aria-hidden className="text-white/40">
              ·
            </span>
            <span className="cursor-default">Registrieren</span>
          </div>
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
