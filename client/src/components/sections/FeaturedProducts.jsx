import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getFeaturedProducts } from "../../lib/api";
import { Button } from "../ui/Button";
import { ProductCard } from "../products/ProductCard";
import { ProductGridSkeleton } from "../ui/Skeleton";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/**
 * Featured Products section with API integration.
 */
export function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        setLoading(true);
        const data = await getFeaturedProducts();
        setProducts(data.slice(0, 4)); // Limit to 4 products
      } catch (err) {
        console.error('Failed to fetch featured products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, []);

  return (
    <section className="py-24 md:py-32 bg-zinc-950">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16"
        >
          <div>
            <span className="text-sm tracking-[0.2em] text-accent uppercase">
              Curated Selection
            </span>
            <h2 className="font-serif text-4xl md:text-5xl mt-3">
              New Arrivals
            </h2>
          </div>
          <Button variant="outline" className="group self-start md:self-auto" asChild>
            <Link to="/shop">
              View All Products
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>

        {/* Loading State */}
        {loading && <ProductGridSkeleton count={4} />}

        {/* Error State */}
        {error && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Unable to load products</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          >
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
