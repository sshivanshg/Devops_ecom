/**
 * MongoDB Seed Script
 * Populates the database with 10 luxury fashion products and demo users
 * Includes inventory matrix, scheduled publishing, and analytics data
 * Run with: npm run db:seed
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

// Style categories for personalization
const STYLES = {
  MINIMALIST: 'minimalist',
  CLASSIC: 'classic',
  STREETWEAR: 'streetwear',
  ELEGANT: 'elegant',
  CASUAL: 'casual',
};

/**
 * Generate variants array from sizes and colors
 * Each variant has unique SKU and individual stock tracking
 * This is the industry-standard approach for fashion e-commerce
 */
function generateVariants(slug, sizes, colors, baseStock = 10) {
  const variants = [];
  for (const size of sizes) {
    for (const color of colors) {
      const sku = `${slug.toUpperCase().substring(0, 3)}-${size}-${color.name.toUpperCase().replace(/\s/g, '').substring(0, 3)}`;
      variants.push({
        sku,
        size,
        color: color.name,
        colorValue: color.value,
        stock: Math.floor(Math.random() * baseStock) + 5, // 5-15 units
        price: null, // null = use base price, or set variant-specific price
      });
    }
  }
  return variants;
}

/**
 * Generate product metadata
 */
function generateMetadata(category) {
  const fabricOptions = {
    'Outerwear': ['100% Italian Virgin Wool', '80% Wool, 20% Cashmere', '100% Cotton Canvas'],
    'Tops': ['100% Organic Cotton', '70% Cotton, 30% Silk', '100% Linen'],
    'Bottoms': ['98% Cotton, 2% Elastane', '100% Linen', '100% Tropical Wool'],
    'Knitwear': ['100% Cashmere', '100% Merino Wool', '50% Wool, 50% Alpaca'],
    'Accessories': ['100% Italian Leather', '100% Silk', 'Canvas with Leather Trim'],
  };
  
  const fitOptions = ['Relaxed', 'Regular', 'Slim', 'Oversized', 'Tailored'];
  
  const careOptions = [
    'Dry clean only',
    'Machine wash cold, hang dry',
    'Hand wash recommended',
    'Professional leather care only',
  ];

  const fabrics = fabricOptions[category] || fabricOptions['Tops'];
  
  return {
    fabric: fabrics[Math.floor(Math.random() * fabrics.length)],
    fitType: fitOptions[Math.floor(Math.random() * fitOptions.length)],
    careInstructions: careOptions[Math.floor(Math.random() * careOptions.length)],
    madeIn: ['Italy', 'Portugal', 'Japan', 'USA'][Math.floor(Math.random() * 4)],
  };
}

// Luxury product data
const products = [
  {
    slug: "oversized-wool-coat",
    name: "Oversized Wool Coat",
    description: "A masterfully tailored oversized coat crafted from premium Italian wool. Features a relaxed silhouette with dropped shoulders, notched lapels, and a two-button closure. Fully lined in silk for luxurious comfort.",
    price: 580,
    originalPrice: null,
    category: "Outerwear",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Charcoal", value: "#36454F" },
      { name: "Camel", value: "#C19A6B" },
      { name: "Navy", value: "#1B2838" }
    ],
    images: [
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1608063615781-e2ef8c73d114?w=800&h=1100&fit=crop"
    ],
    details: [
      "100% Italian virgin wool outer",
      "100% silk lining",
      "Two-button front closure",
      "Side welt pockets",
      "Interior chest pocket",
      "Dry clean only"
    ],
    styles: [STYLES.MINIMALIST, STYLES.ELEGANT],
    status: "new",
    isFeatured: true,
    isActive: true,
    stock: 50,
    publishAt: null, // Live immediately
  },
  {
    slug: "silk-blend-shirt",
    name: "Silk Blend Relaxed Shirt",
    description: "An effortlessly elegant shirt crafted from a luxurious silk-cotton blend. The relaxed fit and mother-of-pearl buttons elevate everyday dressing to new heights.",
    price: 220,
    originalPrice: null,
    category: "Tops",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Ivory", value: "#FFFFF0" },
      { name: "Sage", value: "#9CAF88" },
      { name: "Black", value: "#1A1A1A" }
    ],
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&h=1100&fit=crop"
    ],
    details: [
      "70% silk, 30% cotton",
      "Relaxed fit",
      "Mother-of-pearl buttons",
      "French seams throughout",
      "Single chest pocket",
      "Machine wash cold, lay flat to dry"
    ],
    styles: [STYLES.ELEGANT, STYLES.CLASSIC],
    status: null,
    isFeatured: true,
    isActive: true,
    stock: 100
  },
  {
    slug: "tailored-linen-trousers",
    name: "Tailored Linen Trousers",
    description: "Impeccably tailored trousers in breathable European linen. Features a high waist, pleated front, and tapered leg for a sophisticated silhouette.",
    price: 280,
    originalPrice: null,
    category: "Bottoms",
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: [
      { name: "Sand", value: "#C2B280" },
      { name: "Olive", value: "#556B2F" },
      { name: "Slate", value: "#708090" }
    ],
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=1100&fit=crop"
    ],
    details: [
      "100% European linen",
      "High-rise waist",
      "Double pleated front",
      "Side and back welt pockets",
      "Belt loops",
      "Dry clean recommended"
    ],
    styles: [STYLES.CLASSIC, STYLES.MINIMALIST],
    status: null,
    isFeatured: false,
    isActive: true,
    stock: 75
  },
  {
    slug: "cashmere-knit-sweater",
    name: "Cashmere Knit Sweater",
    description: "Pure indulgence in the form of a perfectly weighted cashmere sweater. Sourced from Inner Mongolian goats and knitted in Scotland.",
    price: 420,
    originalPrice: null,
    category: "Knitwear",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Oatmeal", value: "#D3C4A5" },
      { name: "Burgundy", value: "#722F37" },
      { name: "Forest", value: "#228B22" }
    ],
    images: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=800&h=1100&fit=crop"
    ],
    details: [
      "100% Grade-A Mongolian cashmere",
      "12-gauge knit",
      "Ribbed cuffs, collar, and hem",
      "Relaxed fit",
      "Hand wash cold or dry clean"
    ],
    styles: [STYLES.ELEGANT, STYLES.CASUAL],
    status: "limited",
    isFeatured: true,
    isActive: true,
    stock: 25
  },
  {
    slug: "structured-blazer",
    name: "Structured Wool Blazer",
    description: "A timeless single-breasted blazer with impeccable structure. Crafted from superfine merino wool with a half-canvas construction.",
    price: 490,
    originalPrice: 650,
    category: "Outerwear",
    sizes: ["36", "38", "40", "42", "44", "46"],
    colors: [
      { name: "Midnight", value: "#191970" },
      { name: "Charcoal", value: "#36454F" },
      { name: "Tan", value: "#D2B48C" }
    ],
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&h=1100&fit=crop"
    ],
    details: [
      "100% superfine merino wool",
      "Half-canvas construction",
      "Single-breasted, two-button",
      "Notched lapels",
      "Four-button sleeve detail",
      "Dry clean only"
    ],
    styles: [STYLES.CLASSIC, STYLES.ELEGANT],
    status: "sale",
    isFeatured: true,
    isActive: true,
    stock: 40
  },
  {
    slug: "minimalist-leather-belt",
    name: "Minimalist Leather Belt",
    description: "A refined belt handcrafted from full-grain Italian leather. The brushed silver buckle and clean lines make this an essential wardrobe foundation.",
    price: 145,
    originalPrice: null,
    category: "Accessories",
    sizes: ["30", "32", "34", "36", "38", "40"],
    colors: [
      { name: "Black", value: "#1A1A1A" },
      { name: "Cognac", value: "#9A463D" }
    ],
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&h=1100&fit=crop"
    ],
    details: [
      "Full-grain Italian leather",
      "Brushed silver hardware",
      "32mm width",
      "Feathered edges",
      "Made in Italy"
    ],
    styles: [STYLES.MINIMALIST, STYLES.CLASSIC],
    status: null,
    isFeatured: false,
    isActive: true,
    stock: 150
  },
  {
    slug: "cotton-jersey-tee",
    name: "Heavyweight Cotton Tee",
    description: "The perfect t-shirt, elevated. Made from heavyweight organic cotton jersey with a relaxed fit and slightly dropped shoulders.",
    price: 85,
    originalPrice: null,
    category: "Tops",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "White", value: "#FAFAFA" },
      { name: "Black", value: "#1A1A1A" },
      { name: "Heather Grey", value: "#9E9E9E" },
      { name: "Navy", value: "#1B2838" }
    ],
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&h=1100&fit=crop"
    ],
    details: [
      "100% organic cotton, 220gsm",
      "Relaxed fit",
      "Dropped shoulders",
      "Ribbed crew neck",
      "Machine wash cold"
    ],
    styles: [STYLES.STREETWEAR, STYLES.CASUAL],
    status: "new",
    isFeatured: false,
    isActive: true,
    stock: 200
  },
  {
    slug: "relaxed-denim-jacket",
    name: "Relaxed Selvedge Denim Jacket",
    description: "A modern take on the classic trucker jacket. Crafted from Japanese selvedge denim with a relaxed, boxy fit.",
    price: 340,
    originalPrice: null,
    category: "Outerwear",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Indigo", value: "#3F5277" },
      { name: "Washed Black", value: "#2F2F2F" }
    ],
    images: [
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800&h=1100&fit=crop"
    ],
    details: [
      "14oz Japanese selvedge denim",
      "100% cotton",
      "Relaxed, boxy fit",
      "Button front closure",
      "Chest flap pockets",
      "Machine wash cold"
    ],
    styles: [STYLES.STREETWEAR, STYLES.CASUAL],
    status: null,
    isFeatured: false,
    isActive: true,
    stock: 60
  },
  {
    slug: "merino-turtleneck",
    name: "Fine Merino Turtleneck",
    description: "A refined layering essential crafted from extra-fine merino wool. The slim fit and elegant rolled collar make this piece equally suited for boardrooms and evening gatherings.",
    price: 195,
    originalPrice: null,
    category: "Knitwear",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Cream", value: "#FFFDD0" },
      { name: "Black", value: "#1A1A1A" },
      { name: "Camel", value: "#C19A6B" }
    ],
    images: [
      "https://images.unsplash.com/photo-1638643391904-9b551ba91eaa?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1614975059251-992f11792571?w=800&h=1100&fit=crop"
    ],
    details: [
      "100% extra-fine merino wool",
      "18.5 micron",
      "Slim fit",
      "Rolled turtleneck",
      "Hand wash or dry clean"
    ],
    styles: [STYLES.ELEGANT, STYLES.MINIMALIST],
    status: null,
    isFeatured: false,
    isActive: true,
    stock: 80
  },
  {
    slug: "wide-leg-wool-trousers",
    name: "Wide Leg Wool Trousers",
    description: "Effortlessly sophisticated trousers with a contemporary wide leg silhouette. Crafted from fluid tropical wool for year-round comfort.",
    price: 320,
    originalPrice: 400,
    category: "Bottoms",
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: [
      { name: "Black", value: "#1A1A1A" },
      { name: "Charcoal", value: "#36454F" },
      { name: "Cream", value: "#FFFDD0" }
    ],
    images: [
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=1100&fit=crop"
    ],
    details: [
      "100% tropical wool",
      "High-rise waist",
      "Wide leg silhouette",
      "Side pockets",
      "Hidden hook and zip closure",
      "Dry clean only"
    ],
    styles: [STYLES.ELEGANT, STYLES.CLASSIC],
    status: "sale",
    isFeatured: false,
    isActive: true,
    stock: 35
  }
];

// Demo users with different roles
const demoUsers = [
  {
    email: "demo@atelier.com",
    password: "demo123",
    name: "Demo User",
    role: "USER",
    preferences: null
  },
  {
    email: "vip@atelier.com",
    password: "vip123",
    name: "VIP Member",
    role: "VIP",
    preferences: {
      favoriteStyle: STYLES.ELEGANT,
      preferredSize: "M",
      hasCompletedQuiz: true
    }
  },
  {
    email: "admin@atelier.com",
    password: "admin123",
    name: "Admin User",
    role: "ADMIN",
    preferences: null
  }
];

async function seed() {
  const uri = process.env.DATABASE_URL;
  
  if (!uri) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const dbName = uri.split('/').pop()?.split('?')[0] || 'atelier';
    const db = client.db(dbName);

    console.log('🌱 Starting MongoDB database seed...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await db.collection('cartItems').deleteMany({});
    await db.collection('orders').deleteMany({});
    await db.collection('products').deleteMany({});
    await db.collection('users').deleteMany({});
    await db.collection('site_config').deleteMany({});

    // Create demo users
    console.log('\n👤 Creating demo users...');
    const createdUsers = [];
    for (const userData of demoUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const result = await db.collection('users').insertOne({
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: userData.role,
        preferences: userData.preferences,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      createdUsers.push({ ...userData, _id: result.insertedId });
      console.log(`   ✓ ${userData.email} (${userData.role}) - ID: ${result.insertedId}`);
    }

    // Create products with variants (industry-standard schema)
    console.log('\n📦 Creating products with variants...');
    const createdProducts = [];
    for (const product of products) {
      // Generate variants array for each product
      const variants = generateVariants(product.slug, product.sizes, product.colors);
      const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
      const metadata = generateMetadata(product.category);
      
      const result = await db.collection('products').insertOne({
        ...product,
        variants, // New: variants array with SKU, size, color, stock
        inventory: variants, // Keep for backwards compatibility
        metadata, // New: fabric, fitType, careInstructions, madeIn
        stock: totalStock, // Total across all variants
        status: product.status || 'published', // draft or published
        publishAt: product.publishAt || null, // Scheduled publishing
        createdAt: new Date(),
        updatedAt: new Date()
      });
      createdProducts.push({ ...product, _id: result.insertedId, variants });
      console.log(`   ✓ ${product.name} ($${product.price}) - ${variants.length} variants, ${totalStock} total stock`);
    }

    // Add some items to cart for demo user
    console.log('\n🛒 Adding demo cart items...');
    const demoUser = createdUsers[0];
    if (createdProducts.length >= 2) {
      await db.collection('cartItems').insertOne({
        userId: demoUser._id,
        productId: createdProducts[0]._id,
        quantity: 1,
        size: 'M',
        color: { name: "Charcoal", value: "#36454F" },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await db.collection('cartItems').insertOne({
        userId: demoUser._id,
        productId: createdProducts[1]._id,
        quantity: 2,
        size: 'L',
        color: { name: "Ivory", value: "#FFFFF0" },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('   ✓ Added 2 items to demo cart');
    }

    // Create demo orders (30 days of data for analytics)
    console.log('\n📦 Creating demo orders for analytics...');
    const orderStatuses = ['pending', 'processing', 'shipped', 'delivered'];
    const numOrders = 50; // More orders for better analytics
    
    for (let i = 0; i < numOrders; i++) {
      const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      // More delivered orders (realistic distribution)
      const statusWeights = { delivered: 0.6, shipped: 0.2, processing: 0.15, pending: 0.05 };
      const rand = Math.random();
      let randomStatus = 'pending';
      let cumulative = 0;
      for (const [status, weight] of Object.entries(statusWeights)) {
        cumulative += weight;
        if (rand < cumulative) {
          randomStatus = status;
          break;
        }
      }
      
      const quantity = Math.floor(Math.random() * 3) + 1;
      const variant = randomProduct.inventory?.[Math.floor(Math.random() * (randomProduct.inventory?.length || 1))];
      
      // Spread orders over 30 days with more recent orders
      const daysAgo = Math.floor(Math.pow(Math.random(), 2) * 30); // Exponential - more recent orders
      const orderDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      
      await db.collection('orders').insertOne({
        orderNumber: `ATL-${orderDate.getTime()}-${i + 1}`,
        userId: randomUser._id,
        items: [{
          productId: randomProduct._id,
          name: randomProduct.name,
          price: randomProduct.price,
          quantity,
          size: variant?.size || randomProduct.sizes[0],
          color: variant ? { name: variant.color, value: variant.colorValue } : randomProduct.colors[0]
        }],
        totalAmount: randomProduct.price * quantity,
        status: randomStatus,
        shippingAddress: {
          name: randomUser.name,
          street: '123 Fashion Ave',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'USA'
        },
        createdAt: orderDate,
        updatedAt: new Date()
      });
    }
    console.log(`   ✓ Added ${numOrders} demo orders (30-day spread)`);

    // Create site config
    console.log('\n⚙️  Creating site config...');
    await db.collection('site_config').insertOne({
      key: 'hero',
      heroText: 'Redefine Elegance',
      heroSubtitle: 'Discover our curated collection of minimalist luxury. Timeless pieces crafted for the modern individual.',
      heroImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&q=80',
      heroVideo: 'https://videos.pexels.com/video-files/3831776/3831776-hd_1920_1080_25fps.mp4',
      seasonTag: 'Spring/Summer 2026',
      ctaText: 'Shop the Collection',
      ctaLink: '/shop',
      updatedAt: new Date()
    });
    
    // Promo banner config (disabled by default)
    await db.collection('site_config').insertOne({
      key: 'promo_banner',
      enabled: false,
      text: '',
      backgroundColor: '#10B981',
      textColor: '#FFFFFF',
      link: '',
      linkText: '',
      updatedAt: new Date()
    });
    console.log('   ✓ Site config created (hero + promo banner)');

    // Create indexes
    console.log('\n📑 Creating indexes...');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('products').createIndex({ slug: 1 }, { unique: true });
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ isFeatured: 1 });
    await db.collection('products').createIndex({ isActive: 1 });
    await db.collection('cartItems').createIndex({ userId: 1 });
    await db.collection('orders').createIndex({ userId: 1 });
    await db.collection('orders').createIndex({ status: 1 });
    await db.collection('site_config').createIndex({ key: 1 }, { unique: true });
    console.log('   ✓ Indexes created');

    console.log('\n✅ MongoDB seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${demoUsers.length}`);
    demoUsers.forEach(u => {
      console.log(`     • ${u.email} / ${u.password} (${u.role})`);
    });
    console.log(`   - Products: ${products.length} (with inventory matrix)`);
    console.log(`   - Orders: ${numOrders} (30-day analytics data)`);
    console.log(`   - Cart Items: 2`);
    console.log(`   - Site Config: 2 (hero + promo banner)`);
    console.log('\n🎨 Style Categories:');
    console.log(`   ${Object.values(STYLES).join(', ')}`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();
