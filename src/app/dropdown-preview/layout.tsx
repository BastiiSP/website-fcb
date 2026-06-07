import type { Metadata } from "next";
import DropdownSwitcher from "./_components/DropdownSwitcher";

/**
 * Layout für die Dropdown-Design-Exploration unter /dropdown-preview/*.
 * Eigenes Full-Bleed-Chrome (Switcher oben); die globale Header/Footer-Chrome
 * ist für diese Route in ConditionalChrome ausgeblendet.
 */
export const metadata: Metadata = {
  title: "FCB · Dropdown-Varianten",
  description: "Vergleich der Auth-Dropdown-Designs (Design-Runde 2).",
};

export default function DropdownPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-fcb-bg font-inter text-fcb-text antialiased">
      <DropdownSwitcher />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
