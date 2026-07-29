"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { X } from "lucide-react";

type Size = "sm" | "md" | "lg";

// Tailwind-Klassen für die drei Modal-Größen
const SIZES: Record<Size, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

/**
 * Gemeinsame Modal-Hülle (headlessui Dialog → Fokus-Falle, Escape, a11y).
 * Ersetzt die handgebauten Modals in Buchungsformular, Benutzer- und Mitgliederverwaltung.
 * Verwendet die headlessui-v2-API: DialogBackdrop/DialogPanel mit `transition`-Prop +
 * data-[closed]-Varianten statt verschachtelter Transition.Child-Komponenten.
 */
export default function Modal({
  open,
  onClose,
  title,
  size = "md",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: Size;
  children: React.ReactNode;
}) {
  return (
    // z-50 damit das Modal über Navigation und sonstigen Overlays liegt
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* Overlay: data-[closed]:opacity-0 steuert Ein-/Ausblendung via headlessui v2 */}
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 data-[closed]:opacity-0"
      />

      {/* Scroll-Container damit überhohe Inhalte nicht abgeschnitten werden */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          {/* Panel: scale + opacity via data-[closed] für sanften Zoom-Eingang */}
          <DialogPanel
            transition
            className={`w-full ${SIZES[size]} rounded-2xl border border-fcb-border bg-fcb-surface p-6 shadow-xl transition duration-200 data-[closed]:scale-95 data-[closed]:opacity-0`}
          >
            {/* Kopfzeile: optionaler Titel + Schließen-Button */}
            <div className="mb-4 flex items-start justify-between gap-4">
              {title ? (
                <DialogTitle className="font-oswald text-xl font-semibold uppercase tracking-wide text-fcb-text">
                  {title}
                </DialogTitle>
              ) : (
                // Leeres Element hält den Schließen-Button rechtsbündig
                <span />
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Schließen"
                className="rounded p-1 text-fcb-muted transition-colors hover:text-fcb-text focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent"
              >
                <X size={20} />
              </button>
            </div>

            {children}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
