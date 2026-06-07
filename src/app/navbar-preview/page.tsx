import { redirect } from "next/navigation";

// Bare /navbar-preview leitet auf die erste Variante weiter.
export default function NavbarPreviewIndex() {
  redirect("/navbar-preview/single-cta");
}
