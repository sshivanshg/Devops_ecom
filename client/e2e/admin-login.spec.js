import { test, expect } from '@playwright/test';

test('login as ADMIN and open Admin Portal', async ({ page }) => {
  // API base in the frontend defaults to https://devops-ecom.onrender.com.
  // We mock by path so the test stays stable locally and in CI.
  await page.route('**/api/auth/login', async (route) => {
    const body = { email: 'admin@atelier.com', password: 'admin123' };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Login successful',
        token: 'test-admin-token',
        user: {
          id: '1',
          email: body.email,
          name: 'Admin User',
          role: 'ADMIN',
          preferences: null,
          isNewUser: false,
          createdAt: new Date().toISOString(),
        },
      }),
    });
  });

  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: '1',
          email: 'admin@atelier.com',
          name: 'Admin User',
          role: 'ADMIN',
          preferences: null,
          createdAt: new Date().toISOString(),
        },
      }),
    });
  });

  await page.route('**/api/products?featured=true*', async (route) => {
    const products = Array.from({ length: 4 }).map((_, i) => ({
      id: `p-${i + 1}`,
      slug: `product-${i + 1}`,
      name: `Product ${i + 1}`,
      category: i % 2 === 0 ? 'Tops' : 'Outerwear',
      description: 'Test product description',
      status: 'new',
      price: 100 + i * 10,
      originalPrice: 100 + i * 10,
      images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
      hoverImage: 'https://example.com/img2.jpg',
      sizes: ['XS', 'S', 'M', 'L'],
      inventory: [],
    }));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(products),
    });
  });

  await page.route('**/api/products/recommended*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        products: [],
        personalized: false,
        reason: null,
      }),
    });
  });

  await page.route('**/api/config/hero', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        heroText: 'Redefine Elegance',
        heroSubtitle:
          'Discover our curated collection of minimalist luxury. Timeless pieces crafted for the modern individual.',
        heroImage: 'https://example.com/hero.jpg',
        heroVideo: 'https://example.com/hero.mp4',
        seasonTag: 'Spring/Summer 2026',
        ctaText: 'Shop the Collection',
        ctaLink: '/shop',
      }),
    });
  });

  // Admin endpoints used on /admin (DashboardOverview)
  await page.route('**/api/admin/stats', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        recentOrders: [],
      }),
    });
  });

  await page.route('**/api/admin/analytics?days=30*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        kpis: {
          totalRevenue: 1000,
          totalOrders: 10,
          averageOrderValue: 100,
          activeCustomers: 5,
          revenueGrowth: 1.2,
          orderGrowth: 0.5,
        },
        revenueData: [],
        topProducts: [],
      }),
    });
  });

  // Start unauthenticated, app will redirect to /?auth=login
  await page.goto('/admin', { waitUntil: 'domcontentloaded' });

  // Open auth modal
  await page.getByRole('button', { name: 'Account' }).click();
  await expect(page.getByText('Welcome Back')).toBeVisible();

  await page.getByPlaceholder('Email Address').fill('admin@atelier.com');
  await page.getByPlaceholder('Password').fill('admin123');
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Navigate to admin portal (now authenticated)
  await page.goto('/admin');
  await expect(page.getByText('Admin Portal')).toBeVisible();
  await expect(page.getByText('Revenue Over Time')).toBeVisible();
});

