const express = require('express');
const auth = require('../middleware/auth');
const controller = require('../controllers/payment.controller');

const router = express.Router();

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Record a payment
 *     tags: [Payments]
 */
router.post('/', auth(['user', 'admin', 'superadmin']), controller.createPayment);

/**
 * @swagger
 * /payments/me:
 *   get:
 *     summary: Get payments
 *     tags: [Payments]
 */
router.get('/me', auth(['user', 'admin', 'superadmin']), controller.listMyPayments);

/**
 * @swagger
 * /payments/owner:
 *   get:
 *     summary: Get payments across PGs owned by the logged-in admin (or all, for superadmin)
 *     tags: [Payments]
 */
router.get('/owner', auth(['admin', 'superadmin']), controller.listOwnerPayments);

module.exports = router;
