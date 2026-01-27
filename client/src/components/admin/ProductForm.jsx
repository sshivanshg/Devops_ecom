/**
 * ProductForm Component
 * Industry-standard product creation form with dynamic variant management
 * Uses react-hook-form with zod validation
 */

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Loader2, Package, Image as ImageIcon,
  Palette, Ruler, Tags, Info, X, Cloud
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle 
} from '../ui/Dialog';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { ProductImageUpload } from './ProductImageUpload';
import { extractPublicId } from '../../lib/cloudinary';

// Validation schema
const variantSchema = z.object({
  size: z.string().min(1, 'Size is required'),
  color: z.string().min(1, 'Color is required'),
  colorValue: z.string().default('#1A1A1A'),
  stock: z.number().min(0, 'Stock must be 0 or more'),
  price: z.number().nullable().optional(),
});

// Image can be a URL string or an object with url and publicId
const imageSchema = z.union([
  z.string().url(),
  z.object({
    url: z.string().url(),
    publicId: z.string().nullable().optional(),
    width: z.number().nullable().optional(),
    height: z.number().nullable().optional(),
  })
]);

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  originalPrice: z.number().nullable().optional(),
  category: z.string().min(1, 'Category is required'),
  images: z.array(imageSchema).min(1, 'At least one image is required'),
  variants: z.array(variantSchema).min(1, 'At least one variant is required'),
  metadata: z.object({
    fabric: z.string().optional(),
    fitType: z.string().optional(),
    careInstructions: z.string().optional(),
    madeIn: z.string().optional(),
  }).optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  isFeatured: z.boolean().default(false),
});

const CATEGORIES = ['Outerwear', 'Tops', 'Bottoms', 'Knitwear', 'Accessories'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', 'One Size'];
const FIT_TYPES = ['Slim', 'Regular', 'Relaxed', 'Oversized', 'Tailored'];
const PRESET_COLORS = [
  { name: 'Black', value: '#1A1A1A' },
  { name: 'White', value: '#FAFAFA' },
  { name: 'Navy', value: '#1B2838' },
  { name: 'Charcoal', value: '#36454F' },
  { name: 'Camel', value: '#C19A6B' },
  { name: 'Cream', value: '#FFFDD0' },
  { name: 'Olive', value: '#556B2F' },
  { name: 'Burgundy', value: '#722F37' },
];

export function ProductForm({ open, onOpenChange, onSuccess, editProduct = null }) {
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!editProduct;

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: editProduct ? {
      name: editProduct.name,
      description: editProduct.description || '',
      price: editProduct.price,
      originalPrice: editProduct.originalPrice,
      category: editProduct.category,
      images: editProduct.images || [],
      variants: editProduct.variants || editProduct.inventory || [],
      metadata: editProduct.metadata || {},
      status: editProduct.status || 'draft',
      isFeatured: editProduct.isFeatured || false,
    } : {
      name: '',
      description: '',
      price: 0,
      originalPrice: null,
      category: 'Tops',
      images: [],
      variants: [{ size: 'M', color: 'Black', colorValue: '#1A1A1A', stock: 10, price: null }],
      metadata: { fabric: '', fitType: 'Regular', careInstructions: '', madeIn: '' },
      status: 'draft',
      isFeatured: false,
    }
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants'
  });

  const images = watch('images') || [];
  const status = watch('status');

  const addVariantRow = () => {
    appendVariant({ size: 'M', color: 'Black', colorValue: '#1A1A1A', stock: 10, price: null });
  };

  const generateVariantsFromSizesColors = (selectedSizes, selectedColors) => {
    const newVariants = [];
    for (const size of selectedSizes) {
      for (const color of selectedColors) {
        newVariants.push({
          size,
          color: color.name,
          colorValue: color.value,
          stock: 10,
          price: null
        });
      }
    }
    setValue('variants', newVariants);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      // Generate SKUs for variants
      const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const variantsWithSku = data.variants.map(v => ({
        ...v,
        sku: `${slug.toUpperCase().substring(0, 3)}-${v.size}-${v.color.toUpperCase().replace(/\s/g, '').substring(0, 3)}`
      }));

      // Process images - extract URLs and publicIds for Cloudinary
      const processedImages = data.images.map(img => {
        if (typeof img === 'string') {
          return { url: img, publicId: extractPublicId(img) };
        }
        return img;
      });

      const productData = {
        ...data,
        images: processedImages.map(img => img.url), // Store URLs in images array
        imagePublicIds: processedImages.map(img => img.publicId).filter(Boolean), // Store publicIds separately
        variants: variantsWithSku,
        isActive: data.status === 'published',
      };

      const url = isEditing 
        ? `/api/admin/products/${editProduct.id}`
        : '/api/admin/products';
      
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save product');
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif text-zinc-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            {isEditing ? 'Edit Product' : 'Create New Product'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* Basic Info Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <Info className="w-4 h-4" /> Basic Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm text-zinc-400">Product Name *</label>
                <Input
                  {...register('name')}
                  className="mt-1 bg-zinc-800 border-zinc-700"
                  placeholder="Oversized Wool Coat"
                />
                {errors.name && (
                  <p className="text-rose-400 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="col-span-2">
                <label className="text-sm text-zinc-400">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="mt-1 w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm"
                  placeholder="A masterfully tailored coat..."
                />
              </div>

              <div>
                <label className="text-sm text-zinc-400">Price *</label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  className="mt-1 bg-zinc-800 border-zinc-700"
                  placeholder="299.00"
                />
                {errors.price && (
                  <p className="text-rose-400 text-xs mt-1">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-zinc-400">Original Price (for sale)</label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('originalPrice', { valueAsNumber: true })}
                  className="mt-1 bg-zinc-800 border-zinc-700"
                  placeholder="399.00"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-400">Category *</label>
                <select
                  {...register('category')}
                  className="mt-1 w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-zinc-400">Status</label>
                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setValue('status', 'draft')}
                    className={cn(
                      'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors',
                      status === 'draft'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    )}
                  >
                    Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('status', 'published')}
                    className={cn(
                      'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors',
                      status === 'published'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    )}
                  >
                    Published
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Images Section - Cloudinary Upload */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <Cloud className="w-4 h-4" /> Product Images
              <span className="text-xs text-emerald-400">(CDN Optimized)</span>
            </h3>
            
            <ProductImageUpload
              value={images}
              onChange={(newImages) => setValue('images', newImages)}
              maxImages={10}
              folder="atelier/products"
            />
            
            {errors.images && (
              <p className="text-rose-400 text-xs">{errors.images.message}</p>
            )}
          </section>

          {/* Variants Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <Ruler className="w-4 h-4" /> Variants (Size × Color × Stock)
              </h3>
              <Button
                type="button"
                onClick={addVariantRow}
                variant="outline"
                size="sm"
                className="border-zinc-700"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Variant
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              <AnimatePresence>
                {variantFields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-12 gap-2 items-center bg-zinc-800/50 p-3 rounded-lg"
                  >
                    <div className="col-span-2">
                      <select
                        {...register(`variants.${index}.size`)}
                        className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-100"
                      >
                        {SIZES.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3">
                      <select
                        {...register(`variants.${index}.color`)}
                        onChange={(e) => {
                          const color = PRESET_COLORS.find(c => c.name === e.target.value);
                          if (color) {
                            setValue(`variants.${index}.colorValue`, color.value);
                          }
                        }}
                        className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-100"
                      >
                        {PRESET_COLORS.map(color => (
                          <option key={color.name} value={color.name}>{color.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          {...register(`variants.${index}.colorValue`)}
                          className="w-8 h-8 rounded cursor-pointer border-0"
                        />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <Input
                        type="number"
                        {...register(`variants.${index}.stock`, { valueAsNumber: true })}
                        className="bg-zinc-800 border-zinc-700 text-sm"
                        placeholder="Stock"
                        min="0"
                      />
                    </div>

                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`variants.${index}.price`, { valueAsNumber: true })}
                        className="bg-zinc-800 border-zinc-700 text-sm"
                        placeholder="Override $"
                      />
                    </div>

                    <div className="col-span-1">
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        disabled={variantFields.length === 1}
                        className="p-2 text-zinc-500 hover:text-rose-400 disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {errors.variants && (
              <p className="text-rose-400 text-xs">{errors.variants.message}</p>
            )}

            <p className="text-xs text-zinc-500">
              Total variants: {variantFields.length} | 
              Total stock: {variantFields.reduce((sum, _, i) => sum + (watch(`variants.${i}.stock`) || 0), 0)}
            </p>
          </section>

          {/* Metadata Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <Tags className="w-4 h-4" /> Product Details
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-400">Fabric / Material</label>
                <Input
                  {...register('metadata.fabric')}
                  className="mt-1 bg-zinc-800 border-zinc-700"
                  placeholder="100% Organic Cotton"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-400">Fit Type</label>
                <select
                  {...register('metadata.fitType')}
                  className="mt-1 w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
                >
                  {FIT_TYPES.map(fit => (
                    <option key={fit} value={fit}>{fit}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-zinc-400">Care Instructions</label>
                <Input
                  {...register('metadata.careInstructions')}
                  className="mt-1 bg-zinc-800 border-zinc-700"
                  placeholder="Machine wash cold"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-400">Made In</label>
                <Input
                  {...register('metadata.madeIn')}
                  className="mt-1 bg-zinc-800 border-zinc-700"
                  placeholder="Italy"
                />
              </div>
            </div>
          </section>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-zinc-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ProductForm;
