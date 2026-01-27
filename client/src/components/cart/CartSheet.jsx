import { useState, createContext, useContext } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Minus, Plus, X, Truck, Gift } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/Sheet";

const FREE_SHIPPING_THRESHOLD = 200;

// Mock cart data - in a real app, this would come from state management
const initialCartItems = [
  {
    id: "1",
    name: "Oversized Wool Coat",
    price: 580,
    size: "M",
    color: "Charcoal",
    quantity: 1,
    image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=200&h=250&fit=crop",
    slug: "oversized-wool-coat",
  },
  {
    id: "2",
    name: "Silk Blend Relaxed Shirt",
    price: 220,
    size: "L",
    color: "Ivory",
    quantity: 2,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&h=250&fit=crop",
    slug: "silk-blend-shirt",
  },
];

// Cart Context for global state
const CartContext = createContext(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

/**
 * Cart Provider component for managing cart state.
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState(initialCartItems);
  const [isOpen, setIsOpen] = useState(false);

  const updateQuantity = (id, delta) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountToFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        updateQuantity,
        removeItem,
        isOpen,
        setIsOpen,
        freeShippingProgress,
        amountToFreeShipping,
        hasFreeShipping,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/**
 * Free Shipping Progress Bar component.
 */
function FreeShippingBar({ progress, amountRemaining, hasFreeShipping }) {
  return (
    <div className="p-4 bg-muted/30 border-b border-border">
      {hasFreeShipping ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-accent"
        >
          <Gift className="w-4 h-4" />
          <span className="text-sm font-medium">
            You&apos;ve unlocked free shipping!
          </span>
        </motion.div>
      ) : (
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Truck className="w-4 h-4" />
              Free shipping on orders over ${FREE_SHIPPING_THRESHOLD}
            </span>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Add <span className="text-foreground font-medium">${amountRemaining.toFixed(2)}</span> more for free shipping
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Cart Item component with quantity controls.
 */
function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex gap-4 py-4 border-b border-border/50"
    >
      {/* Product Image */}
      <Link
        to={`/products/${item.slug}`}
        className="w-20 h-24 flex-shrink-0 bg-muted overflow-hidden"
      >
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform"
        />
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-2">
          <Link
            to={`/products/${item.slug}`}
            className="font-medium text-sm hover:text-accent transition-colors truncate"
          >
            {item.name}
          </Link>
          <button
            onClick={() => onRemove(item.id)}
            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            aria-label="Remove item"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground mt-1">
          {item.color} / {item.size}
        </p>

        <div className="flex items-center justify-between mt-3">
          {/* Quantity Controls */}
          <div className="flex items-center border border-border">
            <button
              onClick={() => onUpdateQuantity(item.id, -1)}
              disabled={item.quantity <= 1}
              className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-10 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, 1)}
              className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Price */}
          <span className="font-medium">
            ${(item.price * item.quantity).toFixed(2)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Cart Sheet Content component.
 */
function CartSheetContent() {
  const {
    items,
    subtotal,
    updateQuantity,
    removeItem,
    freeShippingProgress,
    amountToFreeShipping,
    hasFreeShipping,
  } = useCart();

  const shipping = hasFreeShipping ? 0 : 15;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-serif text-xl mb-2">Your cart is empty</h3>
        <p className="text-muted-foreground text-sm mb-6">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Button asChild>
          <Link to="/shop">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Free Shipping Progress */}
      <FreeShippingBar
        progress={freeShippingProgress}
        amountRemaining={amountToFreeShipping}
        hasFreeShipping={hasFreeShipping}
      />

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Cart Summary */}
      <div className="border-t border-border p-6 space-y-4 bg-zinc-900/50">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className={cn(hasFreeShipping && "text-accent")}>
              {hasFreeShipping ? "FREE" : `$${shipping.toFixed(2)}`}
            </span>
          </div>
        </div>

        <div className="flex justify-between text-lg font-medium pt-2 border-t border-border">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <Button className="w-full" size="lg">
          Checkout
        </Button>

        <Button variant="outline" className="w-full" asChild>
          <Link to="/cart">View Full Cart</Link>
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Taxes calculated at checkout
        </p>
      </div>
    </>
  );
}

/**
 * Cart Sheet Trigger Button component.
 */
export function CartTrigger() {
  const { itemCount, isOpen, setIsOpen } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Cart">
          <ShoppingBag className="w-5 h-5" />
          {itemCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs flex items-center justify-center rounded-full"
            >
              {itemCount}
            </motion.span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col p-0 w-full sm:max-w-md">
        <SheetHeader className="p-6 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Cart ({itemCount})
          </SheetTitle>
        </SheetHeader>
        <CartSheetContent />
      </SheetContent>
    </Sheet>
  );
}

/**
 * Main Cart Sheet export for direct usage.
 */
export function CartSheet({ children }) {
  const { isOpen, setIsOpen, itemCount } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex flex-col p-0 w-full sm:max-w-md">
        <SheetHeader className="p-6 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Cart ({itemCount})
          </SheetTitle>
        </SheetHeader>
        <CartSheetContent />
      </SheetContent>
    </Sheet>
  );
}
