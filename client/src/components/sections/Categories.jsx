import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const categories = [
  {
    name: "Men",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&h=1000&fit=crop",
    href: "/shop?category=men",
  },
  {
    name: "Women",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=1000&fit=crop",
    href: "/shop?category=women",
  },
  {
    name: "Accessories",
    image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&h=1000&fit=crop",
    href: "/shop?category=accessories",
  },
];

/**
 * Category showcase with large imagery and hover effects.
 */
export function Categories() {
  return (
    <section className="py-24 md:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm tracking-[0.2em] text-accent uppercase">
            Explore
          </span>
          <h2 className="font-serif text-4xl md:text-5xl mt-3">
            Shop by Category
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={category.href}
                className="group relative block aspect-[4/5] overflow-hidden"
              >
                <motion.img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.7 }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-10">
                  <h3 className="font-serif text-3xl md:text-4xl mb-2">
                    {category.name}
                  </h3>
                  <span className="text-sm tracking-wide text-gray-300 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    Shop Now
                  </span>
                </div>

                {/* Border on hover */}
                <div className="absolute inset-4 border border-white/0 group-hover:border-white/30 transition-colors duration-500" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
