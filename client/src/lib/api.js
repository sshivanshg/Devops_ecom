/**
 * API Client
 * Centralized API calls to the backend
 */

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ============ Products API ============

/**
 * Fetch all products with optional filters
 */
export async function getProducts(params = {}) {
  const searchParams = new URLSearchParams();
  
  if (params.featured) searchParams.set('featured', 'true');
  if (params.category) searchParams.set('category', params.category);
  if (params.status) searchParams.set('status', params.status);

  const query = searchParams.toString();
  return fetchAPI(`/api/products${query ? `?${query}` : ''}`);
}

/**
 * Fetch a single product by slug or ID
 */
export async function getProduct(slugOrId) {
  return fetchAPI(`/api/products/${slugOrId}`);
}

/**
 * Fetch featured products for homepage
 */
export async function getFeaturedProducts() {
  return getProducts({ featured: true });
}

// ============ Cart API ============

/**
 * Fetch cart items for a user
 */
export async function getCart(userId) {
  return fetchAPI(`/api/cart?userId=${userId}`);
}

/**
 * Add item to cart
 */
export async function addToCart({ userId, productId, quantity = 1, size, color }) {
  return fetchAPI('/api/cart', {
    method: 'POST',
    body: JSON.stringify({ userId, productId, quantity, size, color }),
  });
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(itemId, quantity) {
  return fetchAPI(`/api/cart/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });
}

/**
 * Remove item from cart
 */
export async function removeFromCart(itemId) {
  return fetchAPI(`/api/cart/${itemId}`, {
    method: 'DELETE',
  });
}

/**
 * Clear entire cart
 */
export async function clearCart(userId) {
  return fetchAPI(`/api/cart?userId=${userId}`, {
    method: 'DELETE',
  });
}

// ============ Users API ============

/**
 * Register a new user
 */
export async function registerUser({ email, password, name }) {
  return fetchAPI('/api/users/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

/**
 * Login user
 */
export async function loginUser({ email, password }) {
  return fetchAPI('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Get user profile
 */
export async function getUser(userId) {
  return fetchAPI(`/api/users/${userId}`);
}
