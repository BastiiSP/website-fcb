"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu } from "@headlessui/react";
import { LogIn, LogOut, User, UserPlus } from "lucide-react";

interface UserData {
  email: string;
  vorname: string | null;
  nachname: string | null;
  avatar_url: string | null;
}

export default function UserDropdown() {
  const supabase = createClient();
  const router = useRouter();

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

  return (
    <Menu as="div" className="relative inline-block text-left">
      {/* Trigger: eingeloggt → Avatar-Kreis, ausgeloggt → einladender „Anmelden"-Button */}
      {isLoggedIn ? (
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
      ) : (
        <Menu.Button className="flex items-center gap-1.5 rounded-full border border-fcb-blue bg-fcb-blue px-3 py-1.5 font-inter text-sm font-medium text-white transition-colors hover:bg-fcb-blue/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue focus-visible:ring-offset-2 focus-visible:ring-offset-fcb-nav">
          <LogIn className="h-4 w-4" />
          <span>Anmelden</span>
        </Menu.Button>
      )}

      <Menu.Items className="absolute right-0 z-[9999] mt-2 w-56 origin-top-right overflow-hidden rounded-lg border border-fcb-border bg-fcb-surface text-fcb-text shadow-lg focus:outline-none">
        {isLoggedIn ? (
          <>
            {/* Kopf: Name + E-Mail klar abgesetzt */}
            <div className="border-b border-fcb-border px-4 py-3">
              <p className="font-inter text-sm font-semibold text-fcb-text">
                {user?.vorname?.trim() ? user.vorname : "Nutzer"}
              </p>
              <p className="truncate font-inter text-xs text-fcb-muted">
                {user?.email ?? ""}
              </p>
            </div>

            {/* Aktionen */}
            <div className="p-1">
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
          </>
        ) : (
          <>
            {/* Kopf: einladender Hinweis für Besucher */}
            <div className="border-b border-fcb-border px-4 py-3">
              <p className="font-inter text-sm font-semibold text-fcb-text">
                Willkommen beim FCB
              </p>
              <p className="font-inter text-xs text-fcb-muted">
                Melde dich an oder registriere dich.
              </p>
            </div>

            {/* Login-Pfad */}
            <div className="p-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => router.push("/login")}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 font-inter text-sm font-medium text-white transition-colors ${
                      active ? "bg-fcb-blue/90" : "bg-fcb-blue"
                    }`}
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </button>
                )}
              </Menu.Item>
            </div>

            {/* Registrieren-Pfad – optisch vom Login getrennt */}
            <div className="border-t border-fcb-border p-1">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href="/registrieren"
                    className={`flex items-center gap-2 rounded-md px-3 py-2 font-inter text-sm transition-colors ${
                      active ? "bg-fcb-border text-fcb-text" : "text-fcb-text"
                    }`}
                  >
                    <UserPlus className="h-4 w-4 text-fcb-muted" />
                    Noch kein Konto? Registrieren
                  </Link>
                )}
              </Menu.Item>
            </div>
          </>
        )}
      </Menu.Items>
    </Menu>
  );
}
