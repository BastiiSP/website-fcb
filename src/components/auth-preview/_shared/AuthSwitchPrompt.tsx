"use client";

import type { AuthScreen } from "./types";

interface AuthSwitchPromptProps {
  frage: string;
  aktion: string;
  ziel: AuthScreen;
  onNavigate: (screen: AuthScreen) => void;
}

export default function AuthSwitchPrompt({ frage, aktion, ziel, onNavigate }: AuthSwitchPromptProps) {
  return (
    <p className="text-center font-inter text-sm text-fcb-muted">
      {frage}{" "}
      <button
        type="button"
        onClick={() => onNavigate(ziel)}
        className="font-medium text-fcb-blue underline-offset-2 transition-colors hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue"
      >
        {aktion}
      </button>
    </p>
  );
}
