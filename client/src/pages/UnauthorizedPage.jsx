/**
 * Unauthorized Page
 * Shown when a user tries to access a protected route without permission
 */

import { motion } from 'framer-motion';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-24 h-24 mx-auto mb-8 rounded-full bg-red-500/10 flex items-center justify-center"
        >
          <ShieldX className="w-12 h-12 text-red-400" />
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl font-serif text-zinc-100 mb-4">
          Access Denied
        </h1>

        {/* Description */}
        <p className="text-zinc-400 mb-8 leading-relaxed">
          You don't have permission to access this page. 
          This area is restricted to administrators only.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button className="w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="border-zinc-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Help text */}
        <p className="mt-8 text-sm text-zinc-500">
          If you believe this is an error, please contact support.
        </p>
      </motion.div>
    </main>
  );
}

export default UnauthorizedPage;
