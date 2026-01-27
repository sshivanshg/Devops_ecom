import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, Mail, Gift, Sparkles } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/Dialog";

const COOKIE_NAME = "newsletter_popup_dismissed";
const POPUP_DELAY = 10000; // 10 seconds
const COOKIE_EXPIRY_DAYS = 7;

/**
 * Helper to get/set cookies.
 */
const cookies = {
  get(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  },
  set(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  },
};

/**
 * Newsletter Form component - reusable for inline and popup versions.
 */
function NewsletterForm({ variant = "default", onSuccess }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setStatus("loading");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock success (90% success rate for demo)
    if (Math.random() > 0.1) {
      setStatus("success");
      setEmail("");
      onSuccess?.();
    } else {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3"
        >
          <Sparkles className="w-6 h-6 text-accent" />
        </motion.div>
        <h4 className="font-serif text-lg mb-1">Welcome to the family!</h4>
        <p className="text-sm text-muted-foreground">
          Check your inbox for your exclusive welcome offer.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className={variant === "popup" ? "" : "flex flex-col sm:flex-row gap-3"}>
        <div className="flex-1 relative">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            className={variant === "popup" ? "h-12" : ""}
            disabled={status === "loading"}
          />
        </div>
        <Button
          type="submit"
          disabled={status === "loading"}
          className={variant === "popup" ? "w-full mt-3" : ""}
        >
          {status === "loading" ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : (
            <>
              Subscribe
              <ArrowRight className="ml-2 w-4 h-4" />
            </>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {status === "error" && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-rose-400"
          >
            {errorMessage}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}

/**
 * Inline Newsletter Signup component for footer.
 */
export function NewsletterInline() {
  return (
    <div className="max-w-md mx-auto">
      <h3 className="font-serif text-2xl mb-2">Stay in the Loop</h3>
      <p className="text-muted-foreground text-sm mb-4">
        Subscribe for exclusive access to new collections, private sales, and
        style inspiration.
      </p>
      <NewsletterForm variant="inline" />
      <p className="text-xs text-muted-foreground mt-3">
        By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
      </p>
    </div>
  );
}

/**
 * Newsletter Popup component with exit-intent and timed trigger.
 */
export function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const shouldShowPopup = useCallback(() => {
    // Check if popup was dismissed recently
    return !cookies.get(COOKIE_NAME);
  }, []);

  const handleDismiss = useCallback(() => {
    setIsOpen(false);
    cookies.set(COOKIE_NAME, "true", COOKIE_EXPIRY_DAYS);
  }, []);

  const handleSuccess = useCallback(() => {
    // Set cookie on success so popup doesn't show again
    cookies.set(COOKIE_NAME, "subscribed", 365);
    setTimeout(() => setIsOpen(false), 2000);
  }, []);

  // Timed trigger
  useEffect(() => {
    if (hasTriggered || !shouldShowPopup()) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      setHasTriggered(true);
    }, POPUP_DELAY);

    return () => clearTimeout(timer);
  }, [hasTriggered, shouldShowPopup]);

  // Exit intent trigger (mouse leaving viewport at top)
  useEffect(() => {
    if (hasTriggered || !shouldShowPopup()) return;

    const handleMouseLeave = (e) => {
      if (e.clientY <= 0) {
        setIsOpen(true);
        setHasTriggered(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [hasTriggered, shouldShowPopup]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <div className="grid md:grid-cols-5">
          {/* Left: Image */}
          <div className="hidden md:block md:col-span-2 relative">
            <img
              src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop"
              alt="Fashion editorial"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/50" />
          </div>

          {/* Right: Content */}
          <div className="md:col-span-3 p-6 md:p-8">
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4"
              >
                <Gift className="w-6 h-6 text-accent" />
              </motion.div>

              <DialogHeader>
                <DialogTitle className="font-serif text-2xl md:text-3xl mb-2">
                  Get 15% Off Your First Order
                </DialogTitle>
              </DialogHeader>

              <p className="text-muted-foreground">
                Join our community and be the first to know about new arrivals,
                exclusive offers, and style inspiration.
              </p>
            </div>

            <NewsletterForm variant="popup" onSuccess={handleSuccess} />

            <p className="text-xs text-muted-foreground mt-4 text-center">
              By subscribing, you agree to our{" "}
              <button className="underline hover:text-foreground">
                Privacy Policy
              </button>
              . Unsubscribe anytime.
            </p>

            <button
              onClick={handleDismiss}
              className="block w-full text-center text-sm text-muted-foreground hover:text-foreground mt-4 py-2 transition-colors"
            >
              No thanks, I&apos;ll pay full price
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Full-width Newsletter Banner component.
 */
export function NewsletterBanner() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-zinc-900 to-zinc-950">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-7 h-7 text-accent" />
          </div>

          <h2 className="font-serif text-3xl md:text-4xl mb-4">
            Join the ATELIER Community
          </h2>

          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Subscribe to receive exclusive access to new collections, members-only
            sales, and curated style inspiration delivered to your inbox.
          </p>

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-4"
            >
              <Sparkles className="w-8 h-8 text-accent mx-auto mb-3" />
              <p className="text-lg font-medium">Thank you for subscribing!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Check your inbox for a welcome surprise.
              </p>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-12"
                required
              />
              <Button type="submit" size="lg" className="group">
                Subscribe
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </form>
          )}

          <p className="text-xs text-muted-foreground mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
