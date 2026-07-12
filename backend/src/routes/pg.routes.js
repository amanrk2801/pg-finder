const express = require('express');
const auth = require('../middleware/auth');
const controller = require('../controllers/pg.controller');

const router = express.Router();

/**
 * @swagger
 * /pgs:
 *   get:
 *     summary: List PGs (Role-based visibility)
 *     tags: [PGs]
 */
router.get('/', auth(['user', 'admin', 'superadmin'], true), controller.listPgs);

/**
 * @swagger
 * /pgs/{id}:
 *   get:
 *     summary: Get PG by ID
 *     tags: [PGs]
 */
router.get('/:id', controller.getPgById);

/**
 * @swagger
 * /pgs:
 *   post:
 *     summary: Create a new PG (Admin only)
 *     tags: [PGs]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', auth(['admin']), controller.createPg);

/**
 * @swagger
 * /pgs/{id}:
 *   put:
 *     summary: Update a PG
 *     tags: [PGs]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', auth(['admin', 'superadmin']), controller.updatePg);

/**
 * @swagger
 * /pgs/{id}:
 *   delete:
 *     summary: Delete a PG (Superadmin only)
 *     tags: [PGs]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', auth(['superadmin']), controller.deletePg);

module.exports = router;
