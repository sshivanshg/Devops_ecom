/**
 * Recommended Products Section
 * Displays personalized product recommendations based on user preferences
 * Uses MongoDB Aggregation Pipeline for scoring
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Palette, Ruler, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../products/ProductCard';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { Dialog, DialogContent } from '../ui/Dialog';
import { StyleQuiz } from '../personalization/StyleQuiz';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

/**
 * Style Discovery Banner for guests
 * High-end CTA to take the style quiz
 */
function StyleDiscoveryBanner({ onStartQuiz }) {
  return (
    <section className="py-20 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span>Style Discovery</span>
            </motion.div>

            {/* Heading */}
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-zinc-100 mb-6 leading-tight">
              Your Personal
              <br />
              <span className="italic text-emerald-400">Style Curator</span>
            </h2>

            <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Answer 5 quick questions and unlock a personalized shopping experience.
              We'll curate pieces that match your unique aesthetic.
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <FeatureCard
                icon={Palette}
                title="Style Matching"
                description="From minimalist to streetwear"
                delay={0.3}
              />
              <FeatureCard
                icon={Ruler}
                title="Perfect Fit"
                description="Tailored to your preferences"
                delay={0.4}
              />
              <FeatureCard
                icon={Heart}
                title="Curated Picks"
                description="Hand-selected just for you"
                delay={0.5}
              />
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <Button
                size="lg"
                onClick={onStartQuiz}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 group"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Discover Your Style
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, description, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="p-6 bg-zinc-800/30 border border-zinc-700/50 rounded-xl"
    >
      <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-emerald-400" />
      </div>
      <h3 className="font-medium text-zinc-100 mb-1">{title}</h3>
      <p className="text-sm text-zinc-500">{description}</p>
    </motion.div>
  );
}

/**
 * Main Recommended Products Section
 */
export function RecommendedProducts() {
  const { user, isAuthenticated, getAuthHeaders } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [reason, setReason] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);

  const hasCompletedQuiz = user?.preferences?.hasCompletedQuiz;

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const headers = isAuthenticated ? getAuthHeaders() : {};
        const response = await fetch('/api/products/recommended', { headers });
        
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
          setIsPersonalized(data.personalized || false);
          setReason(data.reason || null);
        }
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [isAuthenticated, getAuthHeaders, user?.preferences]);

  // Show Style Discovery banner for guests or users without quiz
  if (!loading && !isAuthenticated) {
    return (
      <>
        <StyleDiscoveryBanner onStartQuiz={() => setShowQuizModal(true)} />
        
        {/* Quiz Modal for guests - prompts login */}
        <Dialog open={showQuizModal} onOpenChange={setShowQuizModal}>
          <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
            <div className="text-center py-6">
              <Sparkles className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-xl font-serif text-zinc-100 mb-2">
                Create Your Style Profile
              </h3>
              <p className="text-zinc-400 mb-6">
                Sign in to save your preferences and get personalized recommendations.
              </p>
              <div className="space-y-3">
                <Button 
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                  onClick={() => {
                    setShowQuizModal(false);
                    // Trigger auth modal in parent
                    window.dispatchEvent(new CustomEvent('open-auth-modal'));
                  }}
                >
                  Sign In to Continue
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-zinc-700"
                  onClick={() => setShowQuizModal(false)}
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Show Style Discovery for logged-in users without quiz
  if (!loading && isAuthenticated && !hasCompletedQuiz) {
    return (
      <>
        <StyleDiscoveryBanner onStartQuiz={() => setShowQuizModal(true)} />
        
        {/* Quiz Modal */}
        <Dialog open={showQuizModal} onOpenChange={setShowQuizModal}>
          <DialogContent className="sm:max-w-2xl bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
            <StyleQuiz
              onComplete={() => {
                setShowQuizModal(false);
                // Refetch recommendations
                window.location.reload();
              }}
              onClose={() => setShowQuizModal(false)}
            />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Don't show if no products after quiz
  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-zinc-950">
      <div className="container px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12"
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className={cn(
                "w-5 h-5",
                isPersonalized ? "text-emerald-400" : "text-zinc-500"
              )} />
              <span className={cn(
                "text-sm font-medium tracking-wide",
                isPersonalized ? "text-emerald-400" : "text-zinc-500"
              )}>
                {isPersonalized ? 'Curated for You' : 'Our Picks'}
              </span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-zinc-100 mb-2">
              {isPersonalized ? 'Recommended for You' : 'Featured Selection'}
            </h2>
            <p className="text-zinc-400 max-w-xl">
              {isPersonalized && reason ? (
                <>Based on {reason}</>
              ) : (
                'Handpicked pieces from our latest collection'
              )}
            </p>
          </div>

          <Link to="/shop" className="mt-6 md:mt-0">
            <Button variant="outline" className="border-zinc-700 group">
              View All
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[3/4] w-full bg-zinc-800" />
                <Skeleton className="h-4 w-3/4 bg-zinc-800" />
                <Skeleton className="h-4 w-1/4 bg-zinc-800" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product, index) => (
              <motion.div
                key={product.id || product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard 
                  product={product} 
                  showMatchReason={isPersonalized}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default RecommendedProducts;
