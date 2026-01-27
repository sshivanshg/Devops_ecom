import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, ShoppingBag, Sparkles, Info, Cloud } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/Dialog";
import { getThumbnailUrl, isCloudinaryUrl } from "../../lib/cloudinary";

/**
 * ProductCard component with hover image transitions and quick view.
 * Supports personalization with matchReason tooltip.
 */
export function ProductCard({ product, index = 0, showMatchReason = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const statusVariant = {
    new: "new",
    limited: "limited",
    sale: "sale",
  }[product.status];

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link to={`/products/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-muted mb-4">
        {/* Primary Image - Cloudinary Optimized */}
        <motion.img
          src={getThumbnailUrl(product.images[0])}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          animate={{ opacity: isHovered ? 0 : 1 }}
          transition={{ duration: 0.4 }}
        />

        {/* Hover Image - Cloudinary Optimized */}
        <motion.img
          src={getThumbnailUrl(product.hoverImage || product.images[1] || product.images[0])}
          alt={`${product.name} alternate view`}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.4 }}
        />

        {/* CDN Indicator (for demo) */}
        {isCloudinaryUrl(product.images[0]) && (
          <div className="absolute bottom-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/80 rounded text-[10px] font-medium text-white">
              <Cloud className="w-3 h-3" />
              CDN
            </div>
          </div>
        )}

        {/* Status Badge */}
        {product.status && (
          <div className="absolute top-4 left-4 z-10">
            <Badge variant={statusVariant}>
              {product.status === "new" && "New"}
              {product.status === "limited" && "Limited Edition"}
              {product.status === "sale" && `${discountPercent}% Off`}
            </Badge>
          </div>
        )}

        {/* "Why this?" Personalization Badge */}
        {showMatchReason && product.matchReason && (
          <div 
            className="absolute top-4 right-4 z-10"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="w-7 h-7 rounded-full bg-emerald-500/90 backdrop-blur-sm flex items-center justify-center"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </motion.button>

            {/* Tooltip */}
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 p-3 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-20"
                >
                  <p className="text-xs text-emerald-400 font-medium mb-1">
                    Why this?
                  </p>
                  <p className="text-xs text-zinc-300">
                    {product.matchReason}
                  </p>
                  {product.matchScore && (
                    <div className="mt-2 pt-2 border-t border-zinc-700">
                      <p className="text-[10px] text-zinc-500">
                        Match score: {product.matchScore}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Quick Actions Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30 flex items-end justify-center pb-6 gap-3"
            >
              {/* Quick View */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 text-black hover:bg-white"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Quick View
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{product.name}</DialogTitle>
                  </DialogHeader>
                  <div className="grid sm:grid-cols-2 gap-6 mt-4">
                    <div className="aspect-[3/4] bg-muted overflow-hidden">
                      <img
                        src={getThumbnailUrl(product.images[0])}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                        {product.category}
                      </p>
                      <div className="flex items-baseline gap-3 mb-4">
                        <span className="text-2xl font-medium">${product.price}</span>
                        {hasDiscount && (
                          <span className="text-muted-foreground line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Size Selector */}
                      <div className="mb-6">
                        <p className="text-sm font-medium mb-3">Select Size</p>
                        <div className="flex flex-wrap gap-2">
                          {product.sizes.map((size) => (
                            <button
                              key={size}
                              onClick={() => setSelectedSize(size)}
                              className={cn(
                                "min-w-[2.5rem] h-10 px-3 text-sm border transition-all",
                                selectedSize === size
                                  ? "border-accent bg-accent/10 text-accent"
                                  : "border-border hover:border-foreground/40"
                              )}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-auto space-y-3">
                        <Button className="w-full" size="lg">
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Add to Bag
                        </Button>
                        <Button variant="outline" className="w-full" asChild>
                          <Link to={`/products/${product.slug}`}>
                            View Full Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Quick Add */}
              <Button
                size="sm"
                className="translate-y-2 group-hover:translate-y-0 transition-transform"
                onClick={(e) => e.preventDefault()}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Add to Bag
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* Product Info */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground tracking-wide uppercase">
          {product.category}
        </p>
        <Link
          to={`/products/${product.slug}`}
          className="block font-medium hover:text-accent transition-colors"
        >
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className={cn(hasDiscount && "text-rose-400")}>
            ${product.price}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>

        {/* Color Swatches Preview */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-1.5 pt-2">
            {product.colors.slice(0, 4).map((color) => (
              <span
                key={color.name}
                className="w-4 h-4 rounded-full border border-white/20"
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-xs text-muted-foreground">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
}
