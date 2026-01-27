/**
 * InventoryTable Component
 * Stock Command Center - Flattened view of all SKUs with inline editing
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Package, AlertTriangle, CheckCircle, 
  Loader2, RefreshCw, Filter
} from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

export function InventoryTable() {
  const { getAuthHeaders } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // all, low, out

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/inventory', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setInventory(data);
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const updateStock = async (sku, newStock) => {
    const stockValue = parseInt(newStock);
    if (isNaN(stockValue) || stockValue < 0) return;

    setUpdating(sku);
    try {
      const response = await fetch(`/api/admin/inventory/${encodeURIComponent(sku)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ stock: stockValue })
      });

      if (response.ok) {
        // Update local state
        setInventory(prev => prev.map(item => 
          item.sku === sku ? { ...item, stock: stockValue } : item
        ));
      }
    } catch (error) {
      console.error('Failed to update stock:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleStockChange = (sku, value) => {
    // Optimistic update for instant feedback
    setInventory(prev => prev.map(item => 
      item.sku === sku ? { ...item, stock: parseInt(value) || 0, _dirty: true } : item
    ));
  };

  const handleKeyDown = (e, sku, value) => {
    if (e.key === 'Enter') {
      e.target.blur();
      updateStock(sku, value);
    }
  };

  const handleBlur = (sku, value, isDirty) => {
    if (isDirty) {
      updateStock(sku, value);
    }
  };

  // Get unique categories
  const categories = [...new Set(inventory.map(i => i.category))].sort();

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    // Search filter
    const matchesSearch = search === '' || 
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.color.toLowerCase().includes(search.toLowerCase());

    // Category filter
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

    // Stock filter
    const matchesStock = 
      stockFilter === 'all' ||
      (stockFilter === 'low' && item.stock > 0 && item.stock <= 10) ||
      (stockFilter === 'out' && item.stock === 0);

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Calculate stats
  const totalSKUs = inventory.length;
  const outOfStock = inventory.filter(i => i.stock === 0).length;
  const lowStock = inventory.filter(i => i.stock > 0 && i.stock <= 10).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-zinc-100">Stock Command Center</h2>
          <p className="text-sm text-zinc-500">Manage inventory across all SKUs</p>
        </div>
        <Button onClick={fetchInventory} variant="outline" className="border-zinc-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Total SKUs</p>
              <p className="text-2xl font-semibold text-zinc-100">{totalSKUs}</p>
            </div>
            <Package className="w-8 h-8 text-zinc-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-800/50 border border-amber-500/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Low Stock</p>
              <p className="text-2xl font-semibold text-amber-400">{lowStock}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-amber-500/50" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-800/50 border border-rose-500/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Out of Stock</p>
              <p className="text-2xl font-semibold text-rose-400">{outOfStock}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-rose-500/50" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU, product name, color..."
            className="pl-10 bg-zinc-800 border-zinc-700"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
          <button
            onClick={() => setStockFilter('all')}
            className={cn(
              'px-3 py-1.5 rounded text-sm transition-colors',
              stockFilter === 'all' 
                ? 'bg-zinc-700 text-zinc-100' 
                : 'text-zinc-400 hover:text-zinc-100'
            )}
          >
            All
          </button>
          <button
            onClick={() => setStockFilter('low')}
            className={cn(
              'px-3 py-1.5 rounded text-sm transition-colors',
              stockFilter === 'low' 
                ? 'bg-amber-500/20 text-amber-400' 
                : 'text-zinc-400 hover:text-zinc-100'
            )}
          >
            Low Stock
          </button>
          <button
            onClick={() => setStockFilter('out')}
            className={cn(
              'px-3 py-1.5 rounded text-sm transition-colors',
              stockFilter === 'out' 
                ? 'bg-rose-500/20 text-rose-400' 
                : 'text-zinc-400 hover:text-zinc-100'
            )}
          >
            Out of Stock
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="text-left p-4 text-sm font-medium text-zinc-400">Product</th>
              <th className="text-left p-4 text-sm font-medium text-zinc-400">SKU</th>
              <th className="text-left p-4 text-sm font-medium text-zinc-400">Size</th>
              <th className="text-left p-4 text-sm font-medium text-zinc-400">Color</th>
              <th className="text-left p-4 text-sm font-medium text-zinc-400">Category</th>
              <th className="text-center p-4 text-sm font-medium text-zinc-400">Stock</th>
              <th className="text-center p-4 text-sm font-medium text-zinc-400">Status</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredInventory.map((item) => (
                <motion.tr
                  key={item.sku}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-b border-zinc-700/50 last:border-0 hover:bg-zinc-800/50"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-zinc-700 rounded flex items-center justify-center">
                          <Package className="w-5 h-5 text-zinc-500" />
                        </div>
                      )}
                      <span className="text-zinc-100 font-medium truncate max-w-[200px]">
                        {item.productName}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <code className="text-xs bg-zinc-700/50 px-2 py-1 rounded text-zinc-300">
                      {item.sku}
                    </code>
                  </td>
                  <td className="p-4 text-zinc-300">{item.size}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-zinc-600"
                        style={{ backgroundColor: item.colorValue }}
                      />
                      <span className="text-zinc-300">{item.color}</span>
                    </div>
                  </td>
                  <td className="p-4 text-zinc-400 text-sm">{item.category}</td>
                  <td className="p-4 text-center">
                    <div className="relative inline-flex items-center">
                      <input
                        type="number"
                        value={item.stock}
                        onChange={(e) => handleStockChange(item.sku, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, item.sku, e.target.value)}
                        onBlur={(e) => handleBlur(item.sku, e.target.value, item._dirty)}
                        min="0"
                        className={cn(
                          'w-20 p-2 text-center rounded border bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50',
                          item.stock === 0 
                            ? 'border-rose-500/50 text-rose-400' 
                            : item.stock <= 10 
                              ? 'border-amber-500/50 text-amber-400' 
                              : 'border-zinc-700 text-emerald-400'
                        )}
                      />
                      {updating === item.sku && (
                        <Loader2 className="absolute -right-6 w-4 h-4 animate-spin text-emerald-400" />
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {item.stock === 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-rose-500/10 text-rose-400">
                        <AlertTriangle className="w-3 h-3" />
                        Out
                      </span>
                    ) : item.stock <= 10 ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-400">
                        <AlertTriangle className="w-3 h-3" />
                        Low
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                        <CheckCircle className="w-3 h-3" />
                        In Stock
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {filteredInventory.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            No items match your filters
          </div>
        )}
      </div>

      <p className="text-xs text-zinc-500 text-center">
        Showing {filteredInventory.length} of {totalSKUs} SKUs • 
        Press Enter or click outside to save stock changes
      </p>
    </div>
  );
}

export default InventoryTable;
