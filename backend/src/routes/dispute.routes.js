const express = require('express');
const auth = require('../middleware/auth');
const controller = require('../controllers/dispute.controller');

const router = express.Router();

/**
 * @swagger
 * /disputes:
 *   post:
 *     summary: Raise a dispute
 *     tags: [Disputes]
 */
router.post('/', auth(['user', 'admin', 'superadmin']), controller.createDispute);

/**
 * @swagger
 * /disputes/me:
 *   get:
 *     summary: Get user disputes
 *     tags: [Disputes]
 */
router.get('/me', auth(['user', 'admin', 'superadmin']), controller.listMyDisputes);

/**
 * @swagger
 * /disputes:
 *   get:
 *     summary: List all disputes (Superadmin only)
 *     tags: [Disputes]
 */
router.get('/', auth(['superadmin']), controller.listAllDisputes);

/**
 * @swagger
 * /disputes/{id}:
 *   put:
 *     summary: Update dispute status (Superadmin only)
 *     tags: [Disputes]
 */
router.put('/:id', auth(['superadmin']), controller.updateDisputeStatus);

module.exports = router;
