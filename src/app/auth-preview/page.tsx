import { redirect } from "next/navigation";
import { DEFAULT_VARIANT_SLUG } from "@/components/auth-preview/_shared/variants";

export default function AuthPreviewIndex() {
  redirect(`/auth-preview/${DEFAULT_VARIANT_SLUG}`);
}
