const express = require('express');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Record a payment
 *     tags: [Payments]
 */
router.post('/', auth(['user', 'admin', 'superadmin']), async (req, res, next) => {
  try {
    const {
      bookingId, amount, commissionAmount, adminRevenue, method, transactionId, month, year,
    } = req.body;
    const payment = await Payment.create({
      bookingId,
      userId: req.user.id,
      amount,
      commissionAmount: commissionAmount || 0,
      adminRevenue: adminRevenue || amount,
      method,
      transactionId,
      month,
      year,
      status: 'success',
    });
    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /payments/me:
 *   get:
 *     summary: Get payments
 *     tags: [Payments]
 */
router.get('/me', auth(['user', 'admin', 'superadmin']), async (req, res, next) => {
  try {
    const filter = req.user.type === 'superadmin' ? {} : { userId: req.user.id };
    const payments = await Payment.find(filter).lean();
    res.json(payments);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
