"use client";

import { useState } from "react";
import { getVariant } from "@/components/auth-preview/_shared/variants";
import type { AuthScreen } from "@/components/auth-preview/_shared/types";

const SCREENS: { key: AuthScreen; label: string }[] = [
  { key: "login", label: "Login" },
  { key: "register", label: "Registrieren" },
  { key: "confirm", label: "Bestätigung" },
];

export default function AuthPreviewStage({ variantSlug }: { variantSlug: string }) {
  const [screen, setScreen] = useState<AuthScreen>("login");
  const variant = getVariant(variantSlug);
  if (!variant) return null;
  const Variant = variant.Component;

  return (
    <div className="flex flex-1 flex-col">
      {/* Screen-Umschalter (nur Vorschau-Werkzeug, nicht Teil des Variantendesigns) */}
      <div className="flex justify-center border-b border-fcb-border bg-fcb-bg/70 px-4 py-2">
        <div className="flex gap-1 rounded-full border border-fcb-border p-1">
          {SCREENS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setScreen(s.key)}
              className={[
                "rounded-full px-3 py-1 font-inter text-xs font-medium transition-colors",
                screen === s.key
                  ? "bg-fcb-surface text-fcb-text"
                  : "text-fcb-muted hover:text-fcb-text",
              ].join(" ")}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1">
        <Variant screen={screen} onNavigate={setScreen} />
      </div>
    </div>
  );
}
