"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// 🧾 Typdefinition für Toast-Komponente
type ToastProps = {
  message: string; // 🔤 Der anzuzeigende Text im Toast
  type: "success" | "error"; // ✅ Erfolgs- oder ❌ Fehlertyp
  onClose: () => void; // 🔁 Funktion zum Schließen
};

// Anzeigedauer vor dem automatischen Ausblenden: Erfolgsmeldungen sind schnell
// erfasst, Fehler brauchen mehr Lesezeit (übliche Toast-Konvention 4–6 s).
const ANZEIGE_DAUER_MS: Record<ToastProps["type"], number> = {
  success: 4000,
  error: 6000,
};

// Dauer der Ausblend-Animation – muss zur CSS-Transition unten passen
const AUSBLENDEN_MS = 300;

// 🚀 Hauptkomponente für visuelle Feedback-Nachrichten (Toast)
export default function ToastMessage({ message, type, onClose }: ToastProps) {
  // Steuert das Ausblenden: erst Opacity-Fade, dann onClose (unmount)
  const [sichtbar, setSichtbar] = useState(true);

  // onClose in einem Ref halten: Eltern übergeben meist Inline-Arrow-Funktionen,
  // deren Identität sich bei jedem Render ändert – ohne Ref würde der
  // Auto-Dismiss-Timer bei jedem Eltern-Render neu starten.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const timerRef = useRef<number | null>(null);

  const ausblenden = useCallback(() => {
    setSichtbar(false);
    window.setTimeout(() => onCloseRef.current(), AUSBLENDEN_MS);
  }, []);

  const stoppeTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const starteTimer = useCallback(() => {
    stoppeTimer();
    timerRef.current = window.setTimeout(ausblenden, ANZEIGE_DAUER_MS[type]);
  }, [ausblenden, stoppeTimer, type]);

  // Auto-Dismiss beim Einblenden starten, beim Unmount aufräumen
  useEffect(() => {
    starteTimer();
    return stoppeTimer;
  }, [starteTimer, stoppeTimer]);

  // Tinted Banner-Stil: halbdurchsichtiger Hintergrund + farbige Umrandung.
  // Textfarbe mit dark:-Split, damit der Text auf dem hellen /10-Tint im
  // Light-Theme ausreichend Kontrast hat (Erfolg: dunkleres Grün im Light).
  const boxColor =
    type === "success"
      ? "bg-green-500/10 border border-green-500/40"
      : "bg-fcb-red/10 border border-fcb-red/40";
  const textColor =
    type === "success" ? "text-green-700 dark:text-green-300" : "text-fcb-red";
  // Schließen-Button: explizite Ruhefarbe (= Textton) statt impliziter Vererbung.
  const hoverColor =
    type === "success"
      ? "hover:text-green-900 dark:hover:text-green-100"
      : "hover:opacity-70";

  return (
    // 📦 Positionierung oben mittig auf der Seite, mobilfreundlich
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      {/* Hover pausiert den Auto-Dismiss (Standard-Verhalten, gibt Lesezeit) */}
      <div
        onMouseEnter={stoppeTimer}
        onMouseLeave={starteTimer}
        className={`relative ${boxColor} ${textColor} px-6 py-3 rounded shadow-lg toast-animate transition-opacity duration-300 ${
          sichtbar ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* 📝 Nachrichtentext */}
        {message}

        {/* ❌ Schließen-Button (oben rechts) – explizite Farbe statt Vererbung */}
        <button
          onClick={ausblenden}
          className={`absolute top-1 right-3 ${textColor} ${hoverColor} text-xl font-bold`}
          aria-label="Toast schließen"
        >
          ×
        </button>
      </div>
    </div>
  );
}
