const Review = require('./../models/reviewModel');
// const catchAsync = require('./../utils/catchAsync');
const Factory = require('./../controllers/handlerFactory');

exports.setUserIds = (req, res, next) => {
  //allow nested routes

  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

//  reviews functionlity
exports.GetAllreviews = Factory.getAll(Review);
exports.getReview = Factory.getOne(Review);
exports.CreateReview = Factory.createOne(Review);
exports.UpdateReview = Factory.updateOne(Review);
exports.DeleteReview = Factory.deleteOne(Review);
