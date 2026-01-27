/**
 * Prisma Seed Script for MongoDB
 * Populates the database with 10 luxury fashion products
 * Run with: npm run db:seed
 * 
 * NOTE: MongoDB auto-generates ObjectIds, so we don't specify id fields
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Luxury product data with Unsplash images
// Note: No 'id' fields - MongoDB will auto-generate ObjectIds
const products = [
  {
    slug: "oversized-wool-coat",
    name: "Oversized Wool Coat",
    description: "A masterfully tailored oversized coat crafted from premium Italian wool. Features a relaxed silhouette with dropped shoulders, notched lapels, and a two-button closure. Fully lined in silk for luxurious comfort.",
    price: 580,
    originalPrice: null,
    category: "Outerwear",
    sizes: "XS,S,M,L,XL",
    colors: JSON.stringify([
      { name: "Charcoal", value: "#36454F" },
      { name: "Camel", value: "#C19A6B" },
      { name: "Navy", value: "#1B2838" }
    ]),
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1608063615781-e2ef8c73d114?w=800&h=1100&fit=crop"
    ]),
    details: JSON.stringify([
      "100% Italian virgin wool outer",
      "100% silk lining",
      "Two-button front closure",
      "Side welt pockets",
      "Interior chest pocket",
      "Dry clean only"
    ]),
    status: "new",
    isFeatured: true,
    stock: 50
  },
  {
    slug: "silk-blend-shirt",
    name: "Silk Blend Relaxed Shirt",
    description: "An effortlessly elegant shirt crafted from a luxurious silk-cotton blend. The relaxed fit and mother-of-pearl buttons elevate everyday dressing to new heights.",
    price: 220,
    originalPrice: null,
    category: "Tops",
    sizes: "XS,S,M,L,XL,XXL",
    colors: JSON.stringify([
      { name: "Ivory", value: "#FFFFF0" },
      { name: "Sage", value: "#9CAF88" },
      { name: "Black", value: "#1A1A1A" }
    ]),
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&h=1100&fit=crop"
    ]),
    details: JSON.stringify([
      "70% silk, 30% cotton",
      "Relaxed fit",
      "Mother-of-pearl buttons",
      "French seams throughout",
      "Single chest pocket",
      "Machine wash cold, lay flat to dry"
    ]),
    status: null,
    isFeatured: true,
    stock: 100
  },
  {
    slug: "tailored-linen-trousers",
    name: "Tailored Linen Trousers",
    description: "Impeccably tailored trousers in breathable European linen. Features a high waist, pleated front, and tapered leg for a sophisticated silhouette that transitions seamlessly from office to evening.",
    price: 280,
    originalPrice: null,
    category: "Bottoms",
    sizes: "28,30,32,34,36,38",
    colors: JSON.stringify([
      { name: "Sand", value: "#C2B280" },
      { name: "Olive", value: "#556B2F" },
      { name: "Slate", value: "#708090" }
    ]),
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=1100&fit=crop"
    ]),
    details: JSON.stringify([
      "100% European linen",
      "High-rise waist",
      "Double pleated front",
      "Side and back welt pockets",
      "Belt loops",
      "Dry clean recommended"
    ]),
    status: null,
    isFeatured: false,
    stock: 75
  },
  {
    slug: "cashmere-knit-sweater",
    name: "Cashmere Knit Sweater",
    description: "Pure indulgence in the form of a perfectly weighted cashmere sweater. Sourced from Inner Mongolian goats and knitted in Scotland, this piece embodies understated luxury.",
    price: 420,
    originalPrice: null,
    category: "Knitwear",
    sizes: "XS,S,M,L,XL",
    colors: JSON.stringify([
      { name: "Oatmeal", value: "#D3C4A5" },
      { name: "Burgundy", value: "#722F37" },
      { name: "Forest", value: "#228B22" }
    ]),
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=800&h=1100&fit=crop"
    ]),
    details: JSON.stringify([
      "100% Grade-A Mongolian cashmere",
      "12-gauge knit",
      "Ribbed cuffs, collar, and hem",
      "Relaxed fit",
      "Hand wash cold or dry clean"
    ]),
    status: "limited",
    isFeatured: true,
    stock: 25
  },
  {
    slug: "structured-blazer",
    name: "Structured Wool Blazer",
    description: "A timeless single-breasted blazer with impeccable structure. Crafted from superfine merino wool with a half-canvas construction for shape retention and breathability.",
    price: 490,
    originalPrice: 650,
    category: "Outerwear",
    sizes: "36,38,40,42,44,46",
    colors: JSON.stringify([
      { name: "Midnight", value: "#191970" },
      { name: "Charcoal", value: "#36454F" },
      { name: "Tan", value: "#D2B48C" }
    ]),
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&h=1100&fit=crop"
    ]),
    details: JSON.stringify([
      "100% superfine merino wool",
      "Half-canvas construction",
      "Single-breasted, two-button",
      "Notched lapels",
      "Four-button sleeve detail",
      "Dry clean only"
    ]),
    status: "sale",
    isFeatured: true,
    stock: 40
  },
  {
    slug: "minimalist-leather-belt",
    name: "Minimalist Leather Belt",
    description: "A refined belt handcrafted from full-grain Italian leather. The brushed silver buckle and clean lines make this an essential wardrobe foundation.",
    price: 145,
    originalPrice: null,
    category: "Accessories",
    sizes: "30,32,34,36,38,40",
    colors: JSON.stringify([
      { name: "Black", value: "#1A1A1A" },
      { name: "Cognac", value: "#9A463D" }
    ]),
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&h=1100&fit=crop"
    ]),
    details: JSON.stringify([
      "Full-grain Italian leather",
      "Brushed silver hardware",
      "32mm width",
      "Feathered edges",
      "Made in Italy"
    ]),
    status: null,
    isFeatured: false,
    stock: 150
  },
  {
    slug: "cotton-jersey-tee",
    name: "Heavyweight Cotton Tee",
    description: "The perfect t-shirt, elevated. Made from heavyweight organic cotton jersey with a relaxed fit and slightly dropped shoulders for effortless style.",
    price: 85,
    originalPrice: null,
    category: "Tops",
    sizes: "XS,S,M,L,XL,XXL",
    colors: JSON.stringify([
      { name: "White", value: "#FAFAFA" },
      { name: "Black", value: "#1A1A1A" },
      { name: "Heather Grey", value: "#9E9E9E" },
      { name: "Navy", value: "#1B2838" }
    ]),
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&h=1100&fit=crop"
    ]),
    details: JSON.stringify([
      "100% organic cotton, 220gsm",
      "Relaxed fit",
      "Dropped shoulders",
      "Ribbed crew neck",
      "Machine wash cold"
    ]),
    status: "new",
    isFeatured: false,
    stock: 200
  },
  {
    slug: "relaxed-denim-jacket",
    name: "Relaxed Selvedge Denim Jacket",
    description: "A modern take on the classic trucker jacket. Crafted from Japanese selvedge denim with a relaxed, boxy fit. Pre-washed for softness while retaining beautiful fade potential.",
    price: 340,
    originalPrice: null,
    category: "Outerwear",
    sizes: "XS,S,M,L,XL",
    colors: JSON.stringify([
      { name: "Indigo", value: "#3F5277" },
      { name: "Washed Black", value: "#2F2F2F" }
    ]),
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800&h=1100&fit=crop"
    ]),
    details: JSON.stringify([
      "14oz Japanese selvedge denim",
      "100% cotton",
      "Relaxed, boxy fit",
      "Button front closure",
      "Chest flap pockets",
      "Machine wash cold"
    ]),
    status: null,
    isFeatured: false,
    stock: 60
  },
  {
    slug: "merino-turtleneck",
    name: "Fine Merino Turtleneck",
    description: "A refined layering essential crafted from extra-fine merino wool. The slim fit and elegant rolled collar make this piece equally suited for boardrooms and evening gatherings.",
    price: 195,
    originalPrice: null,
    category: "Knitwear",
    sizes: "XS,S,M,L,XL",
    colors: JSON.stringify([
      { name: "Cream", value: "#FFFDD0" },
      { name: "Black", value: "#1A1A1A" },
      { name: "Camel", value: "#C19A6B" }
    ]),
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1638643391904-9b551ba91eaa?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1614975059251-992f11792571?w=800&h=1100&fit=crop"
    ]),
    details: JSON.stringify([
      "100% extra-fine merino wool",
      "18.5 micron",
      "Slim fit",
      "Rolled turtleneck",
      "Hand wash or dry clean"
    ]),
    status: null,
    isFeatured: false,
    stock: 80
  },
  {
    slug: "wide-leg-wool-trousers",
    name: "Wide Leg Wool Trousers",
    description: "Effortlessly sophisticated trousers with a contemporary wide leg silhouette. Crafted from fluid tropical wool for year-round comfort and impeccable drape.",
    price: 320,
    originalPrice: 400,
    category: "Bottoms",
    sizes: "28,30,32,34,36,38",
    colors: JSON.stringify([
      { name: "Black", value: "#1A1A1A" },
      { name: "Charcoal", value: "#36454F" },
      { name: "Cream", value: "#FFFDD0" }
    ]),
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&h=1100&fit=crop",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=1100&fit=crop"
    ]),
    details: JSON.stringify([
      "100% tropical wool",
      "High-rise waist",
      "Wide leg silhouette",
      "Side pockets",
      "Hidden hook and zip closure",
      "Dry clean only"
    ]),
    status: "sale",
    isFeatured: false,
    stock: 35
  }
];

// Demo user data
const demoUser = {
  email: "demo@atelier.com",
  password: "demo123",
  name: "Demo User"
};

async function main() {
  console.log('🌱 Starting MongoDB database seed...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.cartItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  console.log('👤 Creating demo user...');
  const hashedPassword = await bcrypt.hash(demoUser.password, 10);
  const user = await prisma.user.create({
    data: {
      email: demoUser.email,
      password: hashedPassword,
      name: demoUser.name
    }
  });
  console.log(`   Created user: ${user.email} (ID: ${user.id})`);

  // Create products
  console.log('\n📦 Creating products...');
  const createdProducts = [];
  for (const product of products) {
    const created = await prisma.product.create({
      data: product
    });
    createdProducts.push(created);
    console.log(`   ✓ ${created.name} ($${created.price}) - ID: ${created.id}`);
  }

  // Add some items to cart for demo
  console.log('\n🛒 Adding demo cart items...');
  if (createdProducts.length >= 2) {
    await prisma.cartItem.create({
      data: {
        userId: user.id,  // MongoDB ObjectId (string)
        productId: createdProducts[0].id,  // MongoDB ObjectId (string)
        quantity: 1,
        size: 'M',
        color: JSON.stringify({ name: "Charcoal", value: "#36454F" })
      }
    });
    await prisma.cartItem.create({
      data: {
        userId: user.id,
        productId: createdProducts[1].id,
        quantity: 2,
        size: 'L',
        color: JSON.stringify({ name: "Ivory", value: "#FFFFF0" })
      }
    });
    console.log('   ✓ Added 2 items to demo cart');
  }

  console.log('\n✅ MongoDB seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: 1 (${demoUser.email} / ${demoUser.password})`);
  console.log(`   - Products: ${products.length}`);
  console.log(`   - Cart Items: 2`);
  console.log(`\n💡 User ID for testing: ${user.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
