import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ShoppingBag,
  Heart,
  Share2,
  Truck,
  RotateCcw,
  AlertCircle,
  Bell,
  Info,
} from "lucide-react";
import { getProduct } from "../lib/api";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Carousel } from "../components/ui/Carousel";
import { ProductDetailSkeleton } from "../components/ui/Skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/Accordion";
import { SizeGuideModal, SizeGuideContent } from "../components/products/SizeGuide";
import { useCart } from "../components/cart/CartSheet";

/**
 * Sticky Mobile Add to Bag Bar component with variant awareness.
 */
function StickyMobileBar({ product, isVisible, selectedSize, isInStock }) {
  const { setIsOpen } = useCart();

  const handleAddToBag = () => {
    setIsOpen(true);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur-lg border-t border-white/5 p-4 lg:hidden"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{product.name}</p>
              <p className="text-accent">${product.price}</p>
            </div>
            {selectedSize && !isInStock ? (
              <Button 
                size="lg" 
                variant="outline"
                className="border-amber-500/50 text-amber-400"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notify Me
              </Button>
            ) : (
              <Button size="lg" disabled={!selectedSize || !isInStock} onClick={handleAddToBag}>
                <ShoppingBag className="w-4 h-4 mr-2" />
                {!selectedSize ? "Select Size" : "Add to Bag"}
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Product Detail Page with smart variant-aware selectors.
 * - Shows available colors from variants
 * - Updates size availability based on selected color
 * - Handles out-of-stock states
 */
export function ProductDetailPage() {
  const { slug } = useParams();
  const { setIsOpen } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const addToBagRef = useRef(null);

  // Fetch product from API
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);
        const data = await getProduct(slug);
        setProduct(data);
        // Set default color from variants
        const variants = data.variants || data.inventory || [];
        const uniqueColors = [...new Map(variants.map(v => [v.color, v])).values()];
        if (uniqueColors.length > 0) {
          setSelectedColor({ name: uniqueColors[0].color, value: uniqueColors[0].colorValue });
        } else if (data.colors?.length > 0) {
          setSelectedColor(data.colors[0]);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  // Get variants array
  const variants = useMemo(() => {
    if (!product) return [];
    return product.variants || product.inventory || [];
  }, [product]);

  // Get unique colors from variants with stock info
  const availableColors = useMemo(() => {
    if (variants.length === 0 && product?.colors) {
      return product.colors.map(c => ({ ...c, hasStock: true }));
    }
    
    const colorMap = new Map();
    variants.forEach(v => {
      if (!colorMap.has(v.color)) {
        colorMap.set(v.color, {
          name: v.color,
          value: v.colorValue,
          hasStock: v.stock > 0
        });
      } else if (v.stock > 0) {
        colorMap.get(v.color).hasStock = true;
      }
    });
    return Array.from(colorMap.values());
  }, [variants, product]);

  // Get sizes available for selected color
  const availableSizes = useMemo(() => {
    if (!selectedColor) return [];
    
    if (variants.length === 0 && product?.sizes) {
      return product.sizes.map(s => ({ size: s, stock: 999, available: true }));
    }
    
    return variants
      .filter(v => v.color === selectedColor.name)
      .map(v => ({
        size: v.size,
        stock: v.stock || 0,
        available: (v.stock || 0) > 0,
        sku: v.sku
      }));
  }, [variants, selectedColor, product]);

  // Get currently selected variant
  const selectedVariant = useMemo(() => {
    if (!selectedColor || !selectedSize) return null;
    return variants.find(v => v.color === selectedColor.name && v.size === selectedSize);
  }, [variants, selectedColor, selectedSize]);

  // Check if selected variant is in stock
  const isInStock = selectedVariant ? (selectedVariant.stock || 0) > 0 : false;

  // Handle color change - reset size if not available in new color
  const handleColorChange = (color) => {
    setSelectedColor(color);
    // Check if current size is available in new color
    const sizeInNewColor = variants.find(v => v.color === color.name && v.size === selectedSize);
    if (!sizeInNewColor || sizeInNewColor.stock === 0) {
      setSelectedSize(null);
    }
  };

  // Intersection observer for sticky bar
  useEffect(() => {
    if (!addToBagRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(addToBagRef.current);
    return () => observer.disconnect();
  }, [product]);

  const handleAddToBag = () => {
    setIsOpen(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20">
        <div className="container">
          <ProductDetailSkeleton />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h1 className="font-serif text-3xl mb-4">Failed to load product</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild>
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Not found
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-3xl mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The product you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button asChild>
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const statusVariant = {
    new: "new",
    limited: "limited",
    sale: "sale",
  }[product.status];

  const sizeChartType = product.category === "Bottoms" ? "pants" : "clothing";

  return (
    <>
      <div className="min-h-screen pt-24 pb-32 lg:pb-20">
        <div className="container">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
          >
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-foreground transition-colors">
              Shop
            </Link>
            <span>/</span>
            <Link
              to={`/shop?category=${product.category}`}
              className="hover:text-foreground transition-colors"
            >
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </motion.nav>

          {/* Back Button (Mobile) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="lg:hidden mb-6"
          >
            <Button variant="ghost" size="sm" asChild className="-ml-2">
              <Link to="/shop">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Shop
              </Link>
            </Button>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Left: Image Carousel */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Carousel images={product.images} />
            </motion.div>

            {/* Right: Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:sticky lg:top-28 lg:self-start"
            >
              {/* Status Badge */}
              {product.status && (
                <Badge variant={statusVariant} className="mb-4">
                  {product.status === "new" && "New Arrival"}
                  {product.status === "limited" && "Limited Edition"}
                  {product.status === "sale" && `${discountPercent}% Off`}
                </Badge>
              )}

              {/* Product Title */}
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span
                  className={cn(
                    "text-2xl font-medium",
                    hasDiscount && "text-rose-400"
                  )}
                >
                  ${product.price}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Smart Color Selector */}
              {availableColors.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">
                      Color:{" "}
                      <span className="text-muted-foreground font-normal">
                        {selectedColor?.name}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {availableColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => handleColorChange(color)}
                        className={cn(
                          "relative w-10 h-10 rounded-full border-2 transition-all",
                          selectedColor?.name === color.name
                            ? "border-accent scale-110 ring-2 ring-accent/30"
                            : "border-transparent hover:scale-105",
                          !color.hasStock && "opacity-40"
                        )}
                        title={color.hasStock ? color.name : `${color.name} (Out of Stock)`}
                      >
                        <span
                          className="absolute inset-1 rounded-full"
                          style={{ backgroundColor: color.value }}
                        />
                        {!color.hasStock && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="w-full h-0.5 bg-zinc-400 rotate-45 absolute" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Smart Size Selector */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">
                    Size:{" "}
                    <span className="text-muted-foreground font-normal">
                      {selectedSize || "Select a size"}
                    </span>
                    {selectedVariant && selectedVariant.stock <= 5 && selectedVariant.stock > 0 && (
                      <span className="ml-2 text-xs text-amber-400">
                        Only {selectedVariant.stock} left!
                      </span>
                    )}
                  </p>
                  <SizeGuideModal productCategory={sizeChartType} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((sizeInfo) => (
                    <button
                      key={sizeInfo.size}
                      onClick={() => sizeInfo.available && setSelectedSize(sizeInfo.size)}
                      disabled={!sizeInfo.available}
                      className={cn(
                        "relative min-w-[48px] px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                        selectedSize === sizeInfo.size
                          ? "bg-accent text-zinc-900 border-accent"
                          : sizeInfo.available
                            ? "bg-zinc-800 border-zinc-700 hover:border-zinc-500 text-zinc-100"
                            : "bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed"
                      )}
                    >
                      {sizeInfo.size}
                      {!sizeInfo.available && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="w-full h-0.5 bg-zinc-600 rotate-45 absolute" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {availableSizes.length > 0 && availableSizes.every(s => !s.available) && (
                  <p className="text-sm text-amber-400 mt-2 flex items-center gap-1">
                    <Info className="w-4 h-4" />
                    All sizes sold out in this color
                  </p>
                )}
              </div>

              {/* Add to Bag & Wishlist - Smart Variant-Aware */}
              <div ref={addToBagRef} className="flex gap-3 mb-8">
                {selectedSize && !isInStock ? (
                  // Out of stock - Show Notify Me
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                    onClick={() => alert('Notify feature coming soon!')}
                  >
                    <Bell className="w-5 h-5 mr-2" />
                    Notify When Available
                  </Button>
                ) : (
                  // In stock or no selection
                  <Button
                    size="lg"
                    className="flex-1"
                    disabled={!selectedSize || !isInStock}
                    onClick={handleAddToBag}
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    {!selectedSize ? "Select a Size" : isInStock ? "Add to Bag" : "Out of Stock"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  className={cn("px-4", isWishlisted && "text-rose-400 border-rose-400/50")}
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />
                </Button>
                <Button variant="outline" size="lg" className="px-4">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Selected Variant Info */}
              {selectedVariant && (
                <div className="text-xs text-zinc-500 mb-4">
                  SKU: {selectedVariant.sku}
                </div>
              )}

              {/* Shipping Info */}
              <div className="flex flex-col gap-3 py-6 border-t border-b border-border mb-8">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="w-5 h-5 text-accent" />
                  <span>Free shipping on orders over $200</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <RotateCcw className="w-5 h-5 text-accent" />
                  <span>Free returns within 30 days</span>
                </div>
              </div>

              {/* Accordions */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="details">
                  <AccordionTrigger>Product Details & Care</AccordionTrigger>
                  <AccordionContent>
                    {/* Metadata */}
                    {product.metadata && (
                      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-border">
                        {product.metadata.fabric && (
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Fabric</p>
                            <p className="text-sm mt-1">{product.metadata.fabric}</p>
                          </div>
                        )}
                        {product.metadata.fitType && (
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Fit</p>
                            <p className="text-sm mt-1">{product.metadata.fitType}</p>
                          </div>
                        )}
                        {product.metadata.madeIn && (
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Made In</p>
                            <p className="text-sm mt-1">{product.metadata.madeIn}</p>
                          </div>
                        )}
                        {product.metadata.careInstructions && (
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Care</p>
                            <p className="text-sm mt-1">{product.metadata.careInstructions}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Details list */}
                    {product.details && product.details.length > 0 && (
                      <ul className="list-disc list-inside space-y-2">
                        {product.details.map((detail, index) => (
                          <li key={index}>{detail}</li>
                        ))}
                      </ul>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="shipping">
                  <AccordionTrigger>Shipping & Returns</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Shipping</h4>
                        <p>
                          Standard shipping: 5-7 business days. Express shipping
                          available at checkout for 2-3 business day delivery.
                          Free shipping on all orders over $200.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Returns</h4>
                        <p>
                          We accept returns within 30 days of delivery. Items must
                          be unworn, unwashed, and with all original tags attached.
                          Free return shipping on all domestic orders.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="size-guide">
                  <AccordionTrigger>Size Guide</AccordionTrigger>
                  <AccordionContent>
                    <SizeGuideContent productCategory={sizeChartType} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Bar */}
      {product && (
        <StickyMobileBar
          product={product}
          isVisible={showStickyBar}
          selectedSize={selectedSize}
          isInStock={isInStock}
        />
      )}
    </>
  );
}
