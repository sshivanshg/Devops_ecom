import { HeroSection } from "../components/sections/HeroSection";
import { FeaturedProducts } from "../components/sections/FeaturedProducts";
import { EditorialSection } from "../components/sections/EditorialSection";
import { Categories } from "../components/sections/Categories";

/**
 * Home Page - Landing page with hero, featured products, and categories.
 */
export function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeaturedProducts />
      <EditorialSection />
      <Categories />
    </main>
  );
}
