import { notFound } from "next/navigation";
import { getVariant } from "@/components/auth-preview/_shared/variants";
import AuthPreviewStage from "../_components/AuthPreviewStage";

// Next 16: params ist ein Promise und muss awaited werden.
export default async function AuthPreviewVariantPage({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  const { variant } = await params;
  if (!getVariant(variant)) notFound();
  return <AuthPreviewStage variantSlug={variant} />;
}
