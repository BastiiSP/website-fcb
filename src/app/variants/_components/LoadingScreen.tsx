"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

/**
 * Vollbild-Intro mit FCB-Wappen. Zeigt sich nur einmal pro Browser-Session
 * (gesteuert via sessionStorage), damit beim Vergleichen der Varianten
 * V1 → V2 → V3 → V4 nicht jedes Mal 1,5 s Wartezeit anfällt.
 *
 * Wichtig: Wir setzen den Storage-Flag *vor* dem Fade-Out, damit ein schneller
 * Wechsel der Route nicht doppelt einen LoadingScreen triggert.
 */
const STORAGE_KEY = "fcb-variants-loaded";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Direkt nach Mount prüfen: Wenn die aktuelle Session den Loader schon
    // einmal gesehen hat, sofort ausblenden – kein Flash beim Variants-Wechsel.
    if (typeof window !== "undefined" && sessionStorage.getItem(STORAGE_KEY)) {
      setVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // SessionStorage kann in seltenen Fällen (Private Mode, Quota) fehlschlagen.
        // Wir ignorieren das – der Loader läuft dann halt erneut, kein Datenverlust.
      }
      setVisible(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          // Über allem (Switcher, Navbar) liegen, ohne Interaktion zu blocken
          // sobald das Fade-Out läuft.
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Subtiler Puls auf dem Wappen, damit es nicht statisch wirkt. */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative"
          >
            {/* Blauer Glow im Hintergrund des Wappens. */}
            <div
              aria-hidden
              className="absolute inset-0 -z-10 blur-2xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(29,95,173,0.5) 0%, rgba(29,95,173,0) 70%)",
              }}
            />
            <Image
              src="/logo.svg"
              alt="1. FC 1911 Burgkunstadt"
              width={140}
              height={140}
              priority
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
