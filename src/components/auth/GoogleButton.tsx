"use client";

import { GoogleIcon } from "@/components/icons/BrandIcons";

interface GoogleButtonProps {
  onClick: () => void;
  /** "login" | "register" – steuert nur den Beschriftungstext. */
  modus?: "login" | "register";
}

export default function GoogleButton({ onClick, modus = "login" }: GoogleButtonProps) {
  const text = modus === "register" ? "Mit Google registrieren" : "Mit Google anmelden";
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-fcb-border bg-fcb-surface px-4 py-3 font-inter text-sm font-medium text-fcb-text transition-colors hover:border-fcb-muted hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent"
    >
      <GoogleIcon className="h-5 w-5" />
      {text}
    </button>
  );
}
