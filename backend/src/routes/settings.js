const express = require('express');
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');

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
router.get('/', async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ platformFee: 5 });
    }
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

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
router.put('/', auth(['superadmin']), async (req, res, next) => {
  try {
    const { platformFee } = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ platformFee });
    } else {
      settings.platformFee = platformFee;
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
