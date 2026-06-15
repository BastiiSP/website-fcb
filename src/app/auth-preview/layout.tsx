import type { Metadata } from "next";
import AuthPreviewSwitcher from "./_components/AuthPreviewSwitcher";

export const metadata: Metadata = {
  title: "FCB · Auth-Varianten",
  description: "Vergleich der Login-/Registrieren-/Bestätigungs-Designs (Design-Runde Auth).",
};

export default function AuthPreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-fcb-bg font-inter text-fcb-text antialiased">
      <AuthPreviewSwitcher />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
