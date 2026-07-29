"use client";

import { useId } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  required?: boolean;
}

export default function Select({ label, value, onChange, options, required }: SelectProps) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block font-inter text-xs font-medium uppercase tracking-wider text-fcb-muted"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        // .ui-select: appearance-none + eigenes Chevron (globals.css), damit in
        // jedem Browser genau EIN Pfeil erscheint, theme-fähig.
        className="ui-select w-full rounded-lg border border-fcb-border bg-fcb-bg px-3 py-2.5 font-inter text-sm text-fcb-text transition-colors focus:border-fcb-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-fcb-surface text-fcb-text">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
