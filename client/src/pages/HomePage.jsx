import { HeroSection } from "../components/sections/HeroSection";
import { FeaturedProducts } from "../components/sections/FeaturedProducts";
import { RecommendedProducts } from "../components/sections/RecommendedProducts";
import { EditorialSection } from "../components/sections/EditorialSection";
import { Categories } from "../components/sections/Categories";

/**
 * Home Page - Landing page with hero, featured products, and categories.
 * Includes personalized recommendations for logged-in users.
 */
export function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeaturedProducts />
      <RecommendedProducts />
      <EditorialSection />
      <Categories />
    </main>
  );
}
