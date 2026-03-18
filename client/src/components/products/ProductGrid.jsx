import { motion } from "framer-motion";
import { ProductCard } from "./ProductCard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

/**
 * ProductGrid component with responsive layout and staggered animations.
 */
export function ProductGrid({ products, className = "" }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">No products found.</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 ${className}`}
    >
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </motion.div>
  );
}
