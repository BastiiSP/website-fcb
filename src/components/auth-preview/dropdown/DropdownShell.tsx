import type { ReactNode } from "react";

/**
 * Hülle für ein aufgeklapptes Dropdown-Mock. Übernimmt das Aussehen der echten
 * Menu.Items aus UserDropdown (gerundet, bg-fcb-surface, Border, Shadow).
 * Breite per className überschreibbar (Default w-64).
 */
export default function DropdownShell({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={[
        "overflow-hidden rounded-lg border border-fcb-border bg-fcb-surface text-fcb-text shadow-lg",
        className ?? "w-64",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
