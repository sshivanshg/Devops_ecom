<p align="center">
  <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=300&fit=crop" alt="ATELIER Banner" width="100%" />
</p>

<h1 align="center">✦ ATELIER ✦</h1>

<p align="center">
  <strong>A high-performance, personalized luxury fashion e-commerce experience</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Native-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Cloudinary-CDN-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary" />
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#project-structure">Structure</a> •
  <a href="#roadmap">Roadmap</a>
</p>

---

## 📸 Preview

<table>
  <tr>
    <td width="50%">
      <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=400&fit=crop" alt="Storefront" />
      <p align="center"><strong>Storefront</strong></p>
    </td>
    <td width="50%">
      <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop" alt="Admin Portal" />
      <p align="center"><strong>Admin Portal</strong></p>
    </td>
  </tr>
</table>

---

## ✨ Features

### 🎨 Personalized Shopping Experience
- **Style Quiz** — Captures customer preferences (style, fit, colors) on first visit
- **AI-Driven Recommendations** — MongoDB aggregation pipeline scores products based on user preferences
- **Role-Based Views** — Different experiences for Guests, Users, VIPs, and Admins

### 📦 Dynamic Inventory System
- **Variant Matrix** — Manage Size × Color combinations with individual SKU tracking
- **Real-Time Stock Updates** — Inline editing with instant database sync
- **Smart Size/Color Selectors** — Frontend automatically disables out-of-stock variants

### 🛠️ Admin Command Center
- **Product Management** — Create, edit, toggle active status, schedule product drops
- **Order Tracking** — View and update order statuses (Pending → Shipped → Delivered)
- **Sales Analytics** — Revenue charts, top sellers, KPI cards with growth metrics
- **Site Configuration** — Dynamic Hero section and promotional banners

### 🖼️ Media Pipeline (Cloudinary)
- **Direct Browser Uploads** — Upload widget with drag-and-drop support
- **Automatic Optimization** — WebP/AVIF delivery based on browser support
- **CDN Distribution** — Global edge caching for instant image loads
- **Responsive Sizing** — On-the-fly image transformations

### 🔐 Security & Access Control
- **JWT Authentication** — Secure token-based auth with role embedding
- **Admin Route Protection** — Middleware guards for `/admin/*` routes
- **Preview Mode** — Admins can view unpublished products on the live site

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + Vite | Fast SPA with HMR |
| **Styling** | Tailwind CSS | Utility-first styling |
| **UI Components** | Shadcn/UI + Radix | Accessible component primitives |
| **Animations** | Framer Motion | Smooth transitions & gestures |
| **Backend** | Express.js | RESTful API server |
| **Database** | MongoDB (Native Driver) | Document store with aggregations |
| **Authentication** | JWT + bcrypt | Stateless auth with hashed passwords |
| **Media** | Cloudinary | Image upload, optimization, CDN |
| **Charts** | Recharts | Analytics visualizations |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **MongoDB Atlas** account (or local MongoDB)
- **Cloudinary** account (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/sshivanshg/Devops_ecom.git
cd Devops_ecom

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Environment Variables

Create `.env` files in both `server/` and `client/` directories:

**`server/.env`**
```env
# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/atelier?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars

# Server
PORT=5001
NODE_ENV=development

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:5001/api
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=atelier_unsigned
```

### Database Setup

```bash
# From the server directory
cd server

# Seed the database with demo data
npm run db:seed
```

This creates:
- **3 Users** — demo@atelier.com (USER), vip@atelier.com (VIP), admin@atelier.com (ADMIN)
- **10 Products** — With full variant inventories
- **50 Orders** — 30-day spread for analytics
- **Site Config** — Hero section and promo banner

### Running the Application

```bash
# Terminal 1: Start the backend
cd server
npm run dev

# Terminal 2: Start the frontend
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

**Demo Credentials:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@atelier.com | admin123 |
| VIP | vip@atelier.com | vip123 |
| User | demo@atelier.com | demo123 |

---

## 🏗️ Architecture

### Why MongoDB Native Driver?

We chose the native MongoDB driver over Prisma/Mongoose for several reasons:

1. **Aggregation Pipelines** — Our recommendation engine uses `$addFields` and `$sort` to calculate match scores, which is cleaner with the native driver
2. **Performance** — Direct driver calls have less overhead than ORM abstractions
3. **Flexibility** — Full access to MongoDB features without adapter limitations

### Why Cloudinary?

1. **Owner Experience** — Upload 10MB photos from iPhone → automatically optimized to 50KB
2. **Performance** — Global CDN ensures fast loads worldwide
3. **Database Health** — MongoDB stores tiny URL strings, not binary blobs

### API Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   React SPA     │────▶│   Express API   │────▶│    MongoDB      │
│   (Vite)        │     │   (REST)        │     │    Atlas        │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   Cloudinary    │     │   JWT Auth      │
│   (Media CDN)   │     │   (Middleware)  │
└─────────────────┘     └─────────────────┘
```

---

## 📁 Project Structure

```
Devops_Ecom/
├── client/                    # React Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/         # Admin-specific components
│   │   │   │   ├── InventoryTable.jsx
│   │   │   │   ├── ProductForm.jsx
│   │   │   │   └── ProductImageUpload.jsx
│   │   │   ├── cart/          # Shopping cart
│   │   │   ├── layout/        # Navbar, Footer
│   │   │   ├── marketing/     # Newsletter, popups
│   │   │   ├── personalization/
│   │   │   │   ├── AuthModal.jsx
│   │   │   │   ├── PersonalizedView.jsx
│   │   │   │   └── StyleQuiz.jsx
│   │   │   ├── products/      # ProductCard, Grid, SizeGuide
│   │   │   ├── sections/      # Homepage sections
│   │   │   └── ui/            # Shadcn components
│   │   ├── contexts/          # AuthContext
│   │   ├── lib/               # API, utils, cloudinary
│   │   └── pages/             # Route components
│   └── package.json
│
├── server/                    # Express Backend
│   ├── src/
│   │   ├── lib/
│   │   │   ├── mongodb.js     # DB connection singleton
│   │   │   ├── cloudinary.js  # Cloudinary utilities
│   │   │   └── recommendations.js
│   │   ├── middleware/
│   │   │   └── auth.js        # JWT authentication
│   │   ├── routes/
│   │   │   ├── admin.js       # Protected admin routes
│   │   │   ├── auth.js        # Login, register
│   │   │   ├── cart.js        # Cart operations
│   │   │   ├── config.js      # Site settings
│   │   │   ├── media.js       # Cloudinary uploads
│   │   │   ├── products.js    # Public product routes
│   │   │   └── users.js       # User management
│   │   ├── app.js             # Express app setup
│   │   ├── index.js           # Server entry point
│   │   └── seed.js            # Database seeder
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── integration.yml    # CI/CD pipeline
│
└── README.md
```

---

## 🗺️ Roadmap

- [ ] **Stripe Integration** — Secure checkout with Stripe Elements
- [ ] **Email Automation** — Order confirmations, shipping updates via SendGrid
- [ ] **Customer Reviews** — Product reviews with photo uploads
- [ ] **Wishlist Sync** — Persistent wishlists across devices
- [ ] **Size Predictor** — ML-based size recommendations from past orders

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  <sub>Built with ☕ and attention to detail</sub>
</p>
