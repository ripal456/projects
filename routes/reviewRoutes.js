const express = require('express');
const ReviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(ReviewController.GetAllreviews)
  .post(
    authController.restrictTo('user'),
    ReviewController.setUserIds,
    ReviewController.CreateReview
  );
router
  .route('/:id')
  .get(ReviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    ReviewController.UpdateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    ReviewController.DeleteReview
  );
module.exports = router;
