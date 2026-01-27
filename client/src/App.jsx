import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { HomePage } from "./pages/HomePage";
import { ShopPage } from "./pages/ShopPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { CartProvider } from "./components/cart/CartSheet";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NewsletterPopup } from "./components/marketing/NewsletterSignup";

/**
 * Protected Route wrapper for admin-only pages
 */
function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-pulse text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/?auth=login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

/**
 * Main App component - Luxury Apparel E-commerce
 * Features routing for Home, Shop, Product Detail, and Admin pages
 */
function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hide Navbar on admin routes */}
      {!isAdminRoute && <Navbar />}
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* Admin Routes - Protected */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
      </Routes>

      {/* Hide Footer on admin routes */}
      {!isAdminRoute && <Footer />}
      
      {/* Newsletter Exit-Intent Popup (only on public routes) */}
      {!isAdminRoute && <NewsletterPopup />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
