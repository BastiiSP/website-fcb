import { redirect } from "next/navigation";

// Bare /dropdown-preview leitet auf die erste Variante weiter.
export default function DropdownPreviewIndex() {
  redirect("/dropdown-preview/gegliedert");
}
