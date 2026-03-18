import { createContext, useContext } from "react";
import { cn } from "../../lib/utils";

const ToggleGroupContext = createContext({
  value: null,
  onValueChange: () => {},
});

/**
 * ToggleGroup component for single-select button groups (e.g., sizes).
 */
export function ToggleGroup({
  value,
  onValueChange,
  children,
  className,
  ...props
}) {
  return (
    <ToggleGroupContext.Provider value={{ value, onValueChange }}>
      <div
        role="group"
        className={cn("flex flex-wrap gap-2", className)}
        {...props}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

export function ToggleGroupItem({ value, children, className, disabled, ...props }) {
  const { value: selectedValue, onValueChange } = useContext(ToggleGroupContext);
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      disabled={disabled}
      onClick={() => onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center min-w-[3rem] h-11 px-4 text-sm font-medium border transition-all",
        isSelected
          ? "border-accent bg-accent/10 text-accent"
          : "border-border bg-transparent text-foreground hover:border-foreground/40",
        disabled && "opacity-40 cursor-not-allowed line-through",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
