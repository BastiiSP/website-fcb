import { getInstagramPosts } from "@/lib/beholdFeed";
import { CarouselShell, EmptyFeed } from "../_components/CarouselShell";
import CylinderCarousel from "@/components/instagram/CylinderCarousel";

// Variante B – „Cylinder": rotierender 3D-Zylinder mit Auto-Rotation + Pfeilen.
export default async function VariantBPage() {
  const posts = await getInstagramPosts(6);
  return (
    <CarouselShell variant="B" name="Cylinder">
      {posts.length === 0 ? <EmptyFeed /> : <CylinderCarousel posts={posts} />}
    </CarouselShell>
  );
}
