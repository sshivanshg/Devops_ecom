import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Instagram,
  Twitter,
  Facebook,
  Youtube,
} from "lucide-react";
import { NewsletterInline } from "../marketing/NewsletterSignup";

const footerLinks = {
  shop: {
    title: "Shop",
    links: [
      { name: "New Arrivals", href: "/shop?status=new" },
      { name: "Best Sellers", href: "/shop" },
      { name: "Outerwear", href: "/shop?category=Outerwear" },
      { name: "Tops", href: "/shop?category=Tops" },
      { name: "Accessories", href: "/shop?category=Accessories" },
      { name: "Sale", href: "/shop?status=sale" },
    ],
  },
  about: {
    title: "About",
    links: [
      { name: "Our Story", href: "#story" },
      { name: "Sustainability", href: "#sustainability" },
      { name: "Craftsmanship", href: "#craftsmanship" },
      { name: "Careers", href: "#careers" },
      { name: "Press", href: "#press" },
    ],
  },
  support: {
    title: "Customer Service",
    links: [
      { name: "Contact Us", href: "#contact" },
      { name: "FAQ", href: "#faq" },
      { name: "Shipping & Returns", href: "#shipping" },
      { name: "Size Guide", href: "#size-guide" },
      { name: "Order Tracking", href: "#tracking" },
    ],
  },
};

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

/**
 * Footer component with 4-column layout including newsletter signup.
 */
export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-white/5">
      {/* Newsletter Section */}
      <div className="border-b border-white/5">
        <div className="container py-16 md:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <NewsletterInline />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="font-serif text-2xl tracking-tight">
              ATELIER
            </Link>
            <p className="text-muted-foreground text-sm mt-4 leading-relaxed max-w-xs">
              Modern luxury for the discerning individual. Crafted with intention,
              designed for life.
            </p>
            <div className="flex gap-4 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 flex items-center justify-center border border-white/10 hover:border-accent hover:text-accent transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-medium text-sm tracking-wide uppercase mb-5">
              {footerLinks.shop.title}
            </h3>
            <ul className="space-y-3">
              {footerLinks.shop.links.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h3 className="font-medium text-sm tracking-wide uppercase mb-5">
              {footerLinks.about.title}
            </h3>
            <ul className="space-y-3">
              {footerLinks.about.links.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-medium text-sm tracking-wide uppercase mb-5">
              {footerLinks.support.title}
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.links.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2026 ATELIER. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#cookies" className="hover:text-foreground transition-colors">
                Cookie Settings
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
