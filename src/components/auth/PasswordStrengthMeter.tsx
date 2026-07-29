"use client";

import { Check, X } from "lucide-react";
import {
  passwortStaerkeLabel,
  type PasswortFeedback,
} from "@/utils/passwortStaerke";

interface PasswordStrengthMeterProps {
  feedback: PasswortFeedback;
  staerke: number;
}

const KRITERIEN: { key: keyof PasswortFeedback; label: string }[] = [
  { key: "hasLower", label: "Kleinbuchstaben" },
  { key: "hasUpper", label: "Großbuchstaben" },
  { key: "hasNumber", label: "Zahl" },
  { key: "hasSymbol", label: "Sonderzeichen" },
  { key: "hasMinLength", label: "Mind. 8 Zeichen" },
];

// fcb-konforme Balkenbreite/-farbe (ersetzt die gray/red/yellow-Variante aus utils).
function balken(staerke: number): { breite: string; farbe: string } {
  if (staerke <= 2) return { breite: "w-1/5", farbe: "bg-fcb-red" };
  if (staerke === 3) return { breite: "w-3/5", farbe: "bg-yellow-500" };
  if (staerke === 4) return { breite: "w-4/5", farbe: "bg-fcb-accent" };
  return { breite: "w-full", farbe: "bg-green-500" };
}

export default function PasswordStrengthMeter({ feedback, staerke }: PasswordStrengthMeterProps) {
  const { breite, farbe } = balken(staerke);
  return (
    <div className="space-y-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-fcb-border">
        <div className={`h-full rounded-full transition-all duration-300 ${farbe} ${breite}`} />
      </div>
      <p className="font-inter text-xs text-fcb-muted">{passwortStaerkeLabel(staerke)}</p>
      <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {KRITERIEN.map(({ key, label }) => {
          const erfuellt = feedback[key];
          return (
            <li key={key} className="flex items-center gap-1.5 font-inter text-xs">
              {erfuellt ? (
                <Check size={14} className="text-green-500" />
              ) : (
                <X size={14} className="text-fcb-muted" />
              )}
              <span className={erfuellt ? "text-fcb-text" : "text-fcb-muted"}>{label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
