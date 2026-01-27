/**
 * PersonalizedView Component
 * Shows different content based on user role
 * 
 * Features:
 * - Role-based visibility
 * - VIP premium gold border styling
 * - New user first-purchase discount banner
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Sparkles, Gift } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

/**
 * Wrapper component that personalizes content based on user role
 * 
 * @param {Object} props
 * @param {Array<string>} props.allowedRoles - Roles allowed to see this content
 * @param {React.ReactNode} props.children - Content to display
 * @param {React.ReactNode} props.fallback - Content for non-allowed users
 * @param {boolean} props.showVIPBorder - Add gold border for VIP users
 * @param {boolean} props.showNewUserBanner - Show discount for new users
 * @param {string} props.className - Additional classes
 */
export function PersonalizedView({
  allowedRoles,
  children,
  fallback = null,
  showVIPBorder = false,
  showNewUserBanner = false,
  className,
}) {
  const { user, hasRole, isVIP, isNewUser } = useAuth();

  // Check if user has permission
  const hasPermission = !allowedRoles || allowedRoles.length === 0 || hasRole(allowedRoles);

  if (!hasPermission) {
    return fallback;
  }

  const isVipUser = isVIP();
  const isNew = isNewUser();

  return (
    <div className={cn('relative', className)}>
      {/* VIP Premium Border */}
      {showVIPBorder && isVipUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 opacity-75 blur-sm"
          style={{
            background: 'linear-gradient(90deg, #F59E0B, #FBBF24, #F59E0B)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s linear infinite',
          }}
        />
      )}

      {/* Content Container */}
      <div
        className={cn(
          'relative',
          showVIPBorder && isVipUser && 'bg-background rounded-lg'
        )}
      >
        {/* New User Banner */}
        <AnimatePresence>
          {showNewUserBanner && isNew && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <NewUserBanner />
            </motion.div>
          )}
        </AnimatePresence>

        {/* VIP Badge */}
        {showVIPBorder && isVipUser && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-3 -right-3 z-10"
          >
            <VIPBadge />
          </motion.div>
        )}

        {children}
      </div>
    </div>
  );
}

/**
 * VIP Badge component
 */
export function VIPBadge({ className }) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 px-3 py-1',
        'bg-gradient-to-r from-amber-500 to-yellow-500',
        'text-zinc-900 text-xs font-semibold tracking-wide',
        'rounded-full shadow-lg',
        className
      )}
    >
      <Crown className="w-3 h-3" />
      <span>VIP</span>
    </div>
  );
}

/**
 * New User Discount Banner
 */
export function NewUserBanner({ discount = '10%' }) {
  return (
    <motion.div
      initial={{ y: -10 }}
      animate={{ y: 0 }}
      className={cn(
        'flex items-center justify-center gap-2 py-2 px-4',
        'bg-gradient-to-r from-emerald-500 to-teal-500',
        'text-white text-sm font-medium'
      )}
    >
      <Gift className="w-4 h-4" />
      <span>Welcome! Enjoy {discount} off your first purchase</span>
      <Sparkles className="w-4 h-4" />
    </motion.div>
  );
}

/**
 * VIP-only content wrapper
 */
export function VIPOnly({ children, fallback = null }) {
  return (
    <PersonalizedView allowedRoles={['VIP', 'ADMIN']} fallback={fallback}>
      {children}
    </PersonalizedView>
  );
}

/**
 * Admin-only content wrapper
 */
export function AdminOnly({ children, fallback = null }) {
  return (
    <PersonalizedView allowedRoles={['ADMIN']} fallback={fallback}>
      {children}
    </PersonalizedView>
  );
}

/**
 * Logged-in users only
 */
export function AuthenticatedOnly({ children, fallback = null }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return fallback;
  }

  return children;
}

/**
 * Guests only (not logged in)
 */
export function GuestOnly({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return null;
  }

  return children;
}

// Add shimmer animation to global CSS
const shimmerStyle = document.createElement('style');
shimmerStyle.textContent = `
  @keyframes shimmer {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }
`;
if (typeof document !== 'undefined' && !document.getElementById('shimmer-style')) {
  shimmerStyle.id = 'shimmer-style';
  document.head.appendChild(shimmerStyle);
}

export default PersonalizedView;
