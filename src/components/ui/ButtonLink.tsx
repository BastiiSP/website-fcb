import Link from "next/link";
import { buttonClasses } from "@/components/ui/buttonStyles";

// Next-Link in Button-Optik (Design-Spec „Buttons"): für Seiten-CTAs, die
// navigieren statt eine Aktion auszulösen. Nutzt exakt die Klassen von Button,
// damit beide nie auseinanderlaufen. Server-Komponenten-tauglich.

interface ButtonLinkProps {
  href: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Externe Links öffnen im neuen Tab (mit rel-Absicherung). */
  external?: boolean;
  children: React.ReactNode;
}

export default function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  external = false,
  children,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={buttonClasses(variant, size, className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </Link>
  );
}
