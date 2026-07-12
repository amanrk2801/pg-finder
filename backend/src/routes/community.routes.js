const express = require('express');
const auth = require('../middleware/auth');
const validateBody = require('../middleware/validate');
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
router.post(
  '/',
  auth(['user']),
  validateBody({
    title: { type: 'string', required: true, trim: true, min: 2, max: 120 },
    description: { type: 'string', required: true, trim: true, min: 2, max: 2000 },
    category: { type: 'string', enum: ['Sale', 'Job', 'Service'] },
    contactInfo: { type: 'string', trim: true, max: 120 },
  }),
  controller.createPost,
);

/**
 * @swagger
 * /community/{id}:
 *   put:
 *     summary: Update own post (e.g. mark Closed)
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/:id',
  auth(['user']),
  validateBody({
    status: { type: 'string', enum: ['Active', 'Closed'] },
    title: { type: 'string', trim: true, min: 2, max: 120 },
    description: { type: 'string', trim: true, min: 2, max: 2000 },
    contactInfo: { type: 'string', trim: true, max: 120 },
  }),
  controller.updatePost,
);

/**
 * @swagger
 * /community/{id}:
 *   delete:
 *     summary: Delete own post (superadmin may delete any)
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', auth(['user', 'superadmin']), controller.deletePost);

module.exports = router;
