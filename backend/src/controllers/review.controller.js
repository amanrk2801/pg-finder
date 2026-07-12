const Review = require('../models/Review');

async function listReviews(req, res, next) {
  try {
    const reviews = await Review.find({ pgId: req.query.pgId }).populate('userId', 'name').lean();
    return res.json(reviews);
  } catch (err) {
    return next(err);
  }
}

async function createReview(req, res, next) {
  try {
    const review = await Review.create({
      ...req.body,
      userId: req.user.id,
    });
    return res.status(201).json(review);
  } catch (err) {
    return next(err);
  }
}

module.exports = { listReviews, createReview };
