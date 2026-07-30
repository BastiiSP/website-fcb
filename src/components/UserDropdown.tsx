"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import Link from "next/link";
import { Menu } from "@headlessui/react";
import {
  CalendarDays,
  ClipboardList,
  Home,
  LogOut,
  Shield,
  User,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

interface UserData {
  email: string;
  vorname: string | null;
  nachname: string | null;
  avatar_url: string | null;
  rolle: string | null;
}

interface RollenLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

// Rollenbasierte Links leben im Account-Menü statt in der Hauptnav – die Hauptnav
// zeigt nur noch öffentliche Seiten. "Platzbuchung" hieß früher "Kalender" (umbenannt,
// weil eindeutiger). "Profil" braucht keinen Eintrag hier: "Profil bearbeiten" steht
// fest im unteren Menü-Abschnitt.
//
// Bewusst KEINE Rollen-Filterung mehr: jeder eingeloggte Nutzer sieht alle Bereiche,
// auch mit Rolle "ausstehend" – reicht die Rolle für einen Bereich nicht aus, erklärt
// die Zielseite selbst per ZugriffsHinweis warum (statt den Link im Menü zu verstecken).
const ALLE_LINKS: RollenLink[] = [
  { href: "/platzbuchung", label: "Platzbuchung", icon: CalendarDays },
  { href: "/meine-buchungen", label: "Meine Buchungen", icon: ClipboardList },
  { href: "/mitglieder", label: "Mitglieder", icon: Users },
  { href: "/vorstandsbereich", label: "Vorstandsbereich", icon: Shield },
  { href: "/mein-verein", label: "Mein Verein", icon: Home },
];

export default function UserDropdown() {
  const supabase = createClient();

  const [user, setUser] = useState<UserData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      // getUser() statt getSession(): validiert Token serverseitig → liefert
      // immer aktuelle E-Mail, auch nach einer bestätigten E-Mail-Änderung.
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error(
            "Fehler beim Laden des Profils im Nutzer-Menü:",
            profileError.message
          );
        }

        // Profilinformationen setzen – avatar_url aus profiles, E-Mail aus Auth-User
        // (auch bei Fehler: rendert mit den verfügbaren, ggf. leeren Profildaten weiter)
        setUser({
          email: user.email ?? "",
          vorname: profile?.vorname ?? "",
          nachname: profile?.nachname ?? "",
          avatar_url: profile?.avatar_url ?? null,
          rolle: profile?.rolle ?? null,
        });
        setIsLoggedIn(true);
      }
    };

    fetchUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Reagiert auf Profilbild-Uploads von der Profilseite, ohne Seiten-Reload.
    // Die Profilseite dispatcht "avatar-aktualisiert" nach erfolgreichem Upload.
    const handleAvatarAktualisiert = (e: Event) => {
      const neueUrl = (e as CustomEvent<string>).detail;
      setUser((prev) => (prev ? { ...prev, avatar_url: neueUrl } : prev));
    };

    window.addEventListener("avatar-aktualisiert", handleAvatarAktualisiert);
    return () => {
      window.removeEventListener("avatar-aktualisiert", handleAvatarAktualisiert);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const getInitials = () => {
    const vor = user?.vorname?.charAt(0) ?? "";
    const nach = user?.nachname?.charAt(0) ?? "";
    return `${vor}${nach}`.toUpperCase();
  };

  // Ausgeloggt → Split-Variante: zwei eigenständige Buttons direkt in der Navbar,
  // kein Dropdown. „Anmelden" als Outline (weniger dominant), „Registrieren" gefüllt.
  //
  // Unter `sm` (< 640 px) zeigt der Header nur „Anmelden": Beide Buttons zusammen
  // belegten dort so viel Breite, dass die linke Header-Gruppe zerdrückt wurde und
  // der Vereins-Switcher nicht mehr klickbar war (Live-Fund 2026-07-30, Details im
  // Kommentar in Header.tsx). Die Registrierung bleibt einen Tap entfernt – die
  // Login-Seite verlinkt sie unten selbst („Noch kein Konto?").
  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-full border border-fcb-text/40 bg-transparent px-2.5 py-1 font-inter text-xs font-medium text-fcb-text transition-colors hover:border-fcb-text/70 hover:bg-fcb-text/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent focus-visible:ring-offset-2 focus-visible:ring-offset-fcb-surface md:px-3 md:py-1.5 md:text-sm"
        >
          Anmelden
        </Link>
        {/* text-white bewusst: steht auf konstantem fcb-accent, in beiden Themes korrekt */}
        <Link
          href="/registrieren"
          className="hidden items-center gap-1.5 rounded-full border border-fcb-accent bg-fcb-accent px-2.5 py-1 font-inter text-xs font-medium text-white transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent focus-visible:ring-offset-2 focus-visible:ring-offset-fcb-surface sm:flex md:px-3 md:py-1.5 md:text-sm"
        >
          <UserPlus className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span>Registrieren</span>
        </Link>
      </div>
    );
  }

  // Eingeloggt → Avatar-Trigger öffnet das Card-Style-Dropdown.
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-fcb-accent font-bold text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent focus-visible:ring-offset-2 focus-visible:ring-offset-fcb-surface">
        {user?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatar_url}
            alt={`Profilbild${user.vorname ? ` von ${user.vorname}` : ""}`}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <span className="text-sm text-white">{getInitials()}</span>
        )}
      </Menu.Button>

      {/* Card-Style-Dropdown: Avatar prominent oben, darunter Aktionen */}
      <Menu.Items className="absolute right-0 z-[9999] mt-2 w-72 origin-top-right overflow-hidden rounded-lg border border-fcb-border bg-fcb-surface text-fcb-text shadow-lg focus:outline-none">
        {/* Kopf: Avatar + Name/E-Mail, zentriert */}
        <div className="flex flex-col items-center gap-2 px-4 pb-3 pt-5 text-center">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-fcb-accent font-inter text-lg font-bold text-white">
            {user?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url}
                alt={`Profilbild${user.vorname ? ` von ${user.vorname}` : ""}`}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              getInitials()
            )}
          </div>
          <div>
            <p className="font-inter text-sm font-semibold text-fcb-text">
              {user?.vorname?.trim() ? user.vorname : "Nutzer"}
            </p>
            <p className="truncate font-inter text-xs text-fcb-muted">
              {user?.email ?? ""}
            </p>
          </div>
        </div>

        {/* Rollenbasierte Bereiche – kamen früher aus der Hauptnav (Navigation.tsx) */}
        <div className="border-t border-fcb-border p-1">
          {ALLE_LINKS.map(({ href, label, icon: Icon }) => (
            <Menu.Item key={href}>
              {({ active }) => (
                <Link
                  href={href}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 font-inter text-sm transition-colors ${
                    active ? "bg-fcb-border text-fcb-text" : "text-fcb-text"
                  }`}
                >
                  <Icon className="h-4 w-4 text-fcb-muted" aria-hidden />
                  {label}
                </Link>
              )}
            </Menu.Item>
          ))}
        </div>

        {/* Aktionen */}
        <div className="border-t border-fcb-border p-1">
          <Menu.Item>
            {({ active }) => (
              <Link
                href="/profil"
                className={`flex items-center gap-2 rounded-md px-3 py-2 font-inter text-sm transition-colors ${
                  active ? "bg-fcb-border text-fcb-text" : "text-fcb-text"
                }`}
              >
                <User className="h-4 w-4 text-fcb-muted" />
                Profil bearbeiten
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={handleLogout}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 font-inter text-sm font-medium text-fcb-red transition-colors ${
                  active ? "bg-fcb-red/10" : ""
                }`}
              >
                <LogOut className="h-4 w-4" />
                Abmelden
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
}
