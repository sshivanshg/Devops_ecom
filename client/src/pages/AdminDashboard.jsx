/**
 * Admin Dashboard
 * Protected admin-only area with full management capabilities
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Package, ShoppingBag, Crown, DollarSign,
  TrendingUp, TrendingDown, Settings, LogOut, BarChart3, Home,
  ChevronRight, Eye, EyeOff, Edit, Trash2, Plus, Calendar,
  Check, X, Loader2, Image as ImageIcon, AlertCircle, Layers, Boxes
} from 'lucide-react';
import { Link, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from '../components/ui/Dialog';
import { useAuth } from '../contexts/AuthContext';
import { Skeleton } from '../components/ui/Skeleton';
import { cn } from '../lib/utils';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { InventoryTable } from '../components/admin/InventoryTable';
import { ProductForm } from '../components/admin/ProductForm';

// ============================================
// SIDEBAR NAVIGATION
// ============================================

function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: BarChart3, end: true },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Inventory', path: '/admin/inventory', icon: Boxes },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-800">
        <Link to="/" className="font-serif text-2xl text-zinc-100">
          ATELIER
        </Link>
        <p className="text-xs text-zinc-500 mt-1">Admin Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
              isActive 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
            <span className="text-white font-medium">
              {user?.name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-100 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-zinc-700"
            asChild
          >
            <Link to="/">
              <Home className="w-4 h-4 mr-1" />
              Store
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-zinc-700 text-red-400 hover:text-red-300"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

// ============================================
// STAT CARD COMPONENT
// ============================================

function StatCard({ title, value, icon: Icon, trend, trendValue, color, prefix = '' }) {
  const isPositive = trendValue >= 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-400">{title}</p>
          <p className="text-3xl font-semibold text-zinc-100 mt-2">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {(trend || trendValue !== undefined) && (
            <p className={cn(
              "text-sm mt-2 flex items-center gap-1",
              isPositive ? "text-emerald-400" : "text-rose-400"
            )}>
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trend || `${isPositive ? '+' : ''}${trendValue?.toFixed(1)}%`}
            </p>
          )}
        </div>
        <div className={cn(
          'w-12 h-12 rounded-lg flex items-center justify-center',
          color || 'bg-emerald-500/10'
        )}>
          <Icon className={cn(
            'w-6 h-6',
            color ? 'text-white' : 'text-emerald-400'
          )} />
        </div>
      </div>
    </motion.div>
  );
}

// Custom tooltip for charts
function ChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl">
        <p className="text-zinc-400 text-sm">{format(parseISO(label), 'MMM d, yyyy')}</p>
        <p className="text-emerald-400 font-semibold">
          ${payload[0].value.toLocaleString()}
        </p>
        <p className="text-zinc-500 text-xs">{payload[1]?.value} orders</p>
      </div>
    );
  }
  return null;
}

// ============================================
// DASHBOARD OVERVIEW WITH ANALYTICS
// ============================================

function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getAuthHeaders } = useAuth();

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          fetch('/api/admin/stats', { headers: getAuthHeaders() }),
          fetch('/api/admin/analytics?days=30', { headers: getAuthHeaders() })
        ]);
        
        if (statsRes.ok) setStats(await statsRes.json());
        if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [getAuthHeaders]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 bg-zinc-800" />
          ))}
        </div>
        <Skeleton className="h-80 bg-zinc-800" />
      </div>
    );
  }

  const statusColors = {
    pending: 'bg-amber-500/10 text-amber-400',
    processing: 'bg-blue-500/10 text-blue-400',
    shipped: 'bg-indigo-500/10 text-indigo-400',
    delivered: 'bg-emerald-500/10 text-emerald-400',
    cancelled: 'bg-red-500/10 text-red-400',
  };

  return (
    <div className="space-y-8">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenue (30d)"
          value={analytics?.kpis?.totalRevenue || 0}
          prefix="$"
          icon={DollarSign}
          trendValue={analytics?.kpis?.revenueGrowth}
        />
        <StatCard
          title="Orders (30d)"
          value={analytics?.kpis?.totalOrders || 0}
          icon={ShoppingBag}
          trendValue={analytics?.kpis?.orderGrowth}
          color="bg-indigo-500/10"
        />
        <StatCard
          title="Avg Order Value"
          value={analytics?.kpis?.averageOrderValue || 0}
          prefix="$"
          icon={BarChart3}
          color="bg-amber-500/10"
        />
        <StatCard
          title="Active Customers"
          value={analytics?.kpis?.activeCustomers || 0}
          icon={Users}
          color="bg-emerald-500/10"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-zinc-100">Revenue Over Time</h3>
            <p className="text-sm text-zinc-500">Last 30 days</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-zinc-100">
              ${analytics?.kpis?.totalRevenue?.toLocaleString() || 0}
            </p>
            <p className={cn(
              "text-sm flex items-center justify-end gap-1",
              analytics?.kpis?.revenueGrowth >= 0 ? "text-emerald-400" : "text-rose-400"
            )}>
              {analytics?.kpis?.revenueGrowth >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {analytics?.kpis?.revenueGrowth?.toFixed(1)}% vs previous period
            </p>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics?.revenueData || []}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                tickFormatter={(date) => format(parseISO(date), 'MMM d')}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#6B7280"
                tickFormatter={(val) => `$${val.toLocaleString()}`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
              <Area
                type="monotone"
                dataKey="orders"
                stroke="#6366F1"
                strokeWidth={1}
                fill="transparent"
                opacity={0}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-zinc-100">Top Selling Products</h3>
            <Link to="/admin/products" className="text-sm text-emerald-400 hover:text-emerald-300">
              View All
            </Link>
          </div>

          {analytics?.topProducts?.length > 0 ? (
            <div className="space-y-4">
              {analytics.topProducts.map((product, idx) => (
                <div key={product.id || idx} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-zinc-700 overflow-hidden flex-shrink-0">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-zinc-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-100 font-medium truncate">{product.name}</p>
                    <p className="text-sm text-zinc-400">{product.unitsSold} sold</p>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-100 font-medium">${product.revenue?.toLocaleString()}</p>
                    <p className={cn(
                      "text-xs",
                      product.currentStock > 10 ? "text-zinc-500" : 
                      product.currentStock > 0 ? "text-amber-400" : "text-rose-400"
                    )}>
                      {product.currentStock} in stock
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-center py-8">No sales data yet</p>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-zinc-100">Recent Orders</h3>
            <Link to="/admin/orders" className="text-sm text-emerald-400 hover:text-emerald-300">
              View All
            </Link>
          </div>

          {stats?.recentOrders?.length > 0 ? (
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b border-zinc-700/50 last:border-0">
                  <div>
                    <p className="text-zinc-100 font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-zinc-400">{order.user?.name || 'Unknown'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-100">${order.totalAmount?.toFixed(2)}</p>
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      statusColors[order.status] || 'bg-zinc-700 text-zinc-300'
                    )}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-center py-8">No recent orders</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// PRODUCTS MANAGEMENT
// ============================================

function ProductsManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showInventory, setShowInventory] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { getAuthHeaders } = useAuth();

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [getAuthHeaders]);

  const toggleActive = async (productId, currentStatus) => {
    setUpdating(productId);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        setProducts(products.map(p => 
          p.id === productId ? { ...p, isActive: !currentStatus } : p
        ));
      }
    } catch (error) {
      console.error('Failed to update product:', error);
    } finally {
      setUpdating(null);
    }
  };

  const isScheduled = (product) => {
    return product.publishAt && new Date(product.publishAt) > new Date();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 bg-zinc-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif text-zinc-100">Product Matrix</h2>
        <div className="flex items-center gap-3">
          <Link to="/admin/inventory" className="text-sm text-zinc-400 hover:text-zinc-100 flex items-center gap-1">
            <Boxes className="w-4 h-4" />
            Stock Center
          </Link>
          <Button 
            onClick={() => setShowProductForm(true)} 
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>
      
      {/* Industry-Standard Product Form */}
      <ProductForm 
        open={showProductForm} 
        onOpenChange={(open) => {
          setShowProductForm(open);
          if (!open) setEditingProduct(null);
        }}
        onSuccess={() => {
          fetchProducts();
          setEditingProduct(null);
        }}
        editProduct={editingProduct}
      />

      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="text-left p-4 text-sm font-medium text-zinc-400">Product</th>
              <th className="text-left p-4 text-sm font-medium text-zinc-400">Category</th>
              <th className="text-left p-4 text-sm font-medium text-zinc-400">Price</th>
              <th className="text-left p-4 text-sm font-medium text-zinc-400">Total Stock</th>
              <th className="text-left p-4 text-sm font-medium text-zinc-400">Status</th>
              <th className="text-center p-4 text-sm font-medium text-zinc-400">Active</th>
              <th className="text-right p-4 text-sm font-medium text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-zinc-700/50 last:border-0">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-zinc-700 overflow-hidden">
                      {product.images?.[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-zinc-500" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-zinc-100">{product.name}</p>
                      <p className="text-xs text-zinc-500">{product.slug}</p>
                      {isScheduled(product) && (
                        <p className="text-xs text-amber-400 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(product.publishAt), 'MMM d, h:mm a')}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4 text-zinc-300">{product.category}</td>
                <td className="p-4">
                  <span className="text-zinc-100">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-zinc-500 line-through ml-2 text-sm">
                      ${product.originalPrice}
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <span className={cn(
                    "font-medium",
                    product.stock > 20 ? "text-emerald-400" :
                    product.stock > 5 ? "text-amber-400" : "text-rose-400"
                  )}>
                    {product.stock}
                  </span>
                  {product.inventory?.length > 0 && (
                    <span className="text-xs text-zinc-500 ml-1">
                      ({product.inventory.length} variants)
                    </span>
                  )}
                </td>
                <td className="p-4">
                  {isScheduled(product) ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      scheduled
                    </span>
                  ) : product.status ? (
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      product.status === 'new' && 'bg-emerald-500/10 text-emerald-400',
                      product.status === 'sale' && 'bg-rose-500/10 text-rose-400',
                      product.status === 'limited' && 'bg-amber-500/10 text-amber-400'
                    )}>
                      {product.status}
                    </span>
                  ) : (
                    <span className="text-zinc-500">—</span>
                  )}
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => toggleActive(product.id, product.isActive)}
                    disabled={updating === product.id}
                    className={cn(
                      'w-10 h-6 rounded-full relative transition-colors',
                      product.isActive ? 'bg-emerald-500' : 'bg-zinc-600'
                    )}
                  >
                    {updating === product.id ? (
                      <Loader2 className="w-4 h-4 animate-spin absolute top-1 left-3" />
                    ) : (
                      <span className={cn(
                        'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                        product.isActive ? 'left-5' : 'left-1'
                      )} />
                    )}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => { 
                        setEditingProduct(product); 
                        setShowProductForm(true); 
                      }}
                      className="p-2 text-zinc-400 hover:text-emerald-400"
                      title="Edit Product"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setSelectedProduct(product); setShowInventory(true); }}
                      className="p-2 text-zinc-400 hover:text-zinc-100"
                      title="Inventory Matrix"
                    >
                      <Layers className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setSelectedProduct(product); setShowSchedule(true); }}
                      className="p-2 text-zinc-400 hover:text-zinc-100"
                      title="Schedule Publishing"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                    <Link 
                      to={`/products/${product.slug}`}
                      className="p-2 text-zinc-400 hover:text-zinc-100"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inventory Matrix Modal */}
      <InventoryMatrixModal 
        product={selectedProduct} 
        open={showInventory} 
        onOpenChange={setShowInventory}
        onUpdate={fetchProducts}
      />

      {/* Schedule Publishing Modal */}
      <SchedulePublishModal
        product={selectedProduct}
        open={showSchedule}
        onOpenChange={setShowSchedule}
        onUpdate={fetchProducts}
      />
    </div>
  );
}

// Inventory Matrix Modal
function InventoryMatrixModal({ product, open, onOpenChange, onUpdate }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(null);
  const { getAuthHeaders } = useAuth();

  useEffect(() => {
    if (product?.inventory) {
      setInventory(product.inventory);
    }
  }, [product]);

  const updateVariantStock = async (size, color, newStock) => {
    setUpdating(`${size}-${color}`);
    try {
      const response = await fetch(`/api/admin/products/${product.id}/inventory`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ size, color, stock: parseInt(newStock) })
      });

      if (response.ok) {
        const data = await response.json();
        setInventory(inv => inv.map(v => 
          v.size === size && v.color === color 
            ? { ...v, stock: parseInt(newStock) } 
            : v
        ));
        onUpdate?.();
      }
    } catch (error) {
      console.error('Failed to update inventory:', error);
    } finally {
      setUpdating(null);
    }
  };

  if (!product) return null;

  // Group inventory by size
  const sizes = [...new Set(inventory.map(v => v.size))];
  const colors = [...new Set(inventory.map(v => v.color))];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Inventory Matrix: {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="p-3 text-left text-zinc-400">Size / Color</th>
                {colors.map(color => (
                  <th key={color} className="p-3 text-center text-zinc-400">
                    <div className="flex flex-col items-center gap-1">
                      <div 
                        className="w-6 h-6 rounded-full border border-zinc-600"
                        style={{ backgroundColor: inventory.find(v => v.color === color)?.colorValue }}
                      />
                      <span className="text-xs">{color}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sizes.map(size => (
                <tr key={size} className="border-b border-zinc-700/50">
                  <td className="p-3 font-medium text-zinc-100">{size}</td>
                  {colors.map(color => {
                    const variant = inventory.find(v => v.size === size && v.color === color);
                    const isUpdating = updating === `${size}-${color}`;
                    
                    return (
                      <td key={`${size}-${color}`} className="p-3 text-center">
                        <input
                          type="number"
                          value={variant?.stock || 0}
                          onChange={(e) => updateVariantStock(size, color, e.target.value)}
                          disabled={isUpdating}
                          className={cn(
                            "w-16 p-2 text-center rounded bg-zinc-800 border",
                            variant?.stock > 10 ? "border-emerald-500/30 text-emerald-400" :
                            variant?.stock > 0 ? "border-amber-500/30 text-amber-400" : 
                            "border-rose-500/30 text-rose-400"
                          )}
                          min="0"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center pt-4 mt-4 border-t border-zinc-700">
          <p className="text-sm text-zinc-400">
            Total Stock: <span className="text-zinc-100 font-medium">
              {inventory.reduce((sum, v) => sum + (v.stock || 0), 0)}
            </span> units
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-emerald-500/30" /> 10+
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-amber-500/30" /> 1-10
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-rose-500/30" /> Out
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Schedule Publishing Modal
function SchedulePublishModal({ product, open, onOpenChange, onUpdate }) {
  const [publishAt, setPublishAt] = useState('');
  const [saving, setSaving] = useState(false);
  const { getAuthHeaders } = useAuth();

  useEffect(() => {
    if (product?.publishAt) {
      setPublishAt(format(new Date(product.publishAt), "yyyy-MM-dd'T'HH:mm"));
    } else {
      setPublishAt('');
    }
  }, [product]);

  const handleSchedule = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/products/${product.id}/schedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ publishAt: publishAt || null })
      });

      if (response.ok) {
        onUpdate?.();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Failed to schedule product:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleClearSchedule = async () => {
    setPublishAt('');
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/products/${product.id}/schedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ publishAt: null })
      });

      if (response.ok) {
        onUpdate?.();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Failed to clear schedule:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            Schedule Publishing
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p className="text-zinc-300">
            Schedule <span className="font-medium text-zinc-100">{product.name}</span> to go live at a specific time.
          </p>

          <div>
            <label className="text-sm text-zinc-400">Publish Date & Time</label>
            <Input
              type="datetime-local"
              value={publishAt}
              onChange={(e) => setPublishAt(e.target.value)}
              className="mt-1 bg-zinc-800 border-zinc-700"
              min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
            />
          </div>

          {product.publishAt && (
            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-amber-400">Currently Scheduled</p>
                <p className="text-xs text-zinc-400">
                  {format(new Date(product.publishAt), 'MMMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            {product.publishAt && (
              <Button
                variant="outline"
                onClick={handleClearSchedule}
                disabled={saving}
                className="flex-1 border-zinc-700 text-rose-400 hover:text-rose-300"
              >
                Clear Schedule
              </Button>
            )}
            <Button
              onClick={handleSchedule}
              disabled={saving || !publishAt}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-zinc-900"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {publishAt ? 'Schedule Drop' : 'Select a time'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Create Product Dialog
function CreateProductDialog({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Tops',
    images: ''
  });
  const { getAuthHeaders } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          ...formData,
          images: formData.images.split('\n').filter(Boolean)
        })
      });

      if (response.ok) {
        setOpen(false);
        setFormData({ name: '', price: '', category: 'Tops', images: '' });
        onCreated?.();
      }
    } catch (error) {
      console.error('Failed to create product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-500 hover:bg-emerald-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-sm text-zinc-400">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="mt-1 bg-zinc-800 border-zinc-700"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400">Price</label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              className="mt-1 bg-zinc-800 border-zinc-700"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="mt-1 w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100"
            >
              <option>Tops</option>
              <option>Bottoms</option>
              <option>Outerwear</option>
              <option>Knitwear</option>
              <option>Accessories</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-zinc-400">Image URLs (one per line)</label>
            <textarea
              value={formData.images}
              onChange={(e) => setFormData({ ...formData, images: e.target.value })}
              rows={3}
              className="mt-1 w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100"
              placeholder="https://..."
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Create Product
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// ORDERS MANAGEMENT
// ============================================

function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const { getAuthHeaders } = useAuth();

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch('/api/admin/orders', {
          headers: getAuthHeaders()
        });
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [getAuthHeaders]);

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setOrders(orders.map(o => 
          o.id === orderId ? { ...o, status: newStatus } : o
        ));
      }
    } catch (error) {
      console.error('Failed to update order:', error);
    } finally {
      setUpdating(null);
    }
  };

  const statusColors = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    processing: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    shipped: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 bg-zinc-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif text-zinc-100">Orders</h2>

      <div className="space-y-4">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-zinc-100">{order.orderNumber}</p>
                <p className="text-sm text-zinc-400 mt-1">
                  {order.user?.name} • {order.user?.email}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-zinc-100">
                  ${order.totalAmount?.toFixed(2)}
                </p>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  disabled={updating === order.id}
                  className={cn(
                    'mt-2 px-3 py-1 rounded-full text-sm border',
                    statusColors[order.status],
                    'bg-transparent cursor-pointer'
                  )}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-4 pt-4 border-t border-zinc-700/50">
              <p className="text-sm text-zinc-400 mb-2">Items:</p>
              <div className="space-y-2">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-300">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-zinc-400">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="mt-4 pt-4 border-t border-zinc-700/50">
                <p className="text-sm text-zinc-400 mb-1">Ship to:</p>
                <p className="text-sm text-zinc-300">
                  {order.shippingAddress.name}<br />
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// CUSTOMERS MANAGEMENT
// ============================================

function CustomersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getAuthHeaders } = useAuth();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/admin/users', {
          headers: getAuthHeaders()
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [getAuthHeaders]);

  const roleColors = {
    USER: 'bg-zinc-700 text-zinc-300',
    VIP: 'bg-amber-500/10 text-amber-400',
    ADMIN: 'bg-indigo-500/10 text-indigo-400',
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 bg-zinc-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif text-zinc-100">Customers</h2>

      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="text-left p-4 text-sm font-medium text-zinc-400">Customer</th>
              <th className="text-left p-4 text-sm font-medium text-zinc-400">Email</th>
              <th className="text-left p-4 text-sm font-medium text-zinc-400">Role</th>
              <th className="text-left p-4 text-sm font-medium text-zinc-400">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-zinc-700/50 last:border-0">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      user.role === 'VIP' ? 'bg-amber-500' : 
                      user.role === 'ADMIN' ? 'bg-indigo-500' : 'bg-zinc-600'
                    )}>
                      {user.role === 'VIP' ? (
                        <Crown className="w-5 h-5 text-zinc-900" />
                      ) : (
                        <span className="text-white font-medium">
                          {user.name?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-zinc-100">{user.name}</span>
                  </div>
                </td>
                <td className="p-4 text-zinc-300">{user.email}</td>
                <td className="p-4">
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-full',
                    roleColors[user.role]
                  )}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-zinc-400 text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// SITE SETTINGS
// ============================================

function SiteSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [heroData, setHeroData] = useState({
    heroText: '',
    heroSubtitle: '',
    heroImage: '',
    heroVideo: '',
    seasonTag: '',
    ctaText: '',
    ctaLink: ''
  });
  const [promoData, setPromoData] = useState({
    enabled: false,
    text: '',
    backgroundColor: '#10B981',
    textColor: '#FFFFFF',
    link: '',
    linkText: ''
  });
  const { getAuthHeaders } = useAuth();

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/admin/settings', {
          headers: getAuthHeaders()
        });
        if (response.ok) {
          const data = await response.json();
          if (data.hero) {
            setHeroData({
              heroText: data.hero.heroText || '',
              heroSubtitle: data.hero.heroSubtitle || '',
              heroImage: data.hero.heroImage || '',
              heroVideo: data.hero.heroVideo || '',
              seasonTag: data.hero.seasonTag || '',
              ctaText: data.hero.ctaText || '',
              ctaLink: data.hero.ctaLink || ''
            });
          }
          if (data.promo_banner) {
            setPromoData({
              enabled: data.promo_banner.enabled || false,
              text: data.promo_banner.text || '',
              backgroundColor: data.promo_banner.backgroundColor || '#10B981',
              textColor: data.promo_banner.textColor || '#FFFFFF',
              link: data.promo_banner.link || '',
              linkText: data.promo_banner.linkText || ''
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [getAuthHeaders]);

  const saveHero = async () => {
    setSaving('hero');
    try {
      await fetch('/api/admin/settings/hero', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(heroData)
      });
      alert('Hero settings saved!');
    } catch (error) {
      console.error('Failed to save hero:', error);
    } finally {
      setSaving(null);
    }
  };

  const savePromo = async () => {
    setSaving('promo');
    try {
      await fetch('/api/admin/settings/promo_banner', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(promoData)
      });
      alert('Promo banner saved!');
    } catch (error) {
      console.error('Failed to save promo:', error);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-12 bg-zinc-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif text-zinc-100">Site Settings</h2>

      {/* Promo Banner Settings */}
      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-zinc-100">Promotional Banner</h3>
            <p className="text-sm text-zinc-500">Announcement bar at the top of the site</p>
          </div>
          <button
            onClick={() => setPromoData({ ...promoData, enabled: !promoData.enabled })}
            className={cn(
              'w-12 h-7 rounded-full relative transition-colors',
              promoData.enabled ? 'bg-emerald-500' : 'bg-zinc-600'
            )}
          >
            <span className={cn(
              'absolute top-1 w-5 h-5 rounded-full bg-white transition-transform',
              promoData.enabled ? 'left-6' : 'left-1'
            )} />
          </button>
        </div>

        {promoData.enabled && (
          <>
            {/* Preview */}
            <div 
              className="mb-6 p-3 text-center text-sm font-medium rounded-lg"
              style={{ 
                backgroundColor: promoData.backgroundColor,
                color: promoData.textColor
              }}
            >
              {promoData.text || 'Your promo text here'} 
              {promoData.linkText && (
                <span className="ml-2 underline">{promoData.linkText}</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-sm text-zinc-400">Banner Text</label>
                <Input
                  value={promoData.text}
                  onChange={(e) => setPromoData({ ...promoData, text: e.target.value })}
                  className="mt-1 bg-zinc-800 border-zinc-700"
                  placeholder="FREE SHIPPING on orders over $200"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-400">Background Color</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    value={promoData.backgroundColor}
                    onChange={(e) => setPromoData({ ...promoData, backgroundColor: e.target.value })}
                    className="w-12 h-10 rounded border-0 cursor-pointer"
                  />
                  <Input
                    value={promoData.backgroundColor}
                    onChange={(e) => setPromoData({ ...promoData, backgroundColor: e.target.value })}
                    className="flex-1 bg-zinc-800 border-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-zinc-400">Text Color</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    value={promoData.textColor}
                    onChange={(e) => setPromoData({ ...promoData, textColor: e.target.value })}
                    className="w-12 h-10 rounded border-0 cursor-pointer"
                  />
                  <Input
                    value={promoData.textColor}
                    onChange={(e) => setPromoData({ ...promoData, textColor: e.target.value })}
                    className="flex-1 bg-zinc-800 border-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-zinc-400">Link URL (optional)</label>
                <Input
                  value={promoData.link}
                  onChange={(e) => setPromoData({ ...promoData, link: e.target.value })}
                  className="mt-1 bg-zinc-800 border-zinc-700"
                  placeholder="/shop"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-400">Link Text (optional)</label>
                <Input
                  value={promoData.linkText}
                  onChange={(e) => setPromoData({ ...promoData, linkText: e.target.value })}
                  className="mt-1 bg-zinc-800 border-zinc-700"
                  placeholder="Shop Now"
                />
              </div>
            </div>
          </>
        )}

        <div className="mt-6 flex justify-end">
          <Button 
            onClick={savePromo}
            disabled={saving === 'promo'}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            {saving === 'promo' && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Save Banner
          </Button>
        </div>
      </div>

      {/* Hero Section Settings */}
      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-6">
        <h3 className="text-lg font-medium text-zinc-100 mb-6">Hero Section</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-zinc-400">Hero Text</label>
            <Input
              value={heroData.heroText}
              onChange={(e) => setHeroData({ ...heroData, heroText: e.target.value })}
              className="mt-1 bg-zinc-800 border-zinc-700"
              placeholder="Redefine Elegance"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">Season Tag</label>
            <Input
              value={heroData.seasonTag}
              onChange={(e) => setHeroData({ ...heroData, seasonTag: e.target.value })}
              className="mt-1 bg-zinc-800 border-zinc-700"
              placeholder="Spring/Summer 2026"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-zinc-400">Hero Subtitle</label>
            <textarea
              value={heroData.heroSubtitle}
              onChange={(e) => setHeroData({ ...heroData, heroSubtitle: e.target.value })}
              rows={2}
              className="mt-1 w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100"
              placeholder="Discover our curated collection..."
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">Hero Image URL</label>
            <Input
              value={heroData.heroImage}
              onChange={(e) => setHeroData({ ...heroData, heroImage: e.target.value })}
              className="mt-1 bg-zinc-800 border-zinc-700"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">Hero Video URL</label>
            <Input
              value={heroData.heroVideo}
              onChange={(e) => setHeroData({ ...heroData, heroVideo: e.target.value })}
              className="mt-1 bg-zinc-800 border-zinc-700"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">CTA Button Text</label>
            <Input
              value={heroData.ctaText}
              onChange={(e) => setHeroData({ ...heroData, ctaText: e.target.value })}
              className="mt-1 bg-zinc-800 border-zinc-700"
              placeholder="Shop the Collection"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">CTA Button Link</label>
            <Input
              value={heroData.ctaLink}
              onChange={(e) => setHeroData({ ...heroData, ctaLink: e.target.value })}
              className="mt-1 bg-zinc-800 border-zinc-700"
              placeholder="/shop"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button 
            onClick={saveHero}
            disabled={saving === 'hero'}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            {saving === 'hero' && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Save Hero Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN ADMIN DASHBOARD
// ============================================

export function AdminDashboard() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <AdminSidebar />
      
      <main className="ml-64 p-8">
        <Routes>
          <Route index element={<DashboardOverview />} />
          <Route path="products" element={<ProductsManagement />} />
          <Route path="inventory" element={<InventoryTable />} />
          <Route path="orders" element={<OrdersManagement />} />
          <Route path="customers" element={<CustomersManagement />} />
          <Route path="settings" element={<SiteSettings />} />
        </Routes>
      </main>
    </div>
  );
}

export default AdminDashboard;
