"use client";

import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-oswald font-semibold uppercase tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-blue focus-visible:ring-offset-2 focus-visible:ring-offset-fcb-bg disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-fcb-blue text-white hover:bg-fcb-blue/90",
  secondary:
    "border border-fcb-border bg-fcb-surface text-fcb-text hover:border-fcb-blue",
  ghost: "text-fcb-text hover:text-fcb-blue",
  danger: "bg-fcb-red text-white hover:bg-fcb-red/90",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

/**
 * Baut den kompletten Klassenstring einer Button-Optik zusammen.
 * Exportiert, damit ButtonLink (Next-Link in Button-Optik) exakt dieselben
 * Styles nutzt – Varianten/Größen werden nur hier gepflegt.
 */
export function buttonClasses(
  variant: Variant = "primary",
  size: Size = "md",
  className = "",
): string {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className = "", type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses(variant, size, className)}
      {...rest}
    />
  );
});

export default Button;
