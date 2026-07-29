"use client";

import { useId } from "react";

interface TextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
}

export default function Textarea({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  required,
  optional,
}: TextareaProps) {
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
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-fcb-border bg-fcb-bg px-3 py-2.5 font-inter text-sm text-fcb-text placeholder:text-fcb-muted/60 transition-colors focus:border-fcb-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent/40"
      />
    </div>
  );
}
