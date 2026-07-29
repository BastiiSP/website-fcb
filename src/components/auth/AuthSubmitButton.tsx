"use client";

interface AuthSubmitButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
}

export default function AuthSubmitButton({ children, disabled }: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full rounded-lg bg-fcb-accent px-4 py-3 font-oswald text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-fcb-accent/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-fcb-accent focus-visible:ring-offset-2 focus-visible:ring-offset-fcb-bg disabled:cursor-not-allowed disabled:bg-fcb-border disabled:text-fcb-muted"
    >
      {children}
    </button>
  );
}
