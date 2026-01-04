const SentimentAnalyzer = require('../utils/sentimentAnalysis');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Analyze sentiment of a single review
 */
exports.analyzeReview = catchAsync(async (req, res, next) => {
  const { text } = req.body;

  if (!text) {
    return next(new AppError('Please provide review text to analyze', 400));
  }

  const analysis = SentimentAnalyzer.analyze(text);

  res.status(200).json({
    status: 'success',
    data: {
      analysis
    }
  });
});

/**
 * Analyze all reviews for a specific tour
 */
exports.analyzeTourReviews = catchAsync(async (req, res, next) => {
  const { tourId } = req.params;

  const reviews = await Review.find({ tour: tourId });

  if (reviews.length === 0) {
    return res.status(200).json({
      status: 'success',
      message: 'No reviews found for this tour',
      data: {
        analysis: null
      }
    });
  }

  const analysis = SentimentAnalyzer.analyzeMultiple(reviews);

  res.status(200).json({
    status: 'success',
    data: {
      tourId,
      analysis
    }
  });
});

/**
 * Get sentiment summary for all tours
 */
exports.getAllToursSentiment = catchAsync(async (req, res, next) => {
  const reviews = await Review.find().populate('tour', 'name slug');

  // Group reviews by tour
  const tourReviews = {};
  reviews.forEach(review => {
    if (review.tour) {
      const tourId = review.tour._id.toString();
      if (!tourReviews[tourId]) {
        tourReviews[tourId] = {
          tour: review.tour,
          reviews: []
        };
      }
      tourReviews[tourId].reviews.push(review);
    }
  });

  // Analyze each tour
  const tourSentiments = Object.values(tourReviews).map(({ tour, reviews }) => {
    const analysis = SentimentAnalyzer.analyzeMultiple(reviews);
    return {
      tourId: tour._id,
      tourName: tour.name,
      tourSlug: tour.slug,
      sentiment: analysis.overall,
      averageScore: analysis.averageScore,
      totalReviews: analysis.totalReviews,
      distribution: analysis.distributionPercent
    };
  });

  // Sort by sentiment score
  tourSentiments.sort((a, b) => b.averageScore - a.averageScore);

  res.status(200).json({
    status: 'success',
    results: tourSentiments.length,
    data: {
      tourSentiments
    }
  });
});

/**
 * Check if a review might be spam
 */
exports.checkSpam = catchAsync(async (req, res, next) => {
  const { text, rating } = req.body;

  if (!text) {
    return next(new AppError('Please provide review text', 400));
  }

  const spamCheck = SentimentAnalyzer.detectSpam(text, rating || 5);
  const sentiment = SentimentAnalyzer.analyze(text);

  res.status(200).json({
    status: 'success',
    data: {
      spam: spamCheck,
      sentiment
    }
  });
});

/**
 * Analyze a review before submission (middleware)
 */
exports.analyzeBeforeCreate = catchAsync(async (req, res, next) => {
  if (req.body.review) {
    const sentiment = SentimentAnalyzer.analyze(req.body.review);
    const spamCheck = SentimentAnalyzer.detectSpam(req.body.review, req.body.rating);

    // Attach analysis to request for potential use
    req.reviewAnalysis = {
      sentiment,
      spamCheck
    };

    // Optionally flag potential spam reviews
    if (spamCheck.isPotentialSpam) {
      console.log('⚠️ Potential spam review detected:', {
        text: req.body.review.substring(0, 50),
        flags: spamCheck.flags
      });
    }
  }

  next();
});
