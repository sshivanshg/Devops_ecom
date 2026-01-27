/**
 * Recommendation Engine
 * Uses MongoDB Aggregation Pipeline to score and rank products
 * based on user preferences from the Style Quiz
 */

const { getDB, toObjectId, isValidObjectId } = require('./mongodb');

/**
 * Get personalized product recommendations using aggregation pipeline
 * @param {string} userId - User ID (optional)
 * @returns {Promise<{products: Array, personalized: boolean, reason: string|null}>}
 */
async function getRecommendedProducts(userId) {
  const db = getDB();
  
  let user = null;
  let preferences = null;
  
  // Fetch user preferences if userId provided
  if (userId && isValidObjectId(userId)) {
    user = await db.collection('users').findOne({ _id: toObjectId(userId) });
    preferences = user?.preferences;
  }
  
  // If user hasn't completed quiz, return featured products
  if (!preferences?.hasCompletedQuiz) {
    const featuredProducts = await db.collection('products')
      .find({ isFeatured: true, isActive: { $ne: false } })
      .sort({ createdAt: -1 })
      .limit(8)
      .toArray();
    
    return {
      products: featuredProducts.map(p => ({
        ...p,
        id: p._id.toString(),
        hoverImage: p.images?.[1] || p.images?.[0],
        matchScore: null,
        matchReason: null
      })),
      personalized: false,
      reason: null
    };
  }
  
  // Build the aggregation pipeline for smart scoring
  const pipeline = [
    // First stage: filter active products only
    { $match: { isActive: { $ne: false } } },
    ...buildScoringPipeline(preferences)
  ];
  
  const products = await db.collection('products')
    .aggregate(pipeline)
    .toArray();
  
  return {
    products: products.map(p => ({
      ...p,
      id: p._id.toString(),
      hoverImage: p.images?.[1] || p.images?.[0]
    })),
    personalized: true,
    reason: `your ${preferences.favoriteStyle} style`
  };
}

/**
 * Build MongoDB aggregation pipeline for product scoring
 * @param {Object} preferences - User preferences from style quiz
 * @returns {Array} Aggregation pipeline stages
 */
function buildScoringPipeline(preferences) {
  const { favoriteStyle, colorPalette, preferredFit, wardrobePriority } = preferences;
  
  // Map color palette to actual color names for matching
  const colorMapping = {
    neutrals: ['Black', 'White', 'Charcoal', 'Cream', 'Ivory', 'Oatmeal', 'Heather Grey'],
    earth: ['Camel', 'Sand', 'Olive', 'Cognac', 'Tan', 'Burgundy', 'Forest'],
    deep: ['Navy', 'Midnight', 'Burgundy', 'Forest', 'Indigo'],
    bold: ['Black', 'White', 'Sage', 'Indigo']
  };
  
  const preferredColors = colorMapping[colorPalette] || [];
  
  // Map fit preferences to categories
  const fitCategoryMapping = {
    slim: ['Tops', 'Knitwear'],
    regular: ['Tops', 'Bottoms', 'Accessories'],
    relaxed: ['Outerwear', 'Tops'],
    oversized: ['Outerwear', 'Knitwear']
  };
  
  const preferredCategories = fitCategoryMapping[preferredFit] || [];
  
  // Map style to product style tags
  const styleTagMapping = {
    minimalist: 'minimalist',
    classic: 'classic',
    streetwear: 'streetwear',
    elegant: 'elegant',
    casual: 'casual'
  };
  
  const preferredStyleTag = styleTagMapping[favoriteStyle];
  
  return [
    // Stage 1: Calculate match score based on preferences
    {
      $addFields: {
        matchScore: {
          $add: [
            // +15 points if product style matches user's favorite style
            {
              $cond: [
                { $in: [preferredStyleTag, { $ifNull: ['$styles', []] }] },
                15,
                0
              ]
            },
            // +10 points if category matches fit preference
            {
              $cond: [
                { $in: ['$category', preferredCategories] },
                10,
                0
              ]
            },
            // +5 points for each matching color
            {
              $multiply: [
                {
                  $size: {
                    $filter: {
                      input: { $ifNull: ['$colors', []] },
                      cond: { $in: ['$$this.name', preferredColors] }
                    }
                  }
                },
                5
              ]
            },
            // +8 points for featured products (quality indicator)
            {
              $cond: ['$isFeatured', 8, 0]
            },
            // +5 points for products on sale (value for 'quality' priority)
            {
              $cond: [
                {
                  $and: [
                    { $eq: [wardrobePriority, 'quality'] },
                    { $ne: ['$originalPrice', null] }
                  ]
                },
                5,
                0
              ]
            }
          ]
        },
        // Add reason for recommendation
        matchReason: {
          $cond: [
            { $in: [preferredStyleTag, { $ifNull: ['$styles', []] }] },
            { $concat: ['Matches your ', favoriteStyle, ' style'] },
            {
              $cond: [
                { $in: ['$category', preferredCategories] },
                { $concat: ['Great for your ', preferredFit, ' fit preference'] },
                'Curated selection'
              ]
            }
          ]
        }
      }
    },
    // Stage 2: Sort by match score (highest first)
    {
      $sort: { matchScore: -1, createdAt: -1 }
    },
    // Stage 3: Limit to top 8 recommendations
    {
      $limit: 8
    }
  ];
}

/**
 * Get products by style category
 * @param {string} style - Style tag to filter by
 * @param {number} limit - Max products to return
 * @returns {Promise<Array>}
 */
async function getProductsByStyle(style, limit = 8) {
  const db = getDB();
  
  const products = await db.collection('products')
    .find({ styles: style, isActive: { $ne: false } })
    .sort({ isFeatured: -1, createdAt: -1 })
    .limit(limit)
    .toArray();
  
  return products.map(p => ({
    ...p,
    id: p._id.toString(),
    hoverImage: p.images?.[1] || p.images?.[0]
  }));
}

module.exports = {
  getRecommendedProducts,
  getProductsByStyle,
  buildScoringPipeline
};
