import { redirect } from "next/navigation";

// Bare /footer-preview leitet auf die erste Variante weiter.
export default function FooterPreviewIndex() {
  redirect("/footer-preview/slim");
}
