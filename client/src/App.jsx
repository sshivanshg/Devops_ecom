import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { HomePage } from "./pages/HomePage";
import { ShopPage } from "./pages/ShopPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CartProvider } from "./components/cart/CartSheet";
import { NewsletterPopup } from "./components/marketing/NewsletterSignup";

/**
 * Main App component - Luxury Apparel E-commerce
 * Features routing for Home, Shop, and Product Detail pages
 */
function App() {
  return (
    <Router>
      <CartProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Navbar />
          
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
          </Routes>

          <Footer />
          
          {/* Newsletter Exit-Intent Popup */}
          <NewsletterPopup />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
