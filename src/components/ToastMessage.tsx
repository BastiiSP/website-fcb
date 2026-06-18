"use client";

// 🧾 Typdefinition für Toast-Komponente
type ToastProps = {
  message: string; // 🔤 Der anzuzeigende Text im Toast
  type: "success" | "error"; // ✅ Erfolgs- oder ❌ Fehlertyp
  onClose: () => void; // 🔁 Funktion zum Schließen
};

// 🚀 Hauptkomponente für visuelle Feedback-Nachrichten (Toast)
export default function ToastMessage({ message, type, onClose }: ToastProps) {
  // Tinted Banner-Stil: halbdurchsichtiger Hintergrund + farbige Umrandung – funktioniert in beiden Themes
  const bgColor =
    type === "success"
      ? "bg-green-500/10 border border-green-500/40 text-green-400"
      : "bg-fcb-red/10 border border-fcb-red/40 text-fcb-red";
  // Hover-Farbe für den Schließen-Button (etwas heller als der Textton)
  const hoverColor =
    type === "success" ? "hover:text-green-300" : "hover:text-red-300";

  return (
    // 📦 Positionierung oben mittig auf der Seite, mobilfreundlich
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div
        className={`relative ${bgColor} px-6 py-3 rounded shadow-lg toast-animate`}
      >
        {/* 📝 Nachrichtentext */}
        {message}

        {/* ❌ Schließen-Button (oben rechts) */}
        <button
          onClick={onClose}
          className={`absolute top-1 right-3 ${hoverColor} text-xl font-bold`}
          aria-label="Toast schließen"
        >
          ×
        </button>
      </div>
    </div>
  );
}
