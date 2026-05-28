"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import MockUserAvatar from "./MockUserAvatar";

/**
 * Smart-sticky Navbar für alle Design-Varianten.
 * - Verschwindet beim Scrollen nach unten (delta > 0, scrollY > 80)
 * - Erscheint beim Scrollen nach oben (delta < 0)
 * - Hintergrund: zinc-600 mit backdrop-blur
 *
 * Die Nav-Links sind reine Dummy-Anchors für die Design-Exploration –
 * keine echte Navigation, da nur das Hero-Design verglichen wird.
 */
const NAV_LINKS = [
  { label: "Verein", href: "#verein" },
  { label: "Mannschaften", href: "#mannschaften" },
  { label: "News", href: "#news" },
  { label: "Kontakt", href: "#kontakt" },
];

export default function VariantsNavbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [lastY, setLastY] = useState(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const delta = latest - lastY;
    // Schwelle: erst ab 80 px Scroll überhaupt verstecken, damit ein
    // kleiner Bounce am Top kein Flackern verursacht.
    if (latest > 80 && delta > 5) {
      setHidden(true);
    } else if (delta < -5) {
      setHidden(false);
    }
    setLastY(latest);
  });

  return (
    <motion.nav
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      // sticky unter dem VariantSwitcher (top-9 ≈ Höhe der Switcher-Bar)
      className="sticky top-9 z-[90] w-full border-b border-white/10 bg-zinc-600/85 backdrop-blur-md"
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo + Vereinsname links */}
        <Link href="/variants/1" className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="Vereinslogo"
            width={36}
            height={36}
            className="drop-shadow-lg"
          />
          <span className="hidden font-oswald text-lg font-semibold uppercase tracking-wide text-white sm:inline">
            1. FC 1911 Burgkunstadt
          </span>
          <span className="font-oswald text-lg font-semibold uppercase tracking-wide text-white sm:hidden">
            FCB
          </span>
        </Link>

        {/* Nav-Links mittig */}
        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-inter text-sm font-medium text-white/85 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Avatar-Platzhalter rechts */}
        <MockUserAvatar />
      </div>
    </motion.nav>
  );
}
