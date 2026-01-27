import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown, AlertCircle } from "lucide-react";
import { getProducts } from "../lib/api";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/Button";
import { ProductGrid } from "../components/products/ProductGrid";
import { ProductGridSkeleton } from "../components/ui/Skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/Sheet";

const categories = ["All", "Outerwear", "Tops", "Bottoms", "Knitwear", "Accessories"];
const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name A-Z" },
];

/**
 * Shop Page with API integration, filtering and sorting.
 */
export function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Fetch products from API
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
      default:
        // Keep original order (newest first from API)
        break;
    }

    return filtered;
  }, [products, selectedCategory, sortBy]);

  const FilterContent = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-medium mb-4">Category</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "block w-full text-left py-2 px-3 text-sm transition-colors",
                selectedCategory === category
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-4">
            Shop All
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our curated collection of modern luxury essentials,
            crafted with intention for the discerning individual.
          </p>
        </motion.div>

        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between gap-4 mb-8 pb-6 border-b border-border"
        >
          {/* Mobile Filter Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="py-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Category Tabs */}
          <div className="hidden lg:flex items-center gap-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors",
                  selectedCategory === category
                    ? "text-accent"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Results Count & Sort */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {loading ? "Loading..." : `${filteredProducts.length} product${filteredProducts.length !== 1 ? "s" : ""}`}
            </span>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 text-sm font-medium hover:text-accent transition-colors"
              >
                Sort by: {sortOptions.find((o) => o.value === sortBy)?.label}
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    showSortMenu && "rotate-180"
                  )}
                />
              </button>

              {showSortMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSortMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-full mt-2 z-50 bg-zinc-900 border border-border shadow-xl min-w-[180px]"
                  >
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setShowSortMenu(false);
                        }}
                        className={cn(
                          "block w-full text-left px-4 py-3 text-sm transition-colors",
                          sortBy === option.value
                            ? "bg-accent/10 text-accent"
                            : "hover:bg-muted"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Active Filters */}
        {selectedCategory !== "All" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-2 mb-8"
          >
            <span className="text-sm text-muted-foreground">Filters:</span>
            <button
              onClick={() => setSelectedCategory("All")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 transition-colors"
            >
              {selectedCategory}
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
            <h3 className="font-serif text-xl mb-2">Failed to load products</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && <ProductGridSkeleton count={8} />}

        {/* Product Grid */}
        {!loading && !error && <ProductGrid products={filteredProducts} />}
      </div>
    </div>
  );
}
