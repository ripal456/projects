const express = require("express");
const recommendationController = require("../controllers/recommendationController");
const authController = require("../controllers/authController");

const router = express.Router();

// Get personalized recommendations (works for both logged-in and guest users)
router.get(
  "/",
  authController.isLoggedIn,
  recommendationController.getRecommendations
);

// Get popular tours
router.get("/popular", recommendationController.getPopularTours);

// Get trending tours
router.get("/trending", recommendationController.getTrendingTours);

// Get similar tours based on a specific tour
router.get("/similar/:tourId", recommendationController.getSimilarTours);

module.exports = router;
