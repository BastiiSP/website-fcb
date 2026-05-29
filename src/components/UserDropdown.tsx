"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu } from "@headlessui/react";
import { FiUser } from "react-icons/fi";

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
      <Menu.Button className="flex items-center justify-center w-10 h-10 rounded-full bg-fcb-blue text-white font-bold overflow-hidden">
        {isLoggedIn ? (
          user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt="Profilbild"
              className="w-10 h-10 object-cover rounded-full"
            />
          ) : (
            <span className="text-sm text-white">
              {getInitials()}
            </span>
          )
        ) : (
          <FiUser className="w-5 h-5" />
        )}
      </Menu.Button>

      <Menu.Items className="absolute right-0 mt-2 w-52 origin-top-right rounded-md bg-fcb-surface text-fcb-text border border-fcb-border shadow-lg focus:outline-none z-[9999] px-2 pb-2">
        {isLoggedIn ? (
          <>
            <div className="px-2 pt-2 text-sm font-medium mb-1">
              Hallo {user?.vorname?.trim() ? user.vorname : "Nutzer"}
            </div>
            <div className="px-2 text-xs text-fcb-muted mb-2">
              {user?.email ?? ""}
            </div>
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/profil"
                  className={`mt-1 px-4 py-2 w-full text-sm text-center rounded border block transition ${
                    active
                      ? "bg-fcb-border border-fcb-border"
                      : "bg-transparent border-fcb-border hover:bg-fcb-border"
                  }`}
                >
                  Profil bearbeiten
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleLogout}
                  className={`mt-2 px-4 py-2 w-full font-bold text-sm text-center rounded border transition ${
                    active
                      ? "bg-red-700 border-red-800"
                      : "bg-red-600 hover:bg-red-700 border-red-700"
                  } text-white`}
                >
                  Logout
                </button>
              )}
            </Menu.Item>
          </>
        ) : (
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => router.push("/login")}
                className={`mt-3 px-4 py-2 w-full font-bold text-sm text-center rounded border transition ${
                  active
                    ? "bg-fcb-blue/80 border-fcb-blue"
                    : "bg-fcb-blue hover:bg-fcb-blue/80 border-fcb-blue"
                } text-white`}
              >
                Login
              </button>
            )}
          </Menu.Item>
        )}
      </Menu.Items>
    </Menu>
  );
}
