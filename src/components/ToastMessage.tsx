"use client";

// 🧾 Typdefinition für Toast-Komponente
type ToastProps = {
  message: string; // 🔤 Der anzuzeigende Text im Toast
  type: "success" | "error"; // ✅ Erfolgs- oder ❌ Fehlertyp
  onClose: () => void; // 🔁 Funktion zum Schließen
};

// 🚀 Hauptkomponente für visuelle Feedback-Nachrichten (Toast)
export default function ToastMessage({ message, type, onClose }: ToastProps) {
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
      <div
        className={`relative ${boxColor} ${textColor} px-6 py-3 rounded shadow-lg toast-animate`}
      >
        {/* 📝 Nachrichtentext */}
        {message}

        {/* ❌ Schließen-Button (oben rechts) – explizite Farbe statt Vererbung */}
        <button
          onClick={onClose}
          className={`absolute top-1 right-3 ${textColor} ${hoverColor} text-xl font-bold`}
          aria-label="Toast schließen"
        >
          ×
        </button>
      </div>
    </div>
  );
}
