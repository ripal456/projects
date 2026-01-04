const TourRecommendationEngine = require("../utils/aiRecommendations");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

/**
 * Get personalized tour recommendations for logged-in user
 */
exports.getRecommendations = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 6;

  let recommendations;

  if (req.user) {
    // Personalized recommendations for logged-in users
    recommendations = await TourRecommendationEngine.getPersonalizedRecommendations(
      req.user._id,
      limit
    );
  } else {
    // Popular tours for guests
    recommendations = await TourRecommendationEngine.getPopularTours(limit);
  }

  res.status(200).json({
    status: "success",
    results: recommendations.length,
    data: {
      recommendations,
    },
  });
});

/**
 * Get similar tours based on a specific tour
 */
exports.getSimilarTours = catchAsync(async (req, res, next) => {
  const { tourId } = req.params;
  const limit = parseInt(req.query.limit) || 4;

  if (!tourId) {
    return next(new AppError("Please provide a tour ID", 400));
  }

  const similarTours = await TourRecommendationEngine.getSimilarTours(
    tourId,
    limit
  );

  res.status(200).json({
    status: "success",
    results: similarTours.length,
    data: {
      tours: similarTours,
    },
  });
});

/**
 * Get trending tours
 */
exports.getTrendingTours = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 6;

  const trendingTours = await TourRecommendationEngine.getTrendingTours(limit);

  res.status(200).json({
    status: "success",
    results: trendingTours.length,
    data: {
      tours: trendingTours,
    },
  });
});

/**
 * Get popular tours (for homepage)
 */
exports.getPopularTours = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 6;

  const popularTours = await TourRecommendationEngine.getPopularTours(limit);

  res.status(200).json({
    status: "success",
    results: popularTours.length,
    data: {
      tours: popularTours,
    },
  });
});
