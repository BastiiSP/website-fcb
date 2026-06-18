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
        className={`w-full rounded-lg border bg-fcb-bg px-3 py-2.5 font-inter text-sm text-fcb-text placeholder:text-fcb-muted/60 transition-colors focus:outline-none focus-visible:ring-2 ${
          error
            ? "border-fcb-red focus:border-fcb-red focus-visible:ring-fcb-red/40"
            : "border-fcb-border focus:border-fcb-blue focus-visible:ring-fcb-blue/40"
        }`}
      />
      {error && <p className="font-inter text-xs text-fcb-red">{error}</p>}
    </div>
  );
}
