import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { getProduct } from "../lib/api";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Carousel } from "../components/ui/Carousel";
import { ColorSwatchGroup } from "../components/ui/ColorSwatch";
import { ToggleGroup, ToggleGroupItem } from "../components/ui/ToggleGroup";
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
 * Sticky Mobile Add to Bag Bar component.
 */
function StickyMobileBar({ product, isVisible, selectedSize }) {
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
            <Button size="lg" disabled={!selectedSize} onClick={handleAddToBag}>
              <ShoppingBag className="w-4 h-4 mr-2" />
              Add to Bag
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Product Detail Page with API integration.
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
        // Set default color
        if (data.colors?.length > 0) {
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

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">
                      Color:{" "}
                      <span className="text-muted-foreground font-normal">
                        {selectedColor?.name}
                      </span>
                    </p>
                  </div>
                  <ColorSwatchGroup
                    colors={product.colors}
                    selectedColor={selectedColor}
                    onColorChange={setSelectedColor}
                    size="lg"
                  />
                </div>
              )}

              {/* Size Selector */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">
                    Size:{" "}
                    <span className="text-muted-foreground font-normal">
                      {selectedSize || "Select a size"}
                    </span>
                  </p>
                  <SizeGuideModal productCategory={sizeChartType} />
                </div>
                <ToggleGroup value={selectedSize} onValueChange={setSelectedSize}>
                  {product.sizes.map((size) => (
                    <ToggleGroupItem key={size} value={size}>
                      {size}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              {/* Add to Bag & Wishlist */}
              <div ref={addToBagRef} className="flex gap-3 mb-8">
                <Button
                  size="lg"
                  className="flex-1"
                  disabled={!selectedSize}
                  onClick={handleAddToBag}
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  {selectedSize ? "Add to Bag" : "Select a Size"}
                </Button>
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
                    <ul className="list-disc list-inside space-y-2">
                      {product.details.map((detail, index) => (
                        <li key={index}>{detail}</li>
                      ))}
                    </ul>
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
        />
      )}
    </>
  );
}
