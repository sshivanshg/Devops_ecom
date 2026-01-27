import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";

/**
 * Editorial split-screen section for storytelling and brand narrative.
 */
export function EditorialSection() {
  return (
    <section className="py-24 md:py-0">
      <div className="grid md:grid-cols-2 min-h-screen">
        {/* Left: Image */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative h-[60vh] md:h-auto overflow-hidden"
        >
          <img
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&h=1400&fit=crop"
            alt="Editorial fashion photography"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
        </motion.div>

        {/* Right: Content */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center bg-zinc-900 px-8 py-16 md:p-16 lg:p-24"
        >
          <div className="max-w-lg">
            <span className="text-sm tracking-[0.2em] text-accent uppercase">
              The Collection
            </span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mt-4 mb-6 leading-tight">
              Crafted for the{" "}
              <span className="italic font-light">Modern</span> Soul
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Every piece in our collection tells a story of meticulous craftsmanship
              and timeless design. We believe in creating garments that transcend
              seasons, becoming cherished staples in your wardrobe.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-10">
              From the selection of premium fabrics to the final stitch, our artisans
              pour their expertise into every detail, ensuring each piece meets the
              highest standards of quality and elegance.
            </p>
            <Button variant="outline" size="lg" className="group">
              Discover Our Story
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
