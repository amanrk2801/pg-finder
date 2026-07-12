const express = require('express');
const auth = require('../middleware/auth');
const controller = require('../controllers/settings.controller');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Settings:
 *       type: object
 *       properties:
 *         platformFee:
 *           type: number
 *           description: Global platform fee percentage
 */

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Get platform settings
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Settings object
 */
router.get('/', controller.getSettings);

/**
 * @swagger
 * /settings:
 *   put:
 *     summary: Update platform settings (Superadmin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Settings'
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/', auth(['superadmin']), controller.updateSettings);

module.exports = router;
