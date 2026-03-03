const express = require('express');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');

const router = express.Router();

// User: record a payment (to be called after gateway success)
router.post('/', auth(['user']), async (req, res, next) => {
  try {
    const {
      bookingId, amount, method, transactionId, month, year,
    } = req.body;
    const payment = await Payment.create({
      bookingId,
      userId: req.user.id,
      amount,
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

// User: list own payments
router.get('/me', auth(['user']), async (req, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.user.id }).lean();
    res.json(payments);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

