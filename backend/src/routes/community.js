const express = require('express');
const CommunityPost = require('../models/CommunityPost');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CommunityPost:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: string
 *           enum: [Rent, Sell, Issue, Other]
 *         contactInfo:
 *           type: string
 */

/**
 * @swagger
 * /community:
 *   get:
 *     summary: List all community posts
 *     tags: [Community]
 *     responses:
 *       200:
 *         description: List of posts
 */
router.get('/', async (req, res, next) => {
  try {
    const posts = await CommunityPost.find().sort({ createdAt: -1 }).lean();
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /community:
 *   post:
 *     summary: Create a community post (User only)
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommunityPost'
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', auth(['user']), async (req, res, next) => {
  try {
    const post = await CommunityPost.create({
      ...req.body,
      userId: req.user.id,
    });
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
