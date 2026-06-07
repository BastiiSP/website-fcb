"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import Link from "next/link";
import { Menu } from "@headlessui/react";
import { LogOut, User, UserPlus } from "lucide-react";

interface UserData {
  email: string;
  vorname: string | null;
  nachname: string | null;
  avatar_url: string | null;
}

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
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        // Profilinformationen setzen – avatar_url aus profiles, E-Mail aus Auth-User
        setUser({
          email: user.email ?? "",
          vorname: profile?.vorname ?? "",
          nachname: profile?.nachname ?? "",
          avatar_url: profile?.avatar_url ?? null,
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
  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-full border border-white/40 bg-transparent px-2.5 py-1 font-inter text-xs font-medium text-white transition-colors hover:border-white/70 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue focus-visible:ring-offset-2 focus-visible:ring-offset-fcb-nav md:px-3 md:py-1.5 md:text-sm"
        >
          Anmelden
        </Link>
        <Link
          href="/registrieren"
          className="flex items-center gap-1.5 rounded-full border border-fcb-blue bg-fcb-blue px-2.5 py-1 font-inter text-xs font-medium text-white transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue focus-visible:ring-offset-2 focus-visible:ring-offset-fcb-nav md:px-3 md:py-1.5 md:text-sm"
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
      <Menu.Button className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-fcb-blue font-bold text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue focus-visible:ring-offset-2 focus-visible:ring-offset-fcb-nav">
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
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-fcb-blue font-inter text-lg font-bold text-white">
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
