const express = require('express');
const sentimentController = require('../controllers/sentimentController');
const authController = require('../controllers/authController');

const router = express.Router();

// Analyze text sentiment (public)
router.post('/analyze', sentimentController.analyzeReview);

// Check for spam (public)
router.post('/check-spam', sentimentController.checkSpam);

// Get sentiment analysis for a specific tour's reviews
router.get('/tour/:tourId', sentimentController.analyzeTourReviews);

// Get sentiment summary for all tours (admin only)
router.get(
  '/all-tours',
  authController.protect,
  authController.restrictTo('admin'),
  sentimentController.getAllToursSentiment
);

module.exports = router;
