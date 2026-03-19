const express = require('express');
const MessMenu = require('../models/MessMenu');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /mess/{pgId}:
 *   get:
 *     summary: Get mess menu for a PG
 *     tags: [MessMenu]
 *     parameters:
 *       - in: path
 *         name: pgId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mess menu details
 */
router.get('/:pgId', async (req, res, next) => {
  try {
    const menu = await MessMenu.findOne({ pgId: req.params.pgId }).lean();
    res.json(menu);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /mess:
 *   put:
 *     summary: Update mess menu (Admin only)
 *     tags: [MessMenu]
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
 *               - menu
 *             properties:
 *               pgId:
 *                 type: string
 *               menu:
 *                 type: object
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/', auth(['admin']), async (req, res, next) => {
  try {
    const { pgId, menu } = req.body;
    const updatedMenu = await MessMenu.findOneAndUpdate(
      { pgId },
      { menu },
      { upsert: true, new: true },
    );
    res.json(updatedMenu);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
