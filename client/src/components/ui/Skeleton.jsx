import { cn } from "../../lib/utils";

/**
 * Skeleton loading component for placeholder content.
 */
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-sm bg-muted/50",
        className
      )}
      {...props}
    />
  );
}

/**
 * Product Card Skeleton for loading states.
 */
export function ProductCardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-[3/4] w-full" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

/**
 * Product Grid Skeleton for loading states.
 */
export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Product Detail Skeleton for loading states.
 */
export function ProductDetailSkeleton() {
  return (
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
      {/* Image */}
      <div>
        <Skeleton className="aspect-[3/4] w-full" />
        <div className="flex gap-3 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="w-20 h-24" />
          ))}
        </div>
      </div>
      
      {/* Details */}
      <div className="space-y-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-8 w-28" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-10 h-10 rounded-full" />
          ))}
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="w-12 h-11" />
          ))}
        </div>
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  );
}
