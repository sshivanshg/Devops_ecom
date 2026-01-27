import { Check } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * ColorSwatch component for product color selection.
 */
export function ColorSwatch({ color, isSelected, onClick, size = "md" }) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const isLightColor = (hex) => {
    const c = hex.substring(1);
    const rgb = parseInt(c, 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma > 180;
  };

  const light = isLightColor(color.value);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative rounded-full transition-all flex items-center justify-center",
        sizeClasses[size],
        isSelected
          ? "ring-2 ring-offset-2 ring-offset-background ring-accent"
          : "hover:scale-110"
      )}
      style={{ backgroundColor: color.value }}
      title={color.name}
      aria-label={`Select ${color.name}`}
    >
      {isSelected && (
        <Check
          className={cn(
            "w-4 h-4",
            light ? "text-black" : "text-white"
          )}
        />
      )}
    </button>
  );
}

/**
 * ColorSwatchGroup for selecting from multiple colors.
 */
export function ColorSwatchGroup({
  colors,
  selectedColor,
  onColorChange,
  size = "md",
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((color) => (
        <ColorSwatch
          key={color.name}
          color={color}
          isSelected={selectedColor?.name === color.name}
          onClick={() => onColorChange(color)}
          size={size}
        />
      ))}
    </div>
  );
}
