import { getInstagramPosts } from "@/lib/beholdFeed";
import { CarouselShell, EmptyFeed } from "../_components/CarouselShell";
import SpotlightCarousel from "@/components/instagram/SpotlightCarousel";

// Variante A – „Spotlight": 3×2-Raster mit maus-folgendem Glow.
export default async function VariantAPage() {
  const posts = await getInstagramPosts(6);
  return (
    <CarouselShell variant="A" name="Spotlight">
      {posts.length === 0 ? <EmptyFeed /> : <SpotlightCarousel posts={posts} />}
    </CarouselShell>
  );
}
