const express = require('express');
const Review = require('../models/Review');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: List reviews for a specific PG
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: pgId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get('/', async (req, res, next) => {
  try {
    const reviews = await Review.find({ pgId: req.query.pgId }).populate('userId', 'name').lean();
    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Add a review (User only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pgId
 *               - rating
 *             properties:
 *               pgId:
 *                 type: string
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', auth(['user']), async (req, res, next) => {
  try {
    const review = await Review.create({
      ...req.body,
      userId: req.user.id,
    });
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
