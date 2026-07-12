const express = require('express');
const auth = require('../middleware/auth');
const validateBody = require('../middleware/validate');
const controller = require('../controllers/pg.controller');

const router = express.Router();

const PG_RULES = {
  name: { type: 'string', trim: true, min: 2, max: 120 },
  address: { type: 'string', trim: true, min: 5, max: 300 },
  rent: { type: 'number', min: 1, max: 10000000 },
  totalRooms: { type: 'number', min: 0, max: 10000 },
  occupiedRooms: { type: 'number', min: 0, max: 10000 },
  totalBeds: { type: 'number', min: 0, max: 50000 },
  vacantBeds: { type: 'number', min: 0, max: 50000 },
  gender: { type: 'string', enum: ['male', 'female', 'unisex', 'Male', 'Female', 'Unisex'] },
  facilities: { type: 'array', max: 50 },
  safetyMeasures: { type: 'array', max: 50 },
  images: { type: 'array', max: 15 },
};

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
router.post(
  '/',
  auth(['admin']),
  validateBody({
    ...PG_RULES,
    name: { ...PG_RULES.name, required: true },
    address: { ...PG_RULES.address, required: true },
    rent: { ...PG_RULES.rent, required: true },
  }),
  controller.createPg,
);

/**
 * @swagger
 * /pgs/{id}:
 *   put:
 *     summary: Update a PG
 *     tags: [PGs]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', auth(['admin', 'superadmin']), validateBody(PG_RULES), controller.updatePg);

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
