/**
 * Public Site Config Routes
 * Returns site configuration for dynamic content
 */

const express = require('express');
const { getDB } = require('../lib/mongodb');

const router = express.Router();

/**
 * GET /api/config/hero
 * Get hero section configuration (public)
 */
router.get('/hero', async (req, res) => {
  try {
    const db = getDB();
    
    const heroConfig = await db.collection('site_config').findOne({ key: 'hero' });
    
    if (!heroConfig) {
      // Return defaults if not configured
      return res.json({
        heroText: 'Redefine Elegance',
        heroSubtitle: 'Discover our curated collection of minimalist luxury.',
        heroImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&q=80',
        heroVideo: 'https://videos.pexels.com/video-files/3831776/3831776-hd_1920_1080_25fps.mp4',
        seasonTag: 'Spring/Summer 2026',
        ctaText: 'Shop the Collection',
        ctaLink: '/shop',
      });
    }

    res.json({
      heroText: heroConfig.heroText,
      heroSubtitle: heroConfig.heroSubtitle,
      heroImage: heroConfig.heroImage,
      heroVideo: heroConfig.heroVideo,
      seasonTag: heroConfig.seasonTag,
      ctaText: heroConfig.ctaText,
      ctaLink: heroConfig.ctaLink,
    });
  } catch (error) {
    console.error('Error fetching hero config:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

/**
 * GET /api/settings/promo_banner
 * Get promotional banner configuration (public)
 */
router.get('/promo_banner', async (req, res) => {
  try {
    const db = getDB();
    
    const bannerConfig = await db.collection('site_config').findOne({ key: 'promo_banner' });
    
    if (!bannerConfig || !bannerConfig.enabled) {
      return res.json({ enabled: false });
    }

    res.json({
      enabled: true,
      text: bannerConfig.text,
      backgroundColor: bannerConfig.backgroundColor,
      textColor: bannerConfig.textColor,
      link: bannerConfig.link,
      linkText: bannerConfig.linkText,
    });
  } catch (error) {
    console.error('Error fetching promo banner config:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

module.exports = router;
