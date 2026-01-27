/**
 * Promotional Banner Component
 * Displays announcement bar at the top of the site
 * Fetches config from /api/settings/promo_banner
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PromoBanner() {
  const [banner, setBanner] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if user has dismissed the banner
    const dismissed = sessionStorage.getItem('promo_banner_dismissed');
    if (dismissed) {
      setIsVisible(false);
      return;
    }

    async function fetchBanner() {
      try {
        const response = await fetch('/api/settings/promo_banner');
        if (response.ok) {
          const data = await response.json();
          if (data?.enabled) {
            setBanner(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch promo banner:', error);
      }
    }
    fetchBanner();
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('promo_banner_dismissed', 'true');
  };

  if (!banner || !isVisible) return null;

  const content = (
    <>
      <span>{banner.text}</span>
      {banner.linkText && banner.link && (
        <Link 
          to={banner.link}
          className="ml-2 underline hover:no-underline font-medium"
        >
          {banner.linkText}
        </Link>
      )}
    </>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative overflow-hidden"
        style={{ 
          backgroundColor: banner.backgroundColor || '#10B981',
          color: banner.textColor || '#FFFFFF'
        }}
      >
        <div className="container py-2 text-center text-sm font-medium">
          {content}
        </div>
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
