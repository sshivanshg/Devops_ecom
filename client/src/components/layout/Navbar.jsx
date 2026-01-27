import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  User,
  Menu,
  ChevronDown,
  Crown,
  LogOut,
  Settings,
  Shield,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/Dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../ui/Sheet";
import { Input } from "../ui/Input";
import { CartTrigger } from "../cart/CartSheet";
import { useAuth } from "../../contexts/AuthContext";
import { AuthModal } from "../personalization/AuthModal";

const navLinks = [
  { name: "New Arrivals", href: "/shop?status=new", hasMegaMenu: true },
  { name: "Shop All", href: "/shop", hasMegaMenu: true },
  { name: "Men", href: "/shop?category=men" },
  { name: "Women", href: "/shop?category=women" },
  { name: "Sale", href: "/shop?status=sale" },
  { name: "About", href: "#about" },
];

const megaMenuContent = {
  "New Arrivals": {
    categories: [
      { name: "Latest Drops", items: [
        { label: "This Week", href: "/shop?status=new" },
        { label: "Trending Now", href: "/shop" },
      ]},
      { name: "By Category", items: [
        { label: "Outerwear", href: "/shop?category=Outerwear" },
        { label: "Tops", href: "/shop?category=Tops" },
        { label: "Bottoms", href: "/shop?category=Bottoms" },
        { label: "Accessories", href: "/shop?category=Accessories" },
      ]},
    ],
    featured: {
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=500&fit=crop",
      title: "Spring Collection",
      subtitle: "Discover the new season",
      href: "/shop",
    },
  },
  "Shop All": {
    categories: [
      { name: "Clothing", items: [
        { label: "Outerwear", href: "/shop?category=Outerwear" },
        { label: "Tops", href: "/shop?category=Tops" },
        { label: "Bottoms", href: "/shop?category=Bottoms" },
        { label: "Knitwear", href: "/shop?category=Knitwear" },
      ]},
      { name: "Accessories", items: [
        { label: "Belts", href: "/shop?category=Accessories" },
        { label: "Bags", href: "/shop?category=Accessories" },
      ]},
    ],
    featured: {
      image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=500&fit=crop",
      title: "Essentials",
      subtitle: "Timeless pieces",
      href: "/shop",
    },
  },
};

/**
 * Dynamic Navbar component with scroll effects and mega-menu.
 * Transitions from transparent to opaque on scroll.
 * Includes auth state and role-based menu items.
 */
export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, isVIP, isAdmin, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMegaMenuItemClick = (href) => {
    setActiveMegaMenu(null);
    navigate(href);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled
            ? "bg-zinc-900/95 backdrop-blur-md border-b border-white/5"
            : "bg-transparent"
        )}
        onMouseLeave={() => {
          setActiveMegaMenu(null);
          setShowUserMenu(false);
        }}
      >
        <div className="container">
          <nav className="flex items-center justify-between h-20">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link
              to="/"
              className="font-serif text-2xl md:text-3xl tracking-tight hover:opacity-80 transition-opacity"
            >
              ATELIER
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() =>
                    link.hasMegaMenu && setActiveMegaMenu(link.name)
                  }
                >
                  <Link
                    to={link.href}
                    className={cn(
                      "flex items-center gap-1 text-sm font-medium tracking-wide transition-colors hover:text-accent",
                      activeMegaMenu === link.name && "text-accent"
                    )}
                  >
                    {link.name}
                    {link.hasMegaMenu && (
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          activeMegaMenu === link.name && "rotate-180"
                        )}
                      />
                    )}
                  </Link>
                </div>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Search">
                    <Search className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Search</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <Input
                      placeholder="Search for products, collections..."
                      autoFocus
                      className="text-lg h-14"
                    />
                  </div>
                  <div className="mt-6">
                    <p className="text-sm text-muted-foreground mb-3">
                      Popular Searches
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["Jackets", "Minimalist", "Linen", "Summer"].map((term) => (
                        <button
                          key={term}
                          className="px-4 py-2 text-sm border border-border hover:bg-muted transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* User Menu */}
              <div 
                className="relative hidden sm:block"
                onMouseEnter={() => setShowUserMenu(true)}
                onMouseLeave={() => setShowUserMenu(false)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Account"
                  onClick={() => !isAuthenticated && setShowAuthModal(true)}
                  className={cn(
                    isVIP() && "text-amber-400 hover:text-amber-300"
                  )}
                >
                  {isVIP() ? (
                    <Crown className="w-5 h-5" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </Button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {showUserMenu && isAuthenticated && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden"
                    >
                      {/* User Info */}
                      <div className="p-4 border-b border-zinc-800">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            isVIP() 
                              ? "bg-gradient-to-br from-amber-500 to-yellow-500" 
                              : isAdmin()
                              ? "bg-gradient-to-br from-indigo-500 to-purple-500"
                              : "bg-zinc-700"
                          )}>
                            {isVIP() ? (
                              <Crown className="w-5 h-5 text-zinc-900" />
                            ) : isAdmin() ? (
                              <Shield className="w-5 h-5 text-white" />
                            ) : (
                              <User className="w-5 h-5 text-zinc-300" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-zinc-100">{user?.name}</p>
                            <p className="text-xs text-zinc-400">{user?.email}</p>
                          </div>
                        </div>
                        {user?.role && (
                          <div className="mt-3">
                            <span className={cn(
                              "text-xs px-2 py-1 rounded-full",
                              user.role === 'VIP' && "bg-amber-500/20 text-amber-400",
                              user.role === 'ADMIN' && "bg-indigo-500/20 text-indigo-400",
                              user.role === 'USER' && "bg-zinc-700 text-zinc-300"
                            )}>
                              {user.role}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        {isAdmin() && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Settings className="w-4 h-4" />
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart */}
              <CartTrigger />
            </div>
          </nav>
        </div>

        {/* Mega Menu */}
        <AnimatePresence>
          {activeMegaMenu && megaMenuContent[activeMegaMenu] && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 bg-zinc-900/98 backdrop-blur-lg border-b border-white/5"
              onMouseEnter={() => setActiveMegaMenu(activeMegaMenu)}
              onMouseLeave={() => setActiveMegaMenu(null)}
            >
              <div className="container py-10">
                <div className="grid grid-cols-4 gap-12">
                  {megaMenuContent[activeMegaMenu].categories.map((category) => (
                    <div key={category.name}>
                      <h3 className="font-serif text-lg mb-4">{category.name}</h3>
                      <ul className="space-y-3">
                        {category.items.map((item) => (
                          <li key={item.label}>
                            <button
                              onClick={() => handleMegaMenuItemClick(item.href)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {item.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <button
                    onClick={() => handleMegaMenuItemClick(megaMenuContent[activeMegaMenu].featured.href)}
                    className="relative overflow-hidden text-left"
                  >
                    <img
                      src={megaMenuContent[activeMegaMenu].featured.image}
                      alt={megaMenuContent[activeMegaMenu].featured.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                      <h4 className="font-serif text-lg">
                        {megaMenuContent[activeMegaMenu].featured.title}
                      </h4>
                      <p className="text-sm text-gray-300">
                        {megaMenuContent[activeMegaMenu].featured.subtitle}
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile Menu Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-serif text-2xl">ATELIER</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 p-6">
            {isAuthenticated && (
              <div className="pb-4 mb-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    isVIP() ? "bg-amber-500" : "bg-zinc-700"
                  )}>
                    {isVIP() ? (
                      <Crown className="w-5 h-5 text-zinc-900" />
                    ) : (
                      <User className="w-5 h-5 text-zinc-300" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-xs text-zinc-400">{user?.role}</p>
                  </div>
                </div>
              </div>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="py-3 text-lg border-b border-border/50 hover:text-accent transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            {isAdmin() && (
              <Link
                to="/admin"
                className="py-3 text-lg border-b border-border/50 text-indigo-400 hover:text-indigo-300 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}

            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="py-3 text-lg text-red-400 text-left"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowAuthModal(true);
                }}
                className="py-3 text-lg text-emerald-400 text-left"
              >
                Sign In
              </button>
            )}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
}
