const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");

/**
 * AI-Powered Tour Recommendation Engine
 * Uses multiple strategies to recommend tours:
 * 1. Content-based: Similar tours based on attributes
 * 2. Collaborative: What similar users booked
 * 3. Popularity: Top-rated and trending tours
 */

class TourRecommendationEngine {
  /**
   * Get personalized recommendations for a user
   * @param {String} userId - The user's ID
   * @param {Number} limit - Number of recommendations to return
   */
  static async getPersonalizedRecommendations(userId, limit = 6) {
    try {
      // Get user's booking history
      const userBookings = await Booking.find({ user: userId }).populate(
        "tour"
      );
      const bookedTourIds = userBookings
        .map((b) => b.tour?._id?.toString())
        .filter(Boolean);

      if (bookedTourIds.length === 0) {
        // New user - return popular tours
        return await this.getPopularTours(limit);
      }

      // Extract user preferences from booked tours
      const userPreferences = await this.analyzeUserPreferences(userBookings);

      // Get recommendations based on preferences
      const recommendations = await this.getContentBasedRecommendations(
        userPreferences,
        bookedTourIds,
        limit
      );

      return recommendations;
    } catch (error) {
      console.error("Recommendation error:", error);
      return await this.getPopularTours(limit);
    }
  }

  /**
   * Analyze user preferences from booking history
   */
  static async analyzeUserPreferences(bookings) {
    const preferences = {
      avgPrice: 0,
      avgDuration: 0,
      difficulties: {},
      avgGroupSize: 0,
    };

    const validBookings = bookings.filter((b) => b.tour);

    if (validBookings.length === 0) return preferences;

    let totalPrice = 0;
    let totalDuration = 0;
    let totalGroupSize = 0;

    validBookings.forEach((booking) => {
      const tour = booking.tour;
      totalPrice += tour.price || 0;
      totalDuration += tour.duration || 0;
      totalGroupSize += tour.maxGroupSize || 0;

      if (tour.difficulty) {
        preferences.difficulties[tour.difficulty] =
          (preferences.difficulties[tour.difficulty] || 0) + 1;
      }
    });

    preferences.avgPrice = totalPrice / validBookings.length;
    preferences.avgDuration = totalDuration / validBookings.length;
    preferences.avgGroupSize = totalGroupSize / validBookings.length;

    // Find preferred difficulty
    preferences.preferredDifficulty = Object.keys(
      preferences.difficulties
    ).reduce(
      (a, b) =>
        preferences.difficulties[a] > preferences.difficulties[b] ? a : b,
      "medium"
    );

    return preferences;
  }

  /**
   * Get content-based recommendations
   */
  static async getContentBasedRecommendations(preferences, excludeIds, limit) {
    const priceRange = preferences.avgPrice * 0.5; // 50% price range
    const durationRange = Math.max(2, preferences.avgDuration * 0.5);

    const query = {
      _id: { $nin: excludeIds },
      price: {
        $gte: preferences.avgPrice - priceRange,
        $lte: preferences.avgPrice + priceRange,
      },
      duration: {
        $gte: Math.max(1, preferences.avgDuration - durationRange),
        $lte: preferences.avgDuration + durationRange,
      },
    };

    // Prioritize preferred difficulty
    if (preferences.preferredDifficulty) {
      query.difficulty = preferences.preferredDifficulty;
    }

    let tours = await Tour.find(query)
      .sort({ ratingsAverage: -1, ratingsQuantity: -1 })
      .limit(limit);

    // If not enough results, relax constraints
    if (tours.length < limit) {
      const additionalTours = await Tour.find({
        _id: { $nin: [...excludeIds, ...tours.map((t) => t._id)] },
      })
        .sort({ ratingsAverage: -1 })
        .limit(limit - tours.length);

      tours = [...tours, ...additionalTours];
    }

    return tours.map((tour) => ({
      ...tour.toObject(),
      recommendationReason: this.getRecommendationReason(tour, preferences),
    }));
  }

  /**
   * Get recommendation reason for UI display
   */
  static getRecommendationReason(tour, preferences) {
    const reasons = [];

    if (tour.difficulty === preferences.preferredDifficulty) {
      reasons.push(`Matches your preferred ${tour.difficulty} difficulty`);
    }

    if (tour.ratingsAverage >= 4.5) {
      reasons.push("Highly rated by travelers");
    }

    if (
      Math.abs(tour.price - preferences.avgPrice) <
      preferences.avgPrice * 0.2
    ) {
      reasons.push("Within your typical budget");
    }

    if (Math.abs(tour.duration - preferences.avgDuration) <= 2) {
      reasons.push("Similar duration to your past trips");
    }

    return reasons.length > 0 ? reasons[0] : "Popular choice";
  }

  /**
   * Get popular tours for new users
   */
  static async getPopularTours(limit = 6) {
    const tours = await Tour.find()
      .sort({ ratingsAverage: -1, ratingsQuantity: -1 })
      .limit(limit);

    return tours.map((tour) => ({
      ...tour.toObject(),
      recommendationReason:
        tour.ratingsAverage >= 4.5
          ? "Top rated tour"
          : "Popular among travelers",
    }));
  }

  /**
   * Get similar tours based on a specific tour
   */
  static async getSimilarTours(tourId, limit = 4) {
    const baseTour = await Tour.findById(tourId);

    if (!baseTour) return [];

    const priceRange = baseTour.price * 0.3;
    const durationRange = 2;

    const similarTours = await Tour.find({
      _id: { $ne: tourId },
      $or: [
        { difficulty: baseTour.difficulty },
        {
          price: {
            $gte: baseTour.price - priceRange,
            $lte: baseTour.price + priceRange,
          },
        },
        {
          duration: {
            $gte: baseTour.duration - durationRange,
            $lte: baseTour.duration + durationRange,
          },
        },
      ],
    })
      .sort({ ratingsAverage: -1 })
      .limit(limit);

    return similarTours.map((tour) => ({
      ...tour.toObject(),
      recommendationReason: this.getSimilarityReason(tour, baseTour),
    }));
  }

  /**
   * Get similarity reason
   */
  static getSimilarityReason(tour, baseTour) {
    if (tour.difficulty === baseTour.difficulty) {
      return `Same ${tour.difficulty} difficulty level`;
    }
    if (Math.abs(tour.price - baseTour.price) < baseTour.price * 0.2) {
      return "Similar price range";
    }
    if (Math.abs(tour.duration - baseTour.duration) <= 1) {
      return "Similar trip duration";
    }
    return "You might also like";
  }

  /**
   * Get trending tours (recently popular)
   */
  static async getTrendingTours(limit = 6) {
    // Get tours with recent bookings
    const recentBookings = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: "$tour",
          bookingCount: { $sum: 1 },
        },
      },
      { $sort: { bookingCount: -1 } },
      { $limit: limit },
    ]);

    if (recentBookings.length === 0) {
      return await this.getPopularTours(limit);
    }

    const tourIds = recentBookings.map((b) => b._id);
    const tours = await Tour.find({ _id: { $in: tourIds } });

    return tours.map((tour) => ({
      ...tour.toObject(),
      recommendationReason: "Trending this month",
    }));
  }
}

module.exports = TourRecommendationEngine;
