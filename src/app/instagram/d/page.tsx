import { getInstagramPosts } from "@/lib/beholdFeed";
import { CarouselShell, EmptyFeed } from "../_components/CarouselShell";
import FeatureCarousel from "@/components/instagram/FeatureCarousel";

// Variante D – „Feature": zentraler Hauptpost, unscharfe Nachbarn, Auto-Wechsel.
export default async function VariantDPage() {
  const posts = await getInstagramPosts(6);
  return (
    <CarouselShell variant="D" name="Feature">
      {posts.length === 0 ? <EmptyFeed /> : <FeatureCarousel posts={posts} />}
    </CarouselShell>
  );
}
