"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

/**
 * Vereins-Switcher im Header – bewusste UI-Vorbereitung ohne Funktion.
 *
 * Konzept (21st.dev-Entwurf, Take 1 – "Chevron + Vereinsfamilie-Flyout"):
 * Ein dezenter Chevron-Trigger neben dem Vereinsnamen öffnet ein Flyout mit
 * beiden Vereinen der "Vereinsfamilie". Der FCB ist als aktiv markiert
 * (blaue Akzentkante + Check), die JFG Kunstadt-Obermain ist sichtbar, aber
 * klar als "Bald verfügbar" gekennzeichnet und nicht interaktiv – der echte
 * Wechsel kommt in einer späteren Phase, ohne dass der Header dann erneut
 * umgebaut werden muss.
 *
 * Positionierung: Der Header (motion.header) ist durch seinen Transform der
 * Containing Block für absolute Nachfahren. Auf Mobile nutzt das Panel deshalb
 * die volle Header-Breite (left-4/right-4, unterhalb der 56-px-Leiste), ab sm
 * ankert es klassisch am Trigger (Wrapper wird sm:relative).
 */
export default function VereinsSwitcher() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Outside-Click und Escape schließen das Flyout (Escape gibt den Fokus zurück)
  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="sm:relative">
      {/* Trigger: nur ein Chevron – bewusst leise, der Vereinsname bleibt der Star */}
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        aria-label="Verein wechseln"
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center rounded p-1 text-fcb-muted transition-colors hover:text-fcb-text focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue"
      >
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex"
        >
          <ChevronDown size={16} aria-hidden />
        </motion.span>
      </button>

      {/* Flyout: Vereinsfamilie */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="vereins-flyout"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-4 right-4 top-16 z-50 rounded-2xl border border-fcb-border bg-fcb-surface p-2 shadow-lg sm:left-0 sm:right-auto sm:top-full sm:mt-2 sm:w-80"
          >
            <p className="px-3 pb-1 pt-2 font-oswald text-[11px] font-semibold uppercase tracking-widest text-fcb-muted">
              Vereinsfamilie
            </p>

            {/* FCB – aktiver Verein: blaue Akzentkante + Check */}
            <button
              onClick={() => setOpen(false)}
              className="relative flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-fcb-blue/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue"
            >
              <span
                className="absolute bottom-2.5 left-0 top-2.5 w-[3px] rounded-r bg-fcb-blue"
                aria-hidden
              />
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-fcb-border bg-fcb-bg">
                <Image
                  src="/logo.svg"
                  alt=""
                  width={24}
                  height={24}
                  aria-hidden
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-oswald text-[13px] font-semibold uppercase leading-tight tracking-wide text-fcb-text">
                  1. FC 1911 Burgkunstadt
                </span>
                <span className="mt-0.5 block text-[11px] text-fcb-muted">
                  Hauptverein · seit 1911
                </span>
              </span>
              <Check size={16} className="shrink-0 text-fcb-blue" aria-hidden />
            </button>

            <div className="mx-2 my-1 h-px bg-fcb-border" aria-hidden />

            {/* JFG – noch nicht verfügbar: gedimmt, nicht interaktiv, klare Kennzeichnung */}
            <div
              aria-disabled="true"
              className="flex cursor-not-allowed items-center gap-3 px-3 py-3 opacity-45"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-fcb-border bg-fcb-bg">
                <span className="font-oswald text-[10px] font-bold tracking-wide text-fcb-red">
                  JFG
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-oswald text-[13px] font-semibold uppercase leading-tight tracking-wide text-fcb-text">
                  JFG Kunstadt-Obermain
                </span>
                <span className="mt-1 flex items-center gap-2">
                  <span className="text-[11px] text-fcb-muted">Jugendförderung</span>
                  <span className="rounded-full border border-fcb-border px-2 py-0.5 text-[10px] leading-none text-fcb-muted">
                    Bald verfügbar
                  </span>
                </span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
