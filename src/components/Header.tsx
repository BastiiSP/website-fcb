"use client";

import Link from "next/link";
import Image from "next/image";
import UserDropdown from "@/components/UserDropdown";
import Navigation from "@/components/Navigation";

export default function Header() {
  return (
    <header className="w-full border-b border-gray-300 px-4 py-3 bg-[var(--background)] text-[var(--foreground)] shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo links */}
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.svg" alt="Vereinslogo" width={40} height={40} />
          <span className="text-xl font-semibold hidden sm:inline">
            1. FC 1911 Burgkunstadt
          </span>
        </Link>

        {/* Nav-Links in der Mitte – rollenbasiert, nur für trainer/vorstand/admin */}
        <Navigation />

        {/* Rechte Seite (User Dropdown) */}
        <div className="flex items-center">
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
