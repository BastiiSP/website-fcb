"use client";

import { useId } from "react";

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  optional?: boolean;
  error?: string;
  /** Maximale Zeichenanzahl – wird direkt ans input-Element weitergegeben */
  maxLength?: number;
}

export default function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  autoComplete,
  optional,
  error,
  maxLength,
}: TextFieldProps) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted"
      >
        {label}
        {optional && <span className="ml-1 normal-case tracking-normal">(optional)</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        maxLength={maxLength}
        className={`w-full rounded-lg border bg-fcb-bg px-3 py-2.5 font-inter text-sm text-fcb-text placeholder:text-fcb-muted/60 transition-colors focus:outline-none focus-visible:ring-2 ${
          error
            ? "border-fcb-red focus:border-fcb-red focus-visible:ring-fcb-red/40"
            : "border-fcb-border focus:border-fcb-accent focus-visible:ring-fcb-accent/40"
        }`}
      />
      {error && <p className="font-inter text-xs text-fcb-red">{error}</p>}
    </div>
  );
}
