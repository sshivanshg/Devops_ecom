import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Crown, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import { Dialog, DialogContent } from "../ui/Dialog";
import { Skeleton } from "../ui/Skeleton";
import { useAuth } from "../../contexts/AuthContext";
import { VIPOnly, GuestOnly, AuthenticatedOnly, NewUserBanner } from "../personalization/PersonalizedView";
import { StyleQuiz } from "../personalization/StyleQuiz";
import { AuthModal } from "../personalization/AuthModal";

/**
 * Full-viewport editorial hero section with video background.
 * Features elegant typography and animated call-to-action.
 * 
 * Dynamic content loaded from /api/config/hero
 * 
 * Personalization:
 * - VIP users see "Private Sale" button instead of standard CTA
 * - New users see welcome discount banner
 * - Logged-out users see sign-in prompt
 */
export function HeroSection() {
  const { user, isVIP, isNewUser } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const hasCompletedQuiz = user?.preferences?.hasCompletedQuiz;

  // Fetch hero config from API
  useEffect(() => {
    async function fetchHeroConfig() {
      try {
        const response = await fetch('/api/config/hero');
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
        }
      } catch (error) {
        console.error('Failed to fetch hero config:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHeroConfig();
  }, []);

  // Default values while loading or if API fails
  const heroText = config?.heroText || 'Redefine Elegance';
  const heroSubtitle = config?.heroSubtitle || 'Discover our curated collection of minimalist luxury. Timeless pieces crafted for the modern individual.';
  const heroImage = config?.heroImage || 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&q=80';
  const heroVideo = config?.heroVideo || 'https://videos.pexels.com/video-files/3831776/3831776-hd_1920_1080_25fps.mp4';
  const seasonTag = config?.seasonTag || 'Spring/Summer 2026';
  const ctaText = config?.ctaText || 'Shop the Collection';
  const ctaLink = config?.ctaLink || '/shop';

  // Split hero text for styling (first word normal, rest italic)
  const heroWords = heroText.split(' ');
  const firstWord = heroWords[0];
  const restWords = heroWords.slice(1).join(' ');

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster={heroImage}
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]" />
      </div>

      {/* New User Welcome Banner */}
      <AuthenticatedOnly>
        {isNewUser() && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-0 left-0 right-0 z-20"
          >
            <NewUserBanner discount="10%" />
          </motion.div>
        )}
      </AuthenticatedOnly>

      {/* VIP Badge floating indicator */}
      <VIPOnly>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute top-24 right-6 z-20"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full shadow-xl">
            <Crown className="w-4 h-4 text-zinc-900" />
            <span className="text-sm font-semibold text-zinc-900">VIP Member</span>
          </div>
        </motion.div>
      </VIPOnly>

      {/* Content */}
      <div className="relative z-10 container text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <span className="inline-block text-sm tracking-[0.3em] text-gray-300 uppercase mb-4">
            {seasonTag}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl tracking-tight mb-8 text-balance"
        >
          {loading ? (
            <Skeleton className="h-24 w-96 mx-auto bg-zinc-800/50" />
          ) : (
            <>
              {firstWord}
              {restWords && (
                <>
                  <br />
                  <span className="italic font-light">{restWords}</span>
                </>
              )}
            </>
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          {heroSubtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* VIP: Private Sale Button */}
          <VIPOnly>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/shop?filter=sale">
                <Button size="lg" className="group bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-900 hover:from-amber-400 hover:to-yellow-400">
                  <Crown className="mr-2 w-5 h-5" />
                  Access Private Sale
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
          </VIPOnly>

          {/* Non-VIP: Standard Shop Button */}
          {!isVIP() && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to={ctaLink}>
                <Button size="lg" className="group">
                  {ctaText}
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
          )}

          {/* Logged in but no quiz: Style Quiz CTA */}
          <AuthenticatedOnly>
            {!hasCompletedQuiz && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowQuizModal(true)}
                  className="group"
                >
                  <Sparkles className="mr-2 w-5 h-5 text-emerald-400" />
                  Discover Your Style
                </Button>
              </motion.div>
            )}
          </AuthenticatedOnly>

          {/* Not logged in: View Lookbook + Sign In */}
          <GuestOnly>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowAuthModal(true)}
              >
                Sign In for Perks
              </Button>
            </motion.div>
          </GuestOnly>

          {/* Always show View Lookbook for logged-in VIP users */}
          <VIPOnly>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/lookbook">
                <Button variant="outline" size="lg">
                  View Lookbook
                </Button>
              </Link>
            </motion.div>
          </VIPOnly>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs tracking-[0.2em] uppercase text-gray-400">
            Scroll
          </span>
          <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>
      </motion.div>

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />

      {/* Style Quiz Modal */}
      <Dialog open={showQuizModal} onOpenChange={setShowQuizModal}>
        <DialogContent className="sm:max-w-2xl bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
          <StyleQuiz
            onComplete={() => setShowQuizModal(false)}
            onClose={() => setShowQuizModal(false)}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}
