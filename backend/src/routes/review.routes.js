const express = require('express');
const auth = require('../middleware/auth');
const validateBody = require('../middleware/validate');
const controller = require('../controllers/review.controller');

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
router.get('/', controller.listReviews);

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
router.post(
  '/',
  auth(['user']),
  validateBody({
    pgId: { type: 'string', required: true },
    rating: { type: 'number', required: true, min: 1, max: 5 },
    comment: { type: 'string', trim: true, max: 1000 },
  }),
  controller.createReview,
);

module.exports = router;
