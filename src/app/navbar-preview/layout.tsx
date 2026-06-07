import type { Metadata } from "next";
import NavbarSwitcher from "./_components/NavbarSwitcher";

/**
 * Layout für die Navbar-Button-Design-Exploration unter /navbar-preview/*.
 * Eigenes Full-Bleed-Chrome (Switcher oben); die globale Header/Footer-Chrome
 * ist für diese Route in ConditionalChrome ausgeblendet.
 */
export const metadata: Metadata = {
  title: "FCB · Navbar-Varianten",
  description: "Vergleich der Auth-Buttons in der Navbar (Design-Runde 2).",
};

export default function NavbarPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-fcb-bg font-inter text-fcb-text antialiased">
      <NavbarSwitcher />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
