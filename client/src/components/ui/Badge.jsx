import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center px-2.5 py-0.5 text-xs font-medium tracking-wide uppercase transition-colors",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-foreground",
        new: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        limited: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        sale: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
        outline: "border border-border text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * Badge component for product status indicators.
 */
export function Badge({ className, variant, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
