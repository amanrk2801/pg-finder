const express = require('express');
const auth = require('../middleware/auth');
const controller = require('../controllers/community.controller');

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
 *         category:
 *           type: string
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
router.get('/', controller.listPosts);

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
router.post('/', auth(['user']), controller.createPost);

module.exports = router;
