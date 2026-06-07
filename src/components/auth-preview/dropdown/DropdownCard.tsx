import Image from "next/image";
import { LogIn, LogOut, User, UserPlus } from "lucide-react";
import DropdownShell from "./DropdownShell";
import DropdownStage from "./DropdownStage";
import { DUMMY_USER } from "./dummyUser";

/**
 * Variante C – Card-Style: Vereinswappen oben, Login & Registrieren mit kurzem
 * Beschreibungstext – wirkt wie eine Mini-Welcome-Card.
 * Eingeloggt: Avatar prominent, darunter Name + Aktionen.
 */
export default function DropdownCard() {
  return (
    <DropdownStage
      beschreibung={`Variante C – Card-Style: Wappen oben, Login & Registrieren mit kurzem Beschreibungstext – wie eine Mini-Welcome-Card.`}
      ausgeloggt={
        <DropdownShell className="w-72">
          {/* Kopf: Wappen + Vereinsname, zentriert */}
          <div className="flex flex-col items-center gap-2 px-4 pb-3 pt-5 text-center">
            <Image src="/logo.svg" alt="FCB Wappen" width={48} height={48} />
            <p className="font-oswald text-base font-semibold uppercase tracking-wide text-fcb-text">
              1. FC 1911 Burgkunstadt
            </p>
          </div>
          {/* Aktionen mit Beschreibungstext */}
          <div className="space-y-1 p-2">
            <div className="rounded-md bg-fcb-blue px-3 py-2">
              <p className="flex items-center gap-2 font-inter text-sm font-medium text-white">
                <LogIn className="h-4 w-4" />
                Login
              </p>
              <p className="mt-0.5 pl-6 font-inter text-xs text-white/70">
                Mit deinem Konto anmelden
              </p>
            </div>
            <div className="rounded-md border border-fcb-border px-3 py-2">
              <p className="flex items-center gap-2 font-inter text-sm text-fcb-text">
                <UserPlus className="h-4 w-4 text-fcb-muted" />
                Registrieren
              </p>
              <p className="mt-0.5 pl-6 font-inter text-xs text-fcb-muted">
                Neu hier? Konto erstellen
              </p>
            </div>
          </div>
        </DropdownShell>
      }
      eingeloggt={
        <DropdownShell className="w-72">
          {/* Kopf: Avatar prominent + Name/E-Mail, zentriert */}
          <div className="flex flex-col items-center gap-2 px-4 pb-3 pt-5 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-fcb-blue font-inter text-lg font-bold text-white">
              {DUMMY_USER.initials}
            </div>
            <div>
              <p className="font-inter text-sm font-semibold text-fcb-text">
                {DUMMY_USER.name}
              </p>
              <p className="font-inter text-xs text-fcb-muted">
                {DUMMY_USER.email}
              </p>
            </div>
          </div>
          {/* Aktionen */}
          <div className="border-t border-fcb-border p-1">
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
