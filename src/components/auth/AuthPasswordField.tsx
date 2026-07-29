"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface AuthPasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
}

export default function AuthPasswordField({
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
}: AuthPasswordFieldProps) {
  const id = useId();
  const [sichtbar, setSichtbar] = useState(false);
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={sichtbar ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full rounded-lg border border-fcb-border bg-fcb-bg px-3 py-2.5 pr-11 font-inter text-sm text-fcb-text placeholder:text-fcb-muted/60 transition-colors focus:border-fcb-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent/40"
        />
        <button
          type="button"
          onClick={() => setSichtbar((v) => !v)}
          aria-label={sichtbar ? "Passwort verbergen" : "Passwort anzeigen"}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-fcb-muted transition-colors hover:text-fcb-text focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent"
        >
          {sichtbar ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
