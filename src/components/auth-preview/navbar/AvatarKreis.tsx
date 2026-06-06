/**
 * Eingeloggter Navbar-Trigger: Initialen-Kreis (Avatar-Platzhalter).
 * In allen drei Varianten gleich – der Unterschied liegt im ausgeloggten Zustand.
 */
export default function AvatarKreis() {
  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-full bg-fcb-blue font-inter text-sm font-bold text-white"
      role="img"
      aria-label="Avatar-Platzhalter"
    >
      MM
    </div>
  );
}
