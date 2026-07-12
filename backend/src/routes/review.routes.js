const express = require('express');
const auth = require('../middleware/auth');
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
router.post('/', auth(['user']), controller.createReview);

module.exports = router;
