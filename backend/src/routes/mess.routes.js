const express = require('express');
const auth = require('../middleware/auth');
const controller = require('../controllers/mess.controller');

const router = express.Router();

/**
 * @swagger
 * /mess:
 *   get:
 *     summary: List all mess menus
 *     tags: [MessMenu]
 */
router.get('/', controller.listMenus);

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
router.get('/:pgId', controller.getMenuByPg);

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
router.put('/', auth(['admin']), controller.upsertMenu);

module.exports = router;
