import { getInstagramPosts } from "@/lib/beholdFeed";
import { CarouselShell, EmptyFeed } from "../_components/CarouselShell";
import StackCarousel from "@/components/instagram/StackCarousel";

// Variante C – „Stack": horizontaler 3D-Kartenstapel, per Pfeilen navigiert.
export default async function VariantCPage() {
  const posts = await getInstagramPosts(6);
  return (
    <CarouselShell variant="C" name="Stack">
      {posts.length === 0 ? <EmptyFeed /> : <StackCarousel posts={posts} />}
    </CarouselShell>
  );
}
