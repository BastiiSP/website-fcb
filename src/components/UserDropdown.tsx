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
      <Menu.Button className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--foreground)] text-[var(--background)] font-bold overflow-hidden">
        {isLoggedIn ? (
          user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt="Profilbild"
              className="w-10 h-10 object-cover rounded-full"
            />
          ) : (
            <span className="text-sm text-[var(--background)]">
              {getInitials()}
            </span>
          )
        ) : (
          <FiUser className="w-5 h-5" />
        )}
      </Menu.Button>

      <Menu.Items className="absolute right-0 mt-2 w-52 origin-top-right rounded-md bg-[var(--background)] text-[var(--foreground)] shadow-md ring-1 ring-black ring-opacity-5 focus:outline-none z-[9999] px-2 pb-2">
        {isLoggedIn ? (
          <>
            <div className="px-2 pt-2 text-sm mb-2">
              👋 Hallo {user?.vorname?.trim() ? user.vorname : "Nutzer"}
            </div>
            <div className="px-2 text-sm mb-1">
              E-Mail: {user?.email ?? "Unbekannt"}
            </div>
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/profil"
                  className={`mt-2 px-4 py-2 w-full text-sm text-center rounded border block ${
                    active
                      ? "bg-gray-200 border-gray-300 dark:bg-gray-700"
                      : "bg-transparent border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  } transition`}
                >
                  Profil bearbeiten
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleLogout}
                  className={`mt-2 px-4 py-2 w-full font-bold text-sm text-center rounded border ${
                    active
                      ? "bg-red-700 border-red-800"
                      : "bg-red-600 hover:bg-red-700 border-red-700"
                  } text-white transition`}
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
                className={`mt-3 px-4 py-2 w-full font-bold text-sm text-center rounded border ${
                  active
                    ? "bg-green-700 border-green-800"
                    : "bg-green-600 hover:bg-green-700 border-green-700"
                } text-white transition`}
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
